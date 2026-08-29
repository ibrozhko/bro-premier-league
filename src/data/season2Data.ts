export interface Season2Player {
  id: string;
  name: string;
  nick?: string;
  platform?: string;
  club: string;
  achievements?: string[];
}

export interface Season2Match {
  id: string;
  round: number;
  date: string;
  dayLabel: string;
  leg: 1 | 2;
  home: Season2Player;
  away: Season2Player;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Season2Round {
  round: number;
  date: string;
  dayLabel: string;
  leg: 1 | 2;
  bye: Season2Player | null;
  matches: Season2Match[];
}

export interface Season2Standing {
  player: Season2Player;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export const season2Players: Season2Player[] = [
  { id: "igor", name: "Ігор", nick: "BR7ZH", platform: "PS5", club: "Айнтрахт 🇩🇪" },
  { id: "sania", name: "Саня", nick: "b2k_alex", platform: "PS5", club: "Баварія 🇩🇪" },
  { id: "zhenia", name: "Женя", nick: "evgnp11", platform: "PC", club: "Парма 🇮🇹" },
  { id: "posol", name: "Сергій", nick: "posolua", platform: "PS5", club: "Спортінг 🇵🇹", achievements: ["Фіналіст кубку", "Переможець прогнозів"] },
  { id: "kiril", name: "Кіріл", nick: "orid27", platform: "PC", club: "Депортіво 🇪🇸", achievements: ["Фіналіст World Cup"] },
  { id: "mykola", name: "Коля", nick: "Fixius777", platform: "Xbox", club: "Борнмут 🏴󠁧󠁢󠁥󠁮󠁧󠁿", achievements: ["Переможець кубку"] },
  { id: "vlad", name: "Влад", nick: "d_Xyqenko", platform: "PS5", club: "Шахтар 🇺🇦", achievements: ["2 місце сезону 1"] },
  { id: "pitch", name: "Сергій", nick: "Flugergehaimer__", platform: "PS5", club: "Сток Сіті 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "misha", name: "Майкл", nick: "early_actor62", platform: "PS5", club: "Ліверпуль 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "oleksii", name: "Олексій", nick: "Mer4iik", platform: "PS5", club: "Комо 🇮🇹", achievements: ["3 місце сезону 1"] },
  { id: "andrii", name: "Андрій", nick: "Juced99", platform: "PC", club: "Ракув 🇵🇱", achievements: ["Переможець сезону 1", "Фіналіст World Cup"] },
  { id: "dmytro", name: "Дмитро", nick: "LusuyKrab", platform: "PS5", club: "ПСЖ 🇫🇷" },
  { id: "dimas", name: "Дімас", nick: "Viking240222", platform: "PC", club: "Порто 🇵🇹" },
  { id: "artem", name: "Артем", nick: "fen1kssss", platform: "PC", club: "Лаціо 🇮🇹" },
  { id: "vitalii", name: "Віталій", nick: "turbovitalik", platform: "PS5", club: "Атлетік Більбао 🇪🇸" },
];

const withdrawnSeason2Players: Season2Player[] = [
  { id: "zheka", name: "Жека", nick: "katrik_89", platform: "PS5", club: "Манчестер Сіті 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
];

const season2WithdrawnPlayerIds = new Set(withdrawnSeason2Players.map(player => player.id));
const season2CalendarPlayerById = new Map(
  [...season2Players, ...withdrawnSeason2Players].map(player => [player.id, player]),
);
const season2CalendarPlayers = [
  "igor",
  "sania",
  "zhenia",
  "posol",
  "kiril",
  "mykola",
  "vlad",
  "pitch",
  "misha",
  "oleksii",
  "andrii",
  "zheka",
  "dmytro",
  "dimas",
  "artem",
].map(playerId => season2CalendarPlayerById.get(playerId)!);
const season2FloatingPlayer = season2Players.find(player => player.id === "vitalii") ?? null;

export const season2Seed = "BPL-SEASON-2-FINAL-DRAW-20260803181528-690781000";
export const season2ResultOverrides: Record<string, { homeScore: number; awayScore: number }> = {
  "S2-01-01": { homeScore: 5, awayScore: 1 },
  "S2-01-02": { homeScore: 5, awayScore: 2 },
  "S2-01-03": { homeScore: 4, awayScore: 6 },
  "S2-01-04": { homeScore: 4, awayScore: 5 },
  "S2-01-05": { homeScore: 5, awayScore: 0 },
  "S2-01-06": { homeScore: 2, awayScore: 2 },
  "S2-01-07": { homeScore: 6, awayScore: 2 },
  "S2-02-01": { homeScore: 6, awayScore: 1 },
  "S2-02-02": { homeScore: 3, awayScore: 1 },
  "S2-02-04": { homeScore: 1, awayScore: 7 },
  "S2-02-05": { homeScore: 3, awayScore: 5 },
  "S2-02-06": { homeScore: 7, awayScore: 2 },
  "S2-02-07": { homeScore: 5, awayScore: 4 },
  "S2-02-08": { homeScore: 8, awayScore: 1 },
  "S2-03-01": { homeScore: 1, awayScore: 4 },
  "S2-03-02": { homeScore: 2, awayScore: 15 },
  "S2-03-03": { homeScore: 7, awayScore: 3 },
  "S2-03-04": { homeScore: 5, awayScore: 1 },
  "S2-03-05": { homeScore: 3, awayScore: 3 },
  "S2-03-06": { homeScore: 2, awayScore: 3 },
  "S2-03-08": { homeScore: 2, awayScore: 2 },
  "S2-04-01": { homeScore: 1, awayScore: 3 },
  "S2-04-02": { homeScore: 5, awayScore: 4 },
  "S2-04-03": { homeScore: 1, awayScore: 10 },
  "S2-04-04": { homeScore: 1, awayScore: 3 },
  "S2-04-05": { homeScore: 0, awayScore: 5 },
  "S2-04-06": { homeScore: 8, awayScore: 2 },
  "S2-04-08": { homeScore: 10, awayScore: 1 },
  "S2-05-01": { homeScore: 3, awayScore: 6 },
  "S2-05-03": { homeScore: 9, awayScore: 3 },
  "S2-05-05": { homeScore: 4, awayScore: 5 },
  "S2-05-06": { homeScore: 5, awayScore: 3 },
  "S2-05-07": { homeScore: 2, awayScore: 1 },
  "S2-05-08": { homeScore: 3, awayScore: 0 },
  "S2-06-01": { homeScore: 2, awayScore: 1 },
  "S2-06-02": { homeScore: 4, awayScore: 7 },
  "S2-06-03": { homeScore: 2, awayScore: 3 },
  "S2-06-04": { homeScore: 5, awayScore: 0 },
  "S2-06-05": { homeScore: 5, awayScore: 2 },
  "S2-06-07": { homeScore: 6, awayScore: 1 },
  "S2-06-08": { homeScore: 5, awayScore: 0 },
  "S2-07-01": { homeScore: 2, awayScore: 6 },
  "S2-07-02": { homeScore: 5, awayScore: 8 },
  "S2-07-05": { homeScore: 1, awayScore: 3 },
  "S2-07-06": { homeScore: 6, awayScore: 1 },
  "S2-07-08": { homeScore: 1, awayScore: 3 },
  "S2-08-08": { homeScore: 5, awayScore: 2 },
};

function hashSeed(seed: string) {
  let hash = 1779033703 ^ seed.length;

  for (let i = 0; i < seed.length; i += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function seededRandom(seed: string) {
  const seedHash = hashSeed(seed);
  let value = seedHash();

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: string) {
  const random = seededRandom(seed);
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date: Date) {
  const weekdays = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${weekdays[date.getUTCDay()]} ${day}.${month}.${year}`;
}

function getRoundDate(round: number) {
  const startDate = new Date(Date.UTC(2026, 7, 8));
  const weekendIndex = Math.floor((round - 1) / 2);
  const dayInWeekend = (round - 1) % 2;
  return addDays(startDate, weekendIndex * 7 + dayInWeekend);
}

type SchedulePlayer = Season2Player | null;

function makeRoundMatches(players: SchedulePlayer[], roundIndex: number) {
  const pairings: Array<[Season2Player, Season2Player]> = [];
  let bye: Season2Player | null = null;

  for (let index = 0; index < players.length / 2; index += 1) {
    const first = players[index];
    const second = players[players.length - 1 - index];

    if (!first || !second) {
      bye = first ?? second ?? null;
      continue;
    }

    const shouldFlip = roundIndex % 2 === 1;
    const pairing: [Season2Player, Season2Player] = shouldFlip ? [second, first] : [first, second];
    pairings.push(pairing);
  }

  return { pairings, bye };
}

type ScheduleRound = ReturnType<typeof makeRoundMatches>;

function addFloatingPlayerMatch(pairings: Array<[Season2Player, Season2Player]>, bye: Season2Player | null, leg: 1 | 2) {
  if (!bye || !season2FloatingPlayer) {
    return { pairings, bye };
  }

  return {
    pairings: [
      ...pairings,
      leg === 2 ? [season2FloatingPlayer, bye] as [Season2Player, Season2Player] : [bye, season2FloatingPlayer] as [Season2Player, Season2Player],
    ],
    bye: null,
  };
}

function shuffleRoundPairings(
  rounds: ScheduleRound[],
  seed: string,
  leg: 1 | 2,
) {
  return seededShuffle(rounds, `${seed}-rounds-leg-${leg}`)
    .map(({ pairings, bye }, roundIndex) => {
      const random = seededRandom(`${seed}-home-away-leg-${leg}-round-${roundIndex + 1}`);

      return {
        bye,
        pairings: seededShuffle(pairings, `${seed}-matches-leg-${leg}-round-${roundIndex + 1}`)
        .map(([home, away]) => {
          const shouldSwap = random() > 0.5;
          const basePairing: [Season2Player, Season2Player] = shouldSwap ? [away, home] : [home, away];

          return leg === 2 ? [basePairing[1], basePairing[0]] as [Season2Player, Season2Player] : basePairing;
        }),
      };
    });
}

export function createSeason2Schedule(seed = season2Seed): Season2Round[] {
  const shuffledPlayers: SchedulePlayer[] = seededShuffle(season2CalendarPlayers, seed);
  if (shuffledPlayers.length % 2 === 1) {
    shuffledPlayers.push(null);
  }

  const firstLegRounds: ScheduleRound[] = [];
  let rotation = [...shuffledPlayers];

  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    firstLegRounds.push(makeRoundMatches(rotation, roundIndex));
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }

  const allPairings = [
    ...shuffleRoundPairings(firstLegRounds, seed, 1),
    ...shuffleRoundPairings(firstLegRounds, seed, 2),
  ];

  return allPairings.map(({ pairings, bye }, roundIndex) => {
    const round = roundIndex + 1;
    const date = getRoundDate(round);
    const leg = round <= firstLegRounds.length ? 1 : 2;
    const roundWithFloatingPlayer = addFloatingPlayerMatch(pairings, bye, leg);
    let roundBye = roundWithFloatingPlayer.bye;
    const matches: Season2Match[] = roundWithFloatingPlayer.pairings.flatMap(([home, away], matchIndex) => {
      if (season2WithdrawnPlayerIds.has(home.id)) {
        roundBye = away;
        return [];
      }

      if (season2WithdrawnPlayerIds.has(away.id)) {
        roundBye = home;
        return [];
      }

      return [{
        id: `S2-${String(round).padStart(2, "0")}-${String(matchIndex + 1).padStart(2, "0")}`,
        round,
        date: toIsoDate(date),
        dayLabel: formatDate(date),
        leg,
        home,
        away,
        homeScore: null,
        awayScore: null,
      }];
    });

    return {
      round,
      date: toIsoDate(date),
      dayLabel: formatDate(date),
      leg,
      bye: roundBye,
      matches,
    };
  });
}

function applySeason2ResultOverrides(rounds: Season2Round[]): Season2Round[] {
  return rounds.map(round => ({
    ...round,
    matches: round.matches.map(match => {
      const override = season2ResultOverrides[match.id];
      if (!override) return match;

      return {
        ...match,
        homeScore: override.homeScore,
        awayScore: override.awayScore,
      };
    }),
  }));
}

export const season2Rounds = applySeason2ResultOverrides(createSeason2Schedule());
export const season2LastUpdated = "30.08.2026";

export const season2Summary = {
  players: season2Players.length,
  rounds: season2Rounds.length,
  matches: season2Rounds.reduce((sum, round) => sum + round.matches.length, 0),
  startDate: season2Rounds[0]?.dayLabel ?? "Сб 08.08.2026",
  finishDate: season2Rounds[season2Rounds.length - 1]?.dayLabel ?? "Нд 15.11.2026",
};

const season2InitialTableOrder = [
  "sania",
  "andrii",
  "igor",
  "posol",
  "kiril",
  "mykola",
  "vlad",
  "pitch",
  "misha",
  "oleksii",
  "zhenia",
  "dmytro",
  "dimas",
  "artem",
  "vitalii",
];

function getInitialTableRank(playerId: string) {
  const rank = season2InitialTableOrder.indexOf(playerId);
  return rank === -1 ? season2InitialTableOrder.length : rank;
}

export function isSeason2Played(match: Season2Match) {
  return match.homeScore !== null && match.awayScore !== null;
}

export function getSeason2PlayedMatches() {
  return season2Rounds.flatMap(round => round.matches).filter(isSeason2Played);
}

export function getSeason2UpcomingMatches() {
  return season2Rounds.flatMap(round => round.matches).filter(match => !isSeason2Played(match));
}

export function calculateSeason2Standings(): Season2Standing[] {
  const table = new Map<string, Season2Standing>();

  season2Players.forEach(player => {
    table.set(player.id, {
      player,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    });
  });

  season2Rounds.forEach(round => {
    round.matches.forEach(match => {
      if (!isSeason2Played(match)) return;

      const home = table.get(match.home.id)!;
      const away = table.get(match.away.id)!;
      const homeScore = match.homeScore!;
      const awayScore = match.awayScore!;

      home.played += 1;
      away.played += 1;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.won += 1;
        away.lost += 1;
        home.points += 3;
        home.form.push("W");
        away.form.push("L");
      } else if (homeScore < awayScore) {
        away.won += 1;
        home.lost += 1;
        away.points += 3;
        away.form.push("W");
        home.form.push("L");
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
        home.form.push("D");
        away.form.push("D");
      }
    });
  });

  return [...table.values()]
    .map(row => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
      form: row.form.slice(-5),
    }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      getInitialTableRank(a.player.id) - getInitialTableRank(b.player.id) ||
      a.player.name.localeCompare(b.player.name, "uk")
    );
}

export function getSeason2NextRound() {
  return season2Rounds.find(round => round.matches.some(match => !isSeason2Played(match))) ?? null;
}

export function getSeason2LegLabel(leg: 1 | 2) {
  return leg === 1 ? "Перше коло" : "Друге коло";
}

export function getSeason2TopScorers() {
  return calculateSeason2Standings().sort((a, b) =>
    b.goalsFor - a.goalsFor ||
    b.goalDifference - a.goalDifference ||
    a.player.name.localeCompare(b.player.name, "uk")
  );
}

export function getSeason2BestDefense() {
  return calculateSeason2Standings().sort((a, b) =>
    a.goalsAgainst - b.goalsAgainst ||
    b.goalDifference - a.goalDifference ||
    a.player.name.localeCompare(b.player.name, "uk")
  );
}
