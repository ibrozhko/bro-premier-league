export interface Player {
  id: number;
  name: string;
  club: string;
  platform: "PS5" | "Xbox" | "PC";
  clubColor: string; // HSL accent color for the club
}

export interface Match {
  home: number; // player id
  away: number; // player id
  homeScore: number | null;
  awayScore: number | null;
}

export interface Matchday {
  number: number;
  date: string; // e.g. "2026-04-17"
  matches: Match[];
  bye: number; // player id who has a bye
}

export const players: Player[] = [
  { id: 1, name: "Андрій", club: "Dynamo Kyiv", platform: "PS5", clubColor: "217 78% 57%" },
  { id: 2, name: "Влад", club: "Al Nassr", platform: "PS5", clubColor: "42 87% 55%" },
  { id: 3, name: "Коля", club: "Brighton", platform: "Xbox", clubColor: "217 90% 50%" },
  { id: 4, name: "Міша", club: "Atletico Madrid", platform: "PS5", clubColor: "0 70% 50%" },
  { id: 5, name: "Жека", club: "Benfica", platform: "PS5", clubColor: "0 80% 45%" },
  { id: 6, name: "Ігор", club: "Lyon", platform: "Xbox", clubColor: "217 60% 45%" },
  { id: 7, name: "Сашко", club: "Real Madrid", platform: "PS5", clubColor: "0 0% 95%" },
  { id: 8, name: "Олексій", club: "Lille", platform: "PC", clubColor: "0 75% 40%" },
  { id: 9, name: "Сергій", club: "Marseille", platform: "PS5", clubColor: "200 70% 55%" },
];

// Round-robin schedule for 9 players (using dummy player 0 for byes)
// Each round: 4 matches + 1 bye. Double round-robin = 18 matchdays.
// Season: Apr 17 – Jun 15, 2026 (every ~3.5 days)

const matchdayDates = [
  "2026-04-17", "2026-04-20", "2026-04-23", "2026-04-26",
  "2026-04-29", "2026-05-02", "2026-05-05", "2026-05-08",
  "2026-05-11", "2026-05-14", "2026-05-17", "2026-05-20",
  "2026-05-23", "2026-05-26", "2026-05-29", "2026-06-01",
  "2026-06-05", "2026-06-08",
];

// Generate round-robin pairings for 9 players (+ phantom 0)
function generateRoundRobin(): { matches: [number, number][]; bye: number }[] {
  const n = 10; // 9 players + 1 phantom (id 0)
  const ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rounds: { matches: [number, number][]; bye: number }[] = [];

  for (let r = 0; r < n - 1; r++) {
    const roundMatches: [number, number][] = [];
    let byePlayer = 0;

    for (let i = 0; i < n / 2; i++) {
      const home = ids[i];
      const away = ids[n - 1 - i];
      if (home === 0) {
        byePlayer = away;
      } else if (away === 0) {
        byePlayer = home;
      } else {
        roundMatches.push([home, away]);
      }
    }

    rounds.push({ matches: roundMatches, bye: byePlayer });

    // Rotate: fix first element, rotate rest
    const last = ids.pop()!;
    ids.splice(1, 0, last);
  }

  return rounds;
}

const singleRound = generateRoundRobin();

// Build matchdays: first 9 = first leg, next 9 = reverse leg
function buildMatchdays(): Matchday[] {
  const mds: Matchday[] = [];

  for (let i = 0; i < 9; i++) {
    const r = singleRound[i];
    mds.push({
      number: i + 1,
      date: matchdayDates[i],
      matches: r.matches.map(([h, a]) => ({
        home: h,
        away: a,
        homeScore: null,
        awayScore: null,
      })),
      bye: r.bye,
    });
  }

  // Reverse fixtures for second leg
  for (let i = 0; i < 9; i++) {
    const r = singleRound[i];
    mds.push({
      number: i + 10,
      date: matchdayDates[i + 9],
      matches: r.matches.map(([h, a]) => ({
        home: a,
        away: h,
        homeScore: null,
        awayScore: null,
      })),
      bye: r.bye,
    });
  }

  return mds;
}

export const matchdays: Matchday[] = buildMatchdays();

// Add some placeholder scores for matchday 1 and 2
matchdays[0].matches[0].homeScore = 3;
matchdays[0].matches[0].awayScore = 1;
matchdays[0].matches[1].homeScore = 2;
matchdays[0].matches[1].awayScore = 2;
matchdays[0].matches[2].homeScore = 0;
matchdays[0].matches[2].awayScore = 1;
matchdays[0].matches[3].homeScore = 4;
matchdays[0].matches[3].awayScore = 2;

matchdays[1].matches[0].homeScore = 1;
matchdays[1].matches[0].awayScore = 0;
matchdays[1].matches[1].homeScore = 3;
matchdays[1].matches[1].awayScore = 3;
matchdays[1].matches[2].homeScore = 2;
matchdays[1].matches[2].awayScore = 1;
matchdays[1].matches[3].homeScore = 0;
matchdays[1].matches[3].awayScore = 2;

// Helper functions
export function getPlayer(id: number): Player {
  return players.find(p => p.id === id)!;
}

export interface Standing {
  playerId: number;
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

export function calculateStandings(): Standing[] {
  const stats: Record<number, Standing> = {};

  players.forEach(p => {
    stats[p.id] = {
      playerId: p.id,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
      form: [],
    };
  });

  matchdays.forEach(md => {
    md.matches.forEach(m => {
      if (m.homeScore === null || m.awayScore === null) return;

      const home = stats[m.home];
      const away = stats[m.away];

      home.played++;
      away.played++;
      home.goalsFor += m.homeScore;
      home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore;
      away.goalsAgainst += m.homeScore;

      if (m.homeScore > m.awayScore) {
        home.won++; home.points += 3; home.form.push("W");
        away.lost++; away.form.push("L");
      } else if (m.homeScore < m.awayScore) {
        away.won++; away.points += 3; away.form.push("W");
        home.lost++; home.form.push("L");
      } else {
        home.drawn++; home.points += 1; home.form.push("D");
        away.drawn++; away.points += 1; away.form.push("D");
      }
    });
  });

  Object.values(stats).forEach(s => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
    s.form = s.form.slice(-5);
  });

  return Object.values(stats).sort((a, b) =>
    b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
  );
}

export function getTopScorers(): { playerId: number; goals: number }[] {
  const goals: Record<number, number> = {};
  players.forEach(p => { goals[p.id] = 0; });

  matchdays.forEach(md => {
    md.matches.forEach(m => {
      if (m.homeScore !== null) goals[m.home] += m.homeScore;
      if (m.awayScore !== null) goals[m.away] += m.awayScore;
    });
  });

  return Object.entries(goals)
    .map(([id, g]) => ({ playerId: Number(id), goals: g }))
    .sort((a, b) => b.goals - a.goals);
}

export function getNextMatch(): { matchday: Matchday; match: Match } | null {
  for (const md of matchdays) {
    for (const m of md.matches) {
      if (m.homeScore === null) {
        return { matchday: md, match: m };
      }
    }
  }
  return null;
}

export function getRecentResults(): { matchday: Matchday; match: Match }[] {
  const results: { matchday: Matchday; match: Match }[] = [];
  for (const md of [...matchdays].reverse()) {
    for (const m of [...md.matches].reverse()) {
      if (m.homeScore !== null) {
        results.push({ matchday: md, match: m });
        if (results.length >= 6) return results;
      }
    }
  }
  return results;
}
