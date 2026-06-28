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
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winner: "home" | "away" | "draw" | null;
  teamAdvancing: "home" | "away" | null;
  status: MatchStatus;
};

export type MatchPrediction = {
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHomePenalties?: number;
  predictedAwayPenalties?: number;
  predictedAdvancing?: "home" | "away";
  pointsOutcome: number;
  pointsAdvancing: number;
  pointsPenalty: number;
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

export const teamLabels: Record<string, string> = {
  TBD: "Буде визначено",
  Algeria: "Алжир",
  Argentina: "Аргентина",
  Australia: "Австралія",
  Austria: "Австрія",
  Belgium: "Бельгія",
  "Bosnia and Herzegovina": "Боснія і Герцеговина",
  Brazil: "Бразилія",
  Cameroon: "Камерун",
  Canada: "Канада",
  "Cape Verde": "Кабо-Верде",
  Chile: "Чилі",
  Colombia: "Колумбія",
  "Costa Rica": "Коста-Рика",
  Croatia: "Хорватія",
  Curacao: "Кюрасао",
  Czechia: "Чехія",
  Denmark: "Данія",
  "DR Congo": "ДР Конго",
  Ecuador: "Еквадор",
  Egypt: "Єгипет",
  England: "Англія",
  France: "Франція",
  Germany: "Німеччина",
  Ghana: "Гана",
  Haiti: "Гаїті",
  Iran: "Іран",
  Iraq: "Ірак",
  Italy: "Італія",
  "Ivory Coast": "Кот-дʼІвуар",
  Japan: "Японія",
  Jordan: "Йорданія",
  Mexico: "Мексика",
  Morocco: "Марокко",
  Netherlands: "Нідерланди",
  "New Zealand": "Нова Зеландія",
  Nigeria: "Нігерія",
  Norway: "Норвегія",
  Panama: "Панама",
  Paraguay: "Парагвай",
  Peru: "Перу",
  Poland: "Польща",
  Portugal: "Португалія",
  Qatar: "Катар",
  "Saudi Arabia": "Саудівська Аравія",
  Scotland: "Шотландія",
  Senegal: "Сенегал",
  Serbia: "Сербія",
  "South Africa": "ПАР",
  "South Korea": "Південна Корея",
  Spain: "Іспанія",
  Sweden: "Швеція",
  Switzerland: "Швейцарія",
  Tunisia: "Туніс",
  Turkey: "Туреччина",
  Ukraine: "Україна",
  "United States": "США",
  Uruguay: "Уругвай",
  Uzbekistan: "Узбекистан",
  Venezuela: "Венесуела",
  Wales: "Уельс",
  Zambia: "Замбія",
};

export const statusLabels: Record<MatchStatus, string> = {
  scheduled: "Заплановано",
  live: "Наживо",
  finished: "Завершено",
};

export function getTeamLabel(team: string) {
  return teamLabels[team] ?? team;
}

const groupSchedule = [
  { matchNo: 1, groupName: "A", matchDate: "2026-06-11T19:00:00.000Z", homeTeam: "Mexico", awayTeam: "South Africa" },
  { matchNo: 2, groupName: "A", matchDate: "2026-06-12T02:00:00.000Z", homeTeam: "South Korea", awayTeam: "Czechia" },
  { matchNo: 3, groupName: "B", matchDate: "2026-06-12T19:00:00.000Z", homeTeam: "Canada", awayTeam: "Bosnia and Herzegovina" },
  { matchNo: 4, groupName: "D", matchDate: "2026-06-13T01:00:00.000Z", homeTeam: "United States", awayTeam: "Paraguay" },
  { matchNo: 5, groupName: "C", matchDate: "2026-06-14T01:00:00.000Z", homeTeam: "Haiti", awayTeam: "Scotland" },
  { matchNo: 6, groupName: "D", matchDate: "2026-06-14T04:00:00.000Z", homeTeam: "Australia", awayTeam: "Turkey" },
  { matchNo: 7, groupName: "C", matchDate: "2026-06-13T22:00:00.000Z", homeTeam: "Brazil", awayTeam: "Morocco" },
  { matchNo: 8, groupName: "B", matchDate: "2026-06-13T19:00:00.000Z", homeTeam: "Qatar", awayTeam: "Switzerland" },
  { matchNo: 9, groupName: "E", matchDate: "2026-06-14T23:00:00.000Z", homeTeam: "Ivory Coast", awayTeam: "Ecuador" },
  { matchNo: 10, groupName: "E", matchDate: "2026-06-14T17:00:00.000Z", homeTeam: "Germany", awayTeam: "Curacao" },
  { matchNo: 11, groupName: "F", matchDate: "2026-06-14T20:00:00.000Z", homeTeam: "Netherlands", awayTeam: "Japan" },
  { matchNo: 12, groupName: "F", matchDate: "2026-06-15T02:00:00.000Z", homeTeam: "Sweden", awayTeam: "Tunisia" },
  { matchNo: 13, groupName: "H", matchDate: "2026-06-15T22:00:00.000Z", homeTeam: "Saudi Arabia", awayTeam: "Uruguay" },
  { matchNo: 14, groupName: "H", matchDate: "2026-06-15T16:00:00.000Z", homeTeam: "Spain", awayTeam: "Cape Verde" },
  { matchNo: 15, groupName: "G", matchDate: "2026-06-16T01:00:00.000Z", homeTeam: "Iran", awayTeam: "New Zealand" },
  { matchNo: 16, groupName: "G", matchDate: "2026-06-15T19:00:00.000Z", homeTeam: "Belgium", awayTeam: "Egypt" },
  { matchNo: 17, groupName: "I", matchDate: "2026-06-16T19:00:00.000Z", homeTeam: "France", awayTeam: "Senegal" },
  { matchNo: 18, groupName: "I", matchDate: "2026-06-16T22:00:00.000Z", homeTeam: "Iraq", awayTeam: "Norway" },
  { matchNo: 19, groupName: "J", matchDate: "2026-06-17T01:00:00.000Z", homeTeam: "Argentina", awayTeam: "Algeria" },
  { matchNo: 20, groupName: "J", matchDate: "2026-06-17T04:00:00.000Z", homeTeam: "Austria", awayTeam: "Jordan" },
  { matchNo: 21, groupName: "L", matchDate: "2026-06-17T23:00:00.000Z", homeTeam: "Ghana", awayTeam: "Panama" },
  { matchNo: 22, groupName: "L", matchDate: "2026-06-17T20:00:00.000Z", homeTeam: "England", awayTeam: "Croatia" },
  { matchNo: 23, groupName: "K", matchDate: "2026-06-17T17:00:00.000Z", homeTeam: "Portugal", awayTeam: "DR Congo" },
  { matchNo: 24, groupName: "K", matchDate: "2026-06-18T02:00:00.000Z", homeTeam: "Uzbekistan", awayTeam: "Colombia" },
  { matchNo: 25, groupName: "A", matchDate: "2026-06-18T16:00:00.000Z", homeTeam: "Czechia", awayTeam: "South Africa" },
  { matchNo: 26, groupName: "B", matchDate: "2026-06-18T19:00:00.000Z", homeTeam: "Switzerland", awayTeam: "Bosnia and Herzegovina" },
  { matchNo: 27, groupName: "B", matchDate: "2026-06-18T22:00:00.000Z", homeTeam: "Canada", awayTeam: "Qatar" },
  { matchNo: 28, groupName: "A", matchDate: "2026-06-19T01:00:00.000Z", homeTeam: "Mexico", awayTeam: "South Korea" },
  { matchNo: 29, groupName: "C", matchDate: "2026-06-20T00:30:00.000Z", homeTeam: "Brazil", awayTeam: "Haiti" },
  { matchNo: 30, groupName: "C", matchDate: "2026-06-19T22:00:00.000Z", homeTeam: "Scotland", awayTeam: "Morocco" },
  { matchNo: 31, groupName: "D", matchDate: "2026-06-20T03:00:00.000Z", homeTeam: "Turkey", awayTeam: "Paraguay" },
  { matchNo: 32, groupName: "D", matchDate: "2026-06-19T19:00:00.000Z", homeTeam: "United States", awayTeam: "Australia" },
  { matchNo: 33, groupName: "E", matchDate: "2026-06-20T20:00:00.000Z", homeTeam: "Germany", awayTeam: "Ivory Coast" },
  { matchNo: 34, groupName: "E", matchDate: "2026-06-21T00:00:00.000Z", homeTeam: "Ecuador", awayTeam: "Curacao" },
  { matchNo: 35, groupName: "F", matchDate: "2026-06-20T17:00:00.000Z", homeTeam: "Netherlands", awayTeam: "Sweden" },
  { matchNo: 36, groupName: "F", matchDate: "2026-06-21T04:00:00.000Z", homeTeam: "Tunisia", awayTeam: "Japan" },
  { matchNo: 37, groupName: "H", matchDate: "2026-06-21T22:00:00.000Z", homeTeam: "Uruguay", awayTeam: "Cape Verde" },
  { matchNo: 38, groupName: "H", matchDate: "2026-06-21T16:00:00.000Z", homeTeam: "Spain", awayTeam: "Saudi Arabia" },
  { matchNo: 39, groupName: "G", matchDate: "2026-06-21T19:00:00.000Z", homeTeam: "Belgium", awayTeam: "Iran" },
  { matchNo: 40, groupName: "G", matchDate: "2026-06-22T01:00:00.000Z", homeTeam: "New Zealand", awayTeam: "Egypt" },
  { matchNo: 41, groupName: "I", matchDate: "2026-06-23T00:00:00.000Z", homeTeam: "Norway", awayTeam: "Senegal" },
  { matchNo: 42, groupName: "I", matchDate: "2026-06-22T21:00:00.000Z", homeTeam: "France", awayTeam: "Iraq" },
  { matchNo: 43, groupName: "J", matchDate: "2026-06-22T17:00:00.000Z", homeTeam: "Argentina", awayTeam: "Austria" },
  { matchNo: 44, groupName: "J", matchDate: "2026-06-23T03:00:00.000Z", homeTeam: "Jordan", awayTeam: "Algeria" },
  { matchNo: 45, groupName: "L", matchDate: "2026-06-23T20:00:00.000Z", homeTeam: "England", awayTeam: "Ghana" },
  { matchNo: 46, groupName: "L", matchDate: "2026-06-23T23:00:00.000Z", homeTeam: "Panama", awayTeam: "Croatia" },
  { matchNo: 47, groupName: "K", matchDate: "2026-06-23T17:00:00.000Z", homeTeam: "Portugal", awayTeam: "Uzbekistan" },
  { matchNo: 48, groupName: "K", matchDate: "2026-06-24T02:00:00.000Z", homeTeam: "Colombia", awayTeam: "DR Congo" },
  { matchNo: 49, groupName: "C", matchDate: "2026-06-24T22:00:00.000Z", homeTeam: "Scotland", awayTeam: "Brazil" },
  { matchNo: 50, groupName: "C", matchDate: "2026-06-24T22:00:00.000Z", homeTeam: "Morocco", awayTeam: "Haiti" },
  { matchNo: 51, groupName: "B", matchDate: "2026-06-24T19:00:00.000Z", homeTeam: "Switzerland", awayTeam: "Canada" },
  { matchNo: 52, groupName: "B", matchDate: "2026-06-24T19:00:00.000Z", homeTeam: "Bosnia and Herzegovina", awayTeam: "Qatar" },
  { matchNo: 53, groupName: "A", matchDate: "2026-06-25T01:00:00.000Z", homeTeam: "Czechia", awayTeam: "Mexico" },
  { matchNo: 54, groupName: "A", matchDate: "2026-06-25T01:00:00.000Z", homeTeam: "South Africa", awayTeam: "South Korea" },
  { matchNo: 55, groupName: "E", matchDate: "2026-06-25T20:00:00.000Z", homeTeam: "Curacao", awayTeam: "Ivory Coast" },
  { matchNo: 56, groupName: "E", matchDate: "2026-06-25T20:00:00.000Z", homeTeam: "Ecuador", awayTeam: "Germany" },
  { matchNo: 57, groupName: "F", matchDate: "2026-06-25T23:00:00.000Z", homeTeam: "Japan", awayTeam: "Sweden" },
  { matchNo: 58, groupName: "F", matchDate: "2026-06-25T23:00:00.000Z", homeTeam: "Tunisia", awayTeam: "Netherlands" },
  { matchNo: 59, groupName: "D", matchDate: "2026-06-26T02:00:00.000Z", homeTeam: "Turkey", awayTeam: "United States" },
  { matchNo: 60, groupName: "D", matchDate: "2026-06-26T02:00:00.000Z", homeTeam: "Paraguay", awayTeam: "Australia" },
  { matchNo: 61, groupName: "I", matchDate: "2026-06-26T19:00:00.000Z", homeTeam: "Norway", awayTeam: "France" },
  { matchNo: 62, groupName: "I", matchDate: "2026-06-26T19:00:00.000Z", homeTeam: "Senegal", awayTeam: "Iraq" },
  { matchNo: 63, groupName: "G", matchDate: "2026-06-27T03:00:00.000Z", homeTeam: "Egypt", awayTeam: "Iran" },
  { matchNo: 64, groupName: "G", matchDate: "2026-06-27T03:00:00.000Z", homeTeam: "New Zealand", awayTeam: "Belgium" },
  { matchNo: 65, groupName: "H", matchDate: "2026-06-27T00:00:00.000Z", homeTeam: "Cape Verde", awayTeam: "Saudi Arabia" },
  { matchNo: 66, groupName: "H", matchDate: "2026-06-27T00:00:00.000Z", homeTeam: "Uruguay", awayTeam: "Spain" },
  { matchNo: 67, groupName: "L", matchDate: "2026-06-27T21:00:00.000Z", homeTeam: "Panama", awayTeam: "England" },
  { matchNo: 68, groupName: "L", matchDate: "2026-06-27T21:00:00.000Z", homeTeam: "Croatia", awayTeam: "Ghana" },
  { matchNo: 69, groupName: "J", matchDate: "2026-06-28T02:00:00.000Z", homeTeam: "Algeria", awayTeam: "Austria" },
  { matchNo: 70, groupName: "J", matchDate: "2026-06-28T02:00:00.000Z", homeTeam: "Jordan", awayTeam: "Argentina" },
  { matchNo: 71, groupName: "K", matchDate: "2026-06-27T23:30:00.000Z", homeTeam: "Colombia", awayTeam: "Portugal" },
  { matchNo: 72, groupName: "K", matchDate: "2026-06-27T23:30:00.000Z", homeTeam: "DR Congo", awayTeam: "Uzbekistan" },
];

const knockoutSchedule: Array<{ homeTeam: string; awayTeam: string; matchDate?: string }> = [
  { homeTeam: "South Africa", awayTeam: "Canada", matchDate: "2026-06-28T19:00:00.000Z" },
  { homeTeam: "Germany", awayTeam: "Paraguay", matchDate: "2026-06-29T20:30:00.000Z" },
  { homeTeam: "Netherlands", awayTeam: "Morocco", matchDate: "2026-06-30T20:00:00.000Z" },
  { homeTeam: "Brazil", awayTeam: "Japan", matchDate: "2026-06-29T17:00:00.000Z" },
  { homeTeam: "France", awayTeam: "Sweden", matchDate: "2026-06-30T17:00:00.000Z" },
  { homeTeam: "Ivory Coast", awayTeam: "Norway", matchDate: "2026-07-01T01:00:00.000Z" },
  { homeTeam: "Mexico", awayTeam: "Ecuador", matchDate: "2026-07-01T19:00:00.000Z" },
  { homeTeam: "England", awayTeam: "DR Congo", matchDate: "2026-07-02T02:00:00.000Z" },
  { homeTeam: "United States", awayTeam: "Bosnia and Herzegovina", matchDate: "2026-07-03T01:00:00.000Z" },
  { homeTeam: "Belgium", awayTeam: "Senegal", matchDate: "2026-07-03T19:00:00.000Z" },
  { homeTeam: "Portugal", awayTeam: "Croatia", matchDate: "2026-07-04T00:00:00.000Z" },
  { homeTeam: "Spain", awayTeam: "Austria", matchDate: "2026-07-04T20:00:00.000Z" },
  { homeTeam: "Switzerland", awayTeam: "Algeria", matchDate: "2026-07-05T17:00:00.000Z" },
  { homeTeam: "Argentina", awayTeam: "Cape Verde", matchDate: "2026-07-05T20:00:00.000Z" },
  { homeTeam: "Colombia", awayTeam: "Ghana", matchDate: "2026-07-06T19:00:00.000Z" },
  { homeTeam: "Australia", awayTeam: "Egypt", matchDate: "2026-07-06T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-07T19:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-07T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-08T19:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-08T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-09T19:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-09T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-10T19:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-10T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-12T19:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-12T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-13T19:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-13T22:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-15T20:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-16T20:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-18T20:00:00.000Z" },
  { homeTeam: "TBD", awayTeam: "TBD", matchDate: "2026-07-19T20:00:00.000Z" },
];

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

function resultFor(_id?: number) {
  return { homeScore: null, awayScore: null, status: "scheduled" as const };
}

export const predictMatches: PredictMatch[] = [
  ...groupSchedule.map(({ matchNo, groupName, matchDate, homeTeam, awayTeam }) => {
    const id = matchNo;
    const result = resultFor(id);
    const winner: PredictMatch["winner"] =
      result.homeScore === null || result.awayScore === null
        ? null
        : result.homeScore > result.awayScore
          ? "home"
          : result.homeScore < result.awayScore
            ? "away"
            : "draw";

    return {
      id,
      externalId: `WC2026-G-${matchNo}`,
      stage: "group" as const,
      groupName,
      matchDate,
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
  ...knockoutSchedule.map(({ homeTeam, awayTeam, matchDate }, index) => {
    const id = groupSchedule.length + index + 1;
    const result = resultFor(id);
    const winner: PredictMatch["winner"] =
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
      matchDate: matchDate ?? addDays("2026-06-28T18:00:00.000Z", Math.floor(index / 4), index % 4),
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
  all: "Усі",
  knockout: "Плей-офф",
  group: "Група",
  round_of_32: "1/16",
  round_of_16: "1/8",
  quarterfinal: "1/4",
  semifinal: "1/2",
  bronze: "3 місце",
  final: "Фінал",
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

export function scorePrediction(match: PredictMatch, prediction: Omit<MatchPrediction, "pointsOutcome" | "pointsAdvancing" | "pointsPenalty" | "updatedAt">) {
  if (match.status !== "finished" || match.homeScore === null || match.awayScore === null) {
    return { pointsOutcome: 0, pointsAdvancing: 0, pointsPenalty: 0 };
  }

  const exact = prediction.predictedHomeScore === match.homeScore && prediction.predictedAwayScore === match.awayScore;
  const predictedWinner =
    prediction.predictedHomeScore > prediction.predictedAwayScore
      ? "home"
      : prediction.predictedHomeScore < prediction.predictedAwayScore
        ? "away"
        : "draw";

  const pointsOutcome = match.stage === "group"
    ? exact ? 10 : predictedWinner === match.winner ? 5 : 0
    : (predictedWinner === match.winner ? 10 : 0) + (exact ? 10 : 0);
  const pointsAdvancing = match.stage !== "group" && prediction.predictedAdvancing === match.teamAdvancing ? 5 : 0;
  const pointsPenalty =
    match.stage !== "group" &&
    predictedWinner === "draw" &&
    match.homePenalties !== null &&
    match.homePenalties !== undefined &&
    match.awayPenalties !== null &&
    match.awayPenalties !== undefined &&
    prediction.predictedHomePenalties === match.homePenalties &&
    prediction.predictedAwayPenalties === match.awayPenalties
      ? 10
      : 0;

  return { pointsOutcome, pointsAdvancing, pointsPenalty };
}

export function getUserTotalPoints(user: PredictUser) {
  const matchPoints = Object.values(user.predictions).reduce((sum, prediction) => {
    return sum + prediction.pointsOutcome + prediction.pointsAdvancing + prediction.pointsPenalty;
  }, 0);
  const tp = user.tournamentPrediction;
  return matchPoints + tp.pointsChampion + tp.pointsFinalist + tp.pointsTopScorer + tp.pointsDarkHorse;
}

export function getTournamentPoints(user: PredictUser) {
  const tp = user.tournamentPrediction;
  return tp.pointsChampion + tp.pointsFinalist + tp.pointsTopScorer + tp.pointsDarkHorse;
}

export function getCorrectPredictionCount(user: PredictUser) {
  return Object.values(user.predictions).filter(prediction => prediction.pointsOutcome === 5).length;
}

export function getExactPredictionCount(user: PredictUser) {
  return Object.values(user.predictions).filter(prediction => prediction.pointsOutcome >= 10).length;
}
