export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "bronze"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished";

export type PredictMatch = {
  id: number;
  externalId: string;
  stage: MatchStage;
  groupName?: string;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: "home" | "away" | "draw" | null;
  teamAdvancing: "home" | "away" | null;
  status: MatchStatus;
};

export type MatchPrediction = {
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedAdvancing?: "home" | "away";
  pointsOutcome: number;
  pointsAdvancing: number;
  updatedAt: string;
};

export type TournamentPrediction = {
  champion: string;
  finalist: string;
  topScorer: string;
  darkHorse: string;
  favoriteTeam: string;
  pointsChampion: number;
  pointsFinalist: number;
  pointsTopScorer: number;
  pointsDarkHorse: number;
};

export type PredictUser = {
  id: string;
  username: string;
  displayName?: string;
  password?: string;
  inviteCode: string;
  invitedBy?: string;
  invitesRemaining: number;
  isAdmin: boolean;
  createdAt: string;
  predictions: Record<number, MatchPrediction>;
  tournamentPrediction: TournamentPrediction;
};

export const wcTeams = [
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Bosnia and Herzegovina",
  "Brazil",
  "Canada",
  "Cape Verde",
  "Colombia",
  "Croatia",
  "Curacao",
  "Czechia",
  "DR Congo",
  "Ecuador",
  "Egypt",
  "England",
  "France",
  "Germany",
  "Ghana",
  "Haiti",
  "Iran",
  "Iraq",
  "Ivory Coast",
  "Japan",
  "Jordan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Panama",
  "Paraguay",
  "Portugal",
  "Qatar",
  "Saudi Arabia",
  "Scotland",
  "Senegal",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Tunisia",
  "Turkey",
  "United States",
  "Uruguay",
  "Uzbekistan",
];

export const popularScorers = [
  "Kylian Mbappe",
  "Erling Haaland",
  "Harry Kane",
  "Lionel Messi",
  "Vinicius Junior",
  "Jude Bellingham",
  "Lautaro Martinez",
  "Cristiano Ronaldo",
  "Raphinha",
  "Julian Alvarez",
];

const teamCodes: Record<string, string> = {
  TBD: "TBD",
  Algeria: "ALG",
  Argentina: "ARG",
  Australia: "AUS",
  Austria: "AUT",
  Belgium: "BEL",
  "Bosnia and Herzegovina": "BIH",
  Brazil: "BRA",
  Cameroon: "CMR",
  Canada: "CAN",
  "Cape Verde": "CPV",
  Chile: "CHI",
  Colombia: "COL",
  "Costa Rica": "CRC",
  Croatia: "CRO",
  Curacao: "CUW",
  Czechia: "CZE",
  Denmark: "DEN",
  "DR Congo": "COD",
  Ecuador: "ECU",
  Egypt: "EGY",
  England: "ENG",
  France: "FRA",
  Germany: "GER",
  Ghana: "GHA",
  Haiti: "HAI",
  Iran: "IRN",
  Iraq: "IRQ",
  Italy: "ITA",
  "Ivory Coast": "CIV",
  Japan: "JPN",
  Jordan: "JOR",
  Mexico: "MEX",
  Morocco: "MAR",
  Netherlands: "NED",
  "New Zealand": "NZL",
  Nigeria: "NGA",
  Norway: "NOR",
  Panama: "PAN",
  Paraguay: "PAR",
  Peru: "PER",
  Poland: "POL",
  Portugal: "POR",
  Qatar: "QAT",
  "Saudi Arabia": "KSA",
  Scotland: "SCO",
  Senegal: "SEN",
  Serbia: "SRB",
  "South Africa": "RSA",
  "South Korea": "KOR",
  Spain: "ESP",
  Sweden: "SWE",
  Switzerland: "SUI",
  Tunisia: "TUN",
  Turkey: "TUR",
  Ukraine: "UKR",
  "United States": "USA",
  Uruguay: "URU",
  Uzbekistan: "UZB",
  Venezuela: "VEN",
  Wales: "WAL",
  Zambia: "ZAM",
};

const groupSchedule = [
  ["Mexico", "South Africa"], ["Canada", "Japan"], ["United States", "Wales"], ["Argentina", "Saudi Arabia"],
  ["France", "Denmark"], ["Brazil", "Serbia"], ["England", "Iran"], ["Spain", "Costa Rica"],
  ["Germany", "Japan"], ["Portugal", "Ghana"], ["Netherlands", "Senegal"], ["Belgium", "Canada"],
  ["Uruguay", "South Korea"], ["Croatia", "Morocco"], ["Switzerland", "Cameroon"], ["Poland", "Chile"],
  ["Ecuador", "Qatar"], ["Nigeria", "Egypt"], ["Colombia", "Peru"], ["Ukraine", "Scotland"],
  ["Norway", "Sweden"], ["Italy", "Australia"], ["Venezuela", "Paraguay"], ["Uzbekistan", "New Zealand"],
  ["Mexico", "Japan"], ["South Africa", "Canada"], ["United States", "Argentina"], ["Wales", "Saudi Arabia"],
  ["France", "Brazil"], ["Denmark", "Serbia"], ["England", "Spain"], ["Iran", "Costa Rica"],
  ["Germany", "Portugal"], ["Japan", "Ghana"], ["Netherlands", "Belgium"], ["Senegal", "Canada"],
  ["Uruguay", "Croatia"], ["South Korea", "Morocco"], ["Switzerland", "Poland"], ["Cameroon", "Chile"],
  ["Ecuador", "Nigeria"], ["Qatar", "Egypt"], ["Colombia", "Ukraine"], ["Peru", "Scotland"],
  ["Norway", "Italy"], ["Sweden", "Australia"], ["Venezuela", "Uzbekistan"], ["Paraguay", "Zambia"],
];

const knockoutSchedule = Array.from({ length: 32 }, () => ["TBD", "TBD"]);

function addDays(baseIso: string, days: number, hourOffset = 0) {
  const date = new Date(baseIso);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(18 + hourOffset, 0, 0, 0);
  return date.toISOString();
}

function stageForKnockout(index: number): MatchStage {
  if (index < 16) return "round_of_32";
  if (index < 24) return "round_of_16";
  if (index < 28) return "quarterfinal";
  if (index < 30) return "semifinal";
  if (index === 30) return "bronze";
  return "final";
}

function resultFor() {
  return { homeScore: null, awayScore: null, status: "scheduled" as const };
}

export const predictMatches: PredictMatch[] = [
  ...groupSchedule.map(([homeTeam, awayTeam], index) => {
    const id = index + 1;
    const result = resultFor(id);
    const groupName = String.fromCharCode(65 + Math.floor(index / 4));
    const winner =
      result.homeScore === null || result.awayScore === null
        ? null
        : result.homeScore > result.awayScore
          ? "home"
          : result.homeScore < result.awayScore
            ? "away"
            : "draw";

    return {
      id,
      externalId: `WC2026-G-${id}`,
      stage: "group" as const,
      groupName,
      matchDate: addDays("2026-06-11T18:00:00.000Z", Math.floor(index / 3), index % 3),
      homeTeam,
      awayTeam,
      homeCode: teamCodes[homeTeam],
      awayCode: teamCodes[awayTeam],
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      winner,
      teamAdvancing: null,
      status: result.status,
    };
  }),
  ...knockoutSchedule.map(([homeTeam, awayTeam], index) => {
    const id = groupSchedule.length + index + 1;
    const result = resultFor(id);
    const winner =
      result.homeScore === null || result.awayScore === null
        ? null
        : result.homeScore > result.awayScore
          ? "home"
          : result.homeScore < result.awayScore
            ? "away"
            : "draw";

    return {
      id,
      externalId: `WC2026-K-${index + 1}`,
      stage: stageForKnockout(index),
      matchDate: addDays("2026-06-28T18:00:00.000Z", Math.floor(index / 4), index % 4),
      homeTeam,
      awayTeam,
      homeCode: teamCodes[homeTeam],
      awayCode: teamCodes[awayTeam],
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      winner,
      teamAdvancing: winner === "draw" ? (id % 2 === 0 ? "away" : "home") : winner,
      status: result.status,
    };
  }),
];

export const stageLabels: Record<MatchStage | "all" | "knockout", string> = {
  all: "All",
  knockout: "Play-off",
  group: "Group",
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarterfinal: "Quarterfinal",
  semifinal: "Semifinal",
  bronze: "Bronze",
  final: "Final",
};

export function formatKyivDate(iso: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kiev",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function isLocked(match: PredictMatch, now = new Date()) {
  return new Date(match.matchDate).getTime() <= now.getTime();
}

export function isVisibleForPrediction(match: PredictMatch, existing?: MatchPrediction, now = new Date()) {
  if (existing) return true;
  const matchDate = new Date(match.matchDate).getTime();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  return matchDate >= start.getTime() && matchDate < end.getTime();
}

export function scorePrediction(match: PredictMatch, prediction: Omit<MatchPrediction, "pointsOutcome" | "pointsAdvancing" | "updatedAt">) {
  if (match.status !== "finished" || match.homeScore === null || match.awayScore === null) {
    return { pointsOutcome: 0, pointsAdvancing: 0 };
  }

  const exact = prediction.predictedHomeScore === match.homeScore && prediction.predictedAwayScore === match.awayScore;
  const predictedWinner =
    prediction.predictedHomeScore > prediction.predictedAwayScore
      ? "home"
      : prediction.predictedHomeScore < prediction.predictedAwayScore
        ? "away"
        : "draw";

  const pointsOutcome = exact ? 10 : predictedWinner === match.winner ? 5 : 0;
  const pointsAdvancing = match.stage !== "group" && prediction.predictedAdvancing === match.teamAdvancing ? 5 : 0;

  return { pointsOutcome, pointsAdvancing };
}

export function getUserTotalPoints(user: PredictUser) {
  const matchPoints = Object.values(user.predictions).reduce((sum, prediction) => {
    return sum + prediction.pointsOutcome + prediction.pointsAdvancing;
  }, 0);
  const tp = user.tournamentPrediction;
  return matchPoints + tp.pointsChampion + tp.pointsFinalist + tp.pointsTopScorer + tp.pointsDarkHorse;
}

export function getTournamentPoints(user: PredictUser) {
  const tp = user.tournamentPrediction;
  return tp.pointsChampion + tp.pointsFinalist + tp.pointsTopScorer + tp.pointsDarkHorse;
}

export function getCorrectPredictionCount(user: PredictUser) {
  return Object.values(user.predictions).filter(prediction => prediction.pointsOutcome >= 5).length;
}
