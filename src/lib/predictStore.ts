import {
  getUserTotalPoints,
  predictMatches,
  scorePrediction,
  type MatchPrediction,
  type PredictUser,
  type TournamentPrediction,
} from "@/data/predictData";

const USERS_KEY = "bpl-predict-users";
const SESSION_KEY = "bpl-predict-session";

function defaultTournamentPrediction(team: string): TournamentPrediction {
  return {
    champion: "Argentina",
    finalist: "Brazil",
    topScorer: "Kylian Mbappe",
    darkHorse: "Ukraine",
    favoriteTeam: team,
    pointsChampion: 0,
    pointsFinalist: 0,
    pointsTopScorer: 0,
    pointsDarkHorse: 0,
  };
}

function seedPrediction(matchId: number, predictedHomeScore: number, predictedAwayScore: number, predictedAdvancing?: "home" | "away") {
  const match = predictMatches.find(item => item.id === matchId);
  const base = { matchId, predictedHomeScore, predictedAwayScore, predictedAdvancing };
  const points = match ? scorePrediction(match, base) : { pointsOutcome: 0, pointsAdvancing: 0 };
  return { ...base, ...points, updatedAt: "2026-06-11T10:00:00.000Z" };
}

const seededUsers: PredictUser[] = [
  {
    id: "admin",
    username: "admin",
    password: "bpl2026",
    inviteCode: "BPL-ADMIN",
    invitesRemaining: 99,
    isAdmin: true,
    createdAt: "2026-06-01T10:00:00.000Z",
    tournamentPrediction: { ...defaultTournamentPrediction("Ukraine"), pointsChampion: 25 },
    predictions: {
      1: seedPrediction(1, 2, 0),
      2: seedPrediction(2, 1, 1),
      3: seedPrediction(3, 1, 2),
      4: seedPrediction(4, 2, 1),
    },
  },
  {
    id: "andrii",
    username: "andrii",
    password: "demo",
    inviteCode: "BPL-A7K2",
    invitesRemaining: 2,
    isAdmin: false,
    createdAt: "2026-06-02T10:00:00.000Z",
    tournamentPrediction: { ...defaultTournamentPrediction("France"), champion: "France", finalist: "Argentina", topScorer: "Harry Kane" },
    predictions: {
      1: seedPrediction(1, 1, 0),
      2: seedPrediction(2, 2, 0),
      3: seedPrediction(3, 0, 2),
    },
  },
  {
    id: "misha",
    username: "misha",
    password: "demo",
    inviteCode: "BPL-M4Q8",
    invitesRemaining: 1,
    isAdmin: false,
    createdAt: "2026-06-03T10:00:00.000Z",
    tournamentPrediction: { ...defaultTournamentPrediction("Brazil"), champion: "Brazil", finalist: "Spain", topScorer: "Vinicius Junior" },
    predictions: {
      1: seedPrediction(1, 2, 1),
      2: seedPrediction(2, 0, 0),
      4: seedPrediction(4, 3, 1),
    },
  },
  {
    id: "ihor",
    username: "ihor",
    password: "demo2026",
    inviteCode: "BPL-IHOR",
    invitesRemaining: 3,
    isAdmin: false,
    createdAt: "2026-06-11T10:00:00.000Z",
    tournamentPrediction: {
      ...defaultTournamentPrediction("Ukraine"),
      champion: "Argentina",
      finalist: "France",
      topScorer: "Kylian Mbappe",
      darkHorse: "Ukraine",
    },
    predictions: {},
  },
];

function readUsers(): PredictUser[] {
  if (typeof window === "undefined") return seededUsers;
  const saved = window.localStorage.getItem(USERS_KEY);
  if (!saved) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }

  try {
    const users = JSON.parse(saved) as PredictUser[];
    const missingSeedUsers = seededUsers.filter(seedUser =>
      !users.some(user => user.username.toLowerCase() === seedUser.username.toLowerCase()),
    );

    if (missingSeedUsers.length > 0) {
      const nextUsers = [...users, ...missingSeedUsers];
      window.localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      return nextUsers;
    }

    return users;
  } catch {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }
}

function writeUsers(users: PredictUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function inviteCodeFor(username: string) {
  const cleaned = username.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "X");
  const random = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "7");
  return `BPL-${cleaned}${random}`.slice(0, 12);
}

export function getPredictUsers() {
  return readUsers().map(user => ({ ...user, totalPoints: getUserTotalPoints(user) }));
}

export function getCurrentPredictUser() {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return readUsers().find(user => user.id === id) ?? null;
}

export function loginPredictUser(username: string, password: string) {
  const user = readUsers().find(item => item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password);
  if (!user) {
    throw new Error("Невірний нікнейм або пароль.");
  }
  window.localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function logoutPredictUser() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function registerPredictUser(input: {
  username: string;
  password: string;
  inviteCode: string;
  tournamentPrediction: TournamentPrediction;
}) {
  const users = readUsers();
  const username = input.username.trim();
  const inviter = users.find(user => user.inviteCode.toUpperCase() === input.inviteCode.trim().toUpperCase());

  if (username.length < 3) throw new Error("Нікнейм має містити щонайменше 3 символи.");
  if (input.password.length < 6) throw new Error("Пароль має містити щонайменше 6 символів.");
  if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) throw new Error("Такий нікнейм вже зайнятий.");
  if (!inviter) throw new Error("Інвайт-код не знайдено.");
  if (!inviter.isAdmin && inviter.invitesRemaining <= 0) throw new Error("У цього інвайт-коду більше немає доступних запрошень.");

  const nextUser: PredictUser = {
    id: crypto.randomUUID(),
    username,
    password: input.password,
    inviteCode: inviteCodeFor(username),
    invitedBy: inviter.id,
    invitesRemaining: 3,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    predictions: {},
    tournamentPrediction: input.tournamentPrediction,
  };

  const nextUsers = users.map(user =>
    user.id === inviter.id && !user.isAdmin ? { ...user, invitesRemaining: Math.max(0, user.invitesRemaining - 1) } : user,
  );
  nextUsers.push(nextUser);
  writeUsers(nextUsers);
  window.localStorage.setItem(SESSION_KEY, nextUser.id);
  return nextUser;
}

export function saveMatchPrediction(
  userId: string,
  prediction: Omit<MatchPrediction, "pointsOutcome" | "pointsAdvancing" | "updatedAt">,
) {
  const users = readUsers();
  const match = predictMatches.find(item => item.id === prediction.matchId);
  if (!match) throw new Error("Матч не знайдено.");
  if (new Date(match.matchDate).getTime() <= Date.now()) throw new Error("Дедлайн для цього матчу вже настав.");

  const points = scorePrediction(match, prediction);
  let saved: MatchPrediction | null = null;

  const nextUsers = users.map(user => {
    if (user.id !== userId) return user;
    saved = { ...prediction, ...points, updatedAt: new Date().toISOString() };
    return {
      ...user,
      predictions: {
        ...user.predictions,
        [prediction.matchId]: saved,
      },
    };
  });

  writeUsers(nextUsers);
  return saved;
}

export function seedPredictUser(username: string) {
  const users = readUsers();
  const cleaned = username.trim();
  if (cleaned.length < 3) throw new Error("Введи нікнейм щонайменше з 3 символів.");
  if (users.some(user => user.username.toLowerCase() === cleaned.toLowerCase())) throw new Error("Такий гравець вже існує.");

  const password = Math.random().toString(36).slice(2, 10);
  const user: PredictUser = {
    id: crypto.randomUUID(),
    username: cleaned,
    password,
    inviteCode: inviteCodeFor(cleaned),
    invitesRemaining: 3,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    predictions: {},
    tournamentPrediction: defaultTournamentPrediction("Ukraine"),
  };

  writeUsers([...users, user]);
  return user;
}

export function updateManualResult(matchId: number, homeScore: number, awayScore: number, advancing?: "home" | "away") {
  const users = readUsers();
  const match = predictMatches.find(item => item.id === matchId);
  if (!match) throw new Error("Матч не знайдено.");

  match.homeScore = homeScore;
  match.awayScore = awayScore;
  match.status = "finished";
  match.winner = homeScore > awayScore ? "home" : homeScore < awayScore ? "away" : "draw";
  match.teamAdvancing = match.stage === "group" ? null : advancing ?? (match.winner === "draw" ? "home" : match.winner);

  const nextUsers = users.map(user => {
    const predictions = Object.fromEntries(
      Object.entries(user.predictions).map(([id, prediction]) => {
        const predictionMatch = predictMatches.find(item => item.id === prediction.matchId);
        if (!predictionMatch) return [id, prediction];
        return [id, { ...prediction, ...scorePrediction(predictionMatch, prediction) }];
      }),
    );

    return { ...user, predictions };
  });

  writeUsers(nextUsers);
  return match;
}
