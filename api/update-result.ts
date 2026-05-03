type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type UpdatePayload = {
  password?: string;
  matchdayNumber?: number;
  home?: number;
  away?: number;
  homeScore?: number | null;
  awayScore?: number | null;
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
  "GITHUB_RESULTS_PATH",
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

  const validationError = validatePayload(payload);
  if (validationError) {
    response.status(400).json({ error: validationError });
    return;
  }

  try {
    const file = await getGitHubFile();
    const currentContent = Buffer.from(file.content, "base64").toString("utf8");
    const nextContent = updateLeagueData(currentContent, payload as Required<UpdatePayload>);

    if (nextContent === currentContent) {
      response.status(200).json({ message: "Результат вже був таким самим" });
      return;
    }

    const homeScoreText = payload.homeScore === null ? "null" : payload.homeScore;
    const awayScoreText = payload.awayScore === null ? "null" : payload.awayScore;
    const message = `Update matchday ${payload.matchdayNumber}: ${payload.home} ${homeScoreText}-${awayScoreText} ${payload.away}`;
    const commit = await putGitHubFile(nextContent, file.sha, message);

    response.status(200).json({
      message: "Результат оновлено",
      commitUrl: commit.content?.html_url,
    });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Не вдалося оновити результат.",
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

function validatePayload(payload: UpdatePayload): string | null {
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

function isValidScore(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && Number(value) >= 0);
}

async function getGitHubFile(): Promise<GitHubFile> {
  const url = githubContentsUrl();
  const result = await fetch(url, {
    headers: githubHeaders(),
  });
  const payload = await result.json();

  if (!result.ok) {
    throw new Error(payload.message ?? "GitHub не віддав файл з результатами.");
  }

  return payload as GitHubFile;
}

async function putGitHubFile(content: string, sha: string, message: string) {
  const url = githubContentsUrl();
  const result = await fetch(url, {
    method: "PUT",
    headers: {
      ...githubHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
      branch: process.env.GITHUB_BRANCH,
    }),
  });
  const payload = await result.json();

  if (!result.ok) {
    throw new Error(payload.message ?? "GitHub не прийняв commit.");
  }

  return payload;
}

function githubContentsUrl() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;
  const path = process.env.GITHUB_RESULTS_PATH;

  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
}

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function updateLeagueData(content: string, payload: Required<UpdatePayload>) {
  const lines = content.split("\n");
  const matchdayLineIndex = lines.findIndex(line => line.includes(`number: ${payload.matchdayNumber},`));

  if (matchdayLineIndex === -1) {
    throw new Error(`Тур ${payload.matchdayNumber} не знайдено.`);
  }

  const matchesStartIndex = lines.findIndex((line, index) => index > matchdayLineIndex && line.includes("matches: ["));
  const matchesEndIndex = lines.findIndex((line, index) => index > matchesStartIndex && line.trim() === "],");

  if (matchesStartIndex === -1 || matchesEndIndex === -1) {
    throw new Error(`Матчі туру ${payload.matchdayNumber} не знайдені.`);
  }

  const matchLineIndex = lines.findIndex((line, index) => {
    if (index <= matchesStartIndex || index >= matchesEndIndex) return false;

    return line.includes(`home: ${payload.home},`)
      && line.includes(`away: ${payload.away},`)
      && line.includes("homeScore:")
      && line.includes("awayScore:");
  });

  if (matchLineIndex === -1) {
    throw new Error(`Матч ${payload.home} - ${payload.away} не знайдено у турі ${payload.matchdayNumber}.`);
  }

  const indent = lines[matchLineIndex].match(/^\s*/)?.[0] ?? "      ";
  const nextHomeScore = payload.homeScore === null ? "null" : String(payload.homeScore);
  const nextAwayScore = payload.awayScore === null ? "null" : String(payload.awayScore);

  lines[matchLineIndex] = `${indent}{ home: ${payload.home}, away: ${payload.away}, homeScore: ${nextHomeScore}, awayScore: ${nextAwayScore} },`;

  const today = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Kyiv",
  }).format(new Date());

  return lines.join("\n").replace(/export const lastUpdated = ".*?";/, `export const lastUpdated = "${today}";`);
}
