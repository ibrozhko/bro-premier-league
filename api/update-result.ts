type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type Platform = "PS5" | "Xbox" | "PC";

type Player = {
  id: number;
  name: string;
  club: string;
  platform: Platform;
  clubColor: string;
};

type Match = {
  home: number;
  away: number;
  homeScore: number | null;
  awayScore: number | null;
};

type Matchday = {
  number: number;
  date: string;
  label: string;
  matches: Match[];
  bye: number;
};

type LeagueData = {
  season: number;
  lastUpdated: string;
  players: Player[];
  matchdays: Matchday[];
};

type UpdatePayload = {
  password?: string;
  action?: "updateResult" | "updatePlayers" | "startSeason";
  matchdayNumber?: number;
  home?: number;
  away?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  players?: Player[];
  confirmation?: string;
  season?: number;
};

type GitHubFile = {
  content: string;
  sha: string;
};

const requiredEnvVars = [
  "ADMIN_PASSWORD",
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
  "GITHUB_BRANCH",
] as const;

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const missingEnvVar = requiredEnvVars.find(key => !process.env[key]);
  if (missingEnvVar) {
    response.status(500).json({ error: `Missing environment variable: ${missingEnvVar}` });
    return;
  }

  const payload = parseBody(request.body);
  if (!payload) {
    response.status(400).json({ error: "Некоректний JSON запит." });
    return;
  }

  if (payload.password !== process.env.ADMIN_PASSWORD) {
    response.status(401).json({ error: "Неправильний пароль." });
    return;
  }

  try {
    const file = await getGitHubFile(dataPath());
    const currentData = JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as LeagueData;
    const action = payload.action ?? "updateResult";
    const today = formatToday();

    if (action === "updateResult") {
      const validationError = validateResultPayload(payload);
      if (validationError) {
        response.status(400).json({ error: validationError });
        return;
      }

      const nextData = updateResult(currentData, payload as Required<UpdatePayload>, today);
      await commitFiles(
        [{ path: dataPath(), content: formatJson(nextData) }],
        `Update matchday ${payload.matchdayNumber}: ${payload.home} ${scoreText(payload.homeScore)}-${scoreText(payload.awayScore)} ${payload.away}`,
      );

      response.status(200).json({ message: "Результат оновлено" });
      return;
    }

    if (action === "updatePlayers") {
      const validationError = validatePlayersPayload(payload.players, currentData.matchdays);
      if (validationError) {
        response.status(400).json({ error: validationError });
        return;
      }

      const nextData = {
        ...currentData,
        players: payload.players!,
        lastUpdated: today,
      };

      await commitFiles(
        [{ path: dataPath(), content: formatJson(nextData) }],
        `Update season ${currentData.season} players`,
      );

      response.status(200).json({ message: "Гравців оновлено" });
      return;
    }

    if (action === "startSeason") {
      const expectedConfirmation = `SEASON ${currentData.season + 1}`;
      if (payload.confirmation !== expectedConfirmation) {
        response.status(400).json({ error: `Для підтвердження введи ${expectedConfirmation}.` });
        return;
      }

      const nextSeason = payload.season && Number.isInteger(payload.season)
        ? payload.season
        : currentData.season + 1;

      if (nextSeason <= currentData.season) {
        response.status(400).json({ error: "Новий сезон має бути більшим за поточний." });
        return;
      }

      const archivePath = `src/data/archive/season-${currentData.season}.json`;
      const nextData: LeagueData = {
        ...currentData,
        season: nextSeason,
        lastUpdated: today,
        matchdays: currentData.matchdays.map(matchday => ({
          ...matchday,
          matches: matchday.matches.map(match => ({
            ...match,
            homeScore: null,
            awayScore: null,
          })),
        })),
      };

      await commitFiles(
        [
          { path: archivePath, content: formatJson(currentData) },
          { path: dataPath(), content: formatJson(nextData) },
        ],
        `Start season ${nextSeason}`,
      );

      response.status(200).json({ message: `Сезон ${nextSeason} створено, попередній сезон заархівовано` });
      return;
    }

    response.status(400).json({ error: "Невідома дія адмінки." });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Не вдалося оновити дані.",
    });
  }
}

function parseBody(body: unknown): UpdatePayload | null {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as UpdatePayload;
    } catch {
      return null;
    }
  }

  if (body && typeof body === "object") {
    return body as UpdatePayload;
  }

  return null;
}

function validateResultPayload(payload: UpdatePayload): string | null {
  if (!Number.isInteger(payload.matchdayNumber) || !Number.isInteger(payload.home) || !Number.isInteger(payload.away)) {
    return "Не вистачає даних матчу.";
  }

  if (!isValidScore(payload.homeScore) || !isValidScore(payload.awayScore)) {
    return "Рахунок має бути числом 0 або більше, або null для очищення.";
  }

  if ((payload.homeScore === null) !== (payload.awayScore === null)) {
    return "Для очищення результату обидва значення мають бути null.";
  }

  return null;
}

function validatePlayersPayload(players: Player[] | undefined, matchdays: Matchday[]): string | null {
  if (!Array.isArray(players) || players.length === 0) {
    return "Список гравців порожній.";
  }

  const ids = new Set<number>();
  const usedIds = new Set<number>();
  matchdays.forEach(matchday => {
    usedIds.add(matchday.bye);
    matchday.matches.forEach(match => {
      usedIds.add(match.home);
      usedIds.add(match.away);
    });
  });

  for (const player of players) {
    if (!Number.isInteger(player.id) || player.id <= 0) return "ID гравця має бути додатним числом.";
    if (ids.has(player.id)) return `ID ${player.id} повторюється.`;
    if (!player.name.trim()) return `Гравець ${player.id}: імʼя не може бути порожнім.`;
    if (!player.club.trim()) return `Гравець ${player.id}: клуб не може бути порожнім.`;
    if (!["PS5", "Xbox", "PC"].includes(player.platform)) return `Гравець ${player.id}: невідома платформа.`;
    if (!player.clubColor.trim()) return `Гравець ${player.id}: колір не може бути порожнім.`;
    ids.add(player.id);
  }

  for (const usedId of usedIds) {
    if (!ids.has(usedId)) {
      return `Гравця з ID ${usedId} не можна видалити, бо він є в календарі.`;
    }
  }

  return null;
}

function isValidScore(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && Number(value) >= 0);
}

function updateResult(data: LeagueData, payload: Required<UpdatePayload>, today: string): LeagueData {
  let found = false;

  const matchdays = data.matchdays.map(matchday => {
    if (matchday.number !== payload.matchdayNumber) return matchday;

    return {
      ...matchday,
      matches: matchday.matches.map(match => {
        if (match.home !== payload.home || match.away !== payload.away) return match;

        found = true;
        return {
          ...match,
          homeScore: payload.homeScore,
          awayScore: payload.awayScore,
        };
      }),
    };
  });

  if (!found) {
    throw new Error(`Матч ${payload.home} - ${payload.away} не знайдено у турі ${payload.matchdayNumber}.`);
  }

  return {
    ...data,
    lastUpdated: today,
    matchdays,
  };
}

async function getGitHubFile(path: string): Promise<GitHubFile> {
  const result = await fetch(githubContentsUrl(path), {
    headers: githubHeaders(),
  });
  const payload = await result.json();

  if (!result.ok) {
    throw new Error(payload.message ?? `GitHub не віддав файл ${path}.`);
  }

  return payload as GitHubFile;
}

async function commitFiles(files: { path: string; content: string }[], message: string) {
  const ref = await githubJson(`https://api.github.com/repos/${owner()}/${repo()}/git/ref/heads/${branch()}`);
  const baseCommit = await githubJson(ref.object.url);
  const treeItems = await Promise.all(files.map(async file => {
    const blob = await githubJson(`https://api.github.com/repos/${owner()}/${repo()}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({
        content: file.content,
        encoding: "utf-8",
      }),
    });

    return {
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    };
  }));

  const tree = await githubJson(`https://api.github.com/repos/${owner()}/${repo()}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: treeItems,
    }),
  });

  const commit = await githubJson(`https://api.github.com/repos/${owner()}/${repo()}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [baseCommit.sha],
    }),
  });

  await githubJson(`https://api.github.com/repos/${owner()}/${repo()}/git/refs/heads/${branch()}`, {
    method: "PATCH",
    body: JSON.stringify({
      sha: commit.sha,
      force: false,
    }),
  });

  return commit;
}

async function githubJson(url: string, init: RequestInit = {}) {
  const result = await fetch(url, {
    ...init,
    headers: {
      ...githubHeaders(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = await result.json();

  if (!result.ok) {
    throw new Error(payload.message ?? "GitHub не прийняв запит.");
  }

  return payload;
}

function githubContentsUrl(path: string) {
  return `https://api.github.com/repos/${owner()}/${repo()}/contents/${path}?ref=${branch()}`;
}

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function owner() {
  return process.env.GITHUB_OWNER;
}

function repo() {
  return process.env.GITHUB_REPO;
}

function branch() {
  return process.env.GITHUB_BRANCH;
}

function dataPath() {
  const configuredPath = process.env.GITHUB_DATA_PATH ?? process.env.GITHUB_RESULTS_PATH;
  if (!configuredPath) return "src/data/leagueData.json";

  return configuredPath.endsWith(".ts")
    ? configuredPath.replace(/leagueData\.ts$/, "leagueData.json")
    : configuredPath;
}

function formatJson(data: unknown) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function scoreText(score: number | null | undefined) {
  return score === null || score === undefined ? "null" : score;
}

function formatToday() {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Kyiv",
  }).format(new Date());
}
