export interface Player {
  id: number;
  name: string;
  club: string;
  platform: "PS5" | "Xbox" | "PC";
  clubColor: string;
}

export interface Match {
  home: number;
  away: number;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Matchday {
  number: number;
  date: string;
  label: string;
  matches: Match[];
  bye: number;
}

export const players: Player[] = [
  { id: 1, name: "Андрій", club: "Динамо Київ", platform: "PC", clubColor: "217 78% 57%" },
  { id: 2, name: "Влад", club: "Аль Наср", platform: "PS5", clubColor: "42 87% 55%" },
  { id: 3, name: "Коля", club: "Брайтон", platform: "Xbox", clubColor: "217 90% 50%" },
  { id: 4, name: "Міша", club: "Атлетіко Мадрид", platform: "PS5", clubColor: "0 70% 50%" },
  { id: 5, name: "Жека", club: "Бенфіка", platform: "PS5", clubColor: "0 80% 45%" },
  { id: 6, name: "Ігор", club: "Ліон", platform: "PS5", clubColor: "217 60% 45%" },
  { id: 7, name: "Сашко", club: "Реал Мадрид", platform: "PS5", clubColor: "0 0% 95%" },
  { id: 8, name: "Олексій", club: "Ліль", platform: "PS5", clubColor: "0 75% 40%" },
  { id: 9, name: "Сергій", club: "Марсель", platform: "PS5", clubColor: "200 70% 55%" },
];

function m(home: number, away: number): Match {
  return { home, away, homeScore: null, awayScore: null };
}

export const matchdays: Matchday[] = [
  // === ПЕРШЕ КОЛО ===
  {
    number: 1, date: "2026-04-17", label: "Пт–Сб 17–18.04 · Перше коло",
    bye: 5,
    matches: [
      { home: 4, away: 1, homeScore: 2, awayScore: 6 },
      { home: 9, away: 7, homeScore: 5, awayScore: 3 },
      { home: 6, away: 8, homeScore: 6, awayScore: 6 },
      { home: 3, away: 2, homeScore: 1, awayScore: 7 },
    ],
  },
  {
    number: 2, date: "2026-04-19", label: "Нд 19.04 · Перше коло",
    bye: 5,
    matches: [
      { home: 2, away: 1, homeScore: 4, awayScore: 5 },
      { home: 8, away: 3, homeScore: 5, awayScore: 2 },
      { home: 4, away: 9, homeScore: 2, awayScore: 2 },
      { home: 6, away: 7, homeScore: 4, awayScore: 4 },
    ],
  },
  {
    number: 3, date: "2026-04-26", label: "Сб 26.04 · Перше коло",
    bye: 4,
    matches: [{ home: 1, away: 8, homeScore: null, awayScore: null }, { home: 5, away: 6, homeScore: null, awayScore: null }, { home: 3, away: 9, homeScore: 5, awayScore: 4 }, { home: 7, away: 2, homeScore: 2, awayScore: 6 }],
  },
  {
    number: 4, date: "2026-04-27", label: "Нд 27.04 · Перше коло",
    bye: 1,
    matches: [m(3, 4), { home: 8, away: 9, homeScore: 6, awayScore: 2 }, m(6, 2), m(5, 7)],
  },
  {
    number: 5, date: "2026-05-03", label: "Сб 03.05 · Перше коло",
    bye: 7,
    matches: [m(1, 9), m(3, 5), m(2, 6), m(4, 8)],
  },
  {
    number: 6, date: "2026-05-04", label: "Нд 04.05 · Перше коло",
    bye: 6,
    matches: [m(1, 3), m(7, 4), m(5, 9), m(2, 8)],
  },
  {
    number: 7, date: "2026-05-10", label: "Сб 10.05 · Перше коло",
    bye: 8,
    matches: [m(9, 6), m(4, 5), m(1, 2), m(7, 3)],
  },
  {
    number: 8, date: "2026-05-11", label: "Нд 11.05 · Перше коло",
    bye: 4,
    matches: [m(6, 1), m(8, 7), m(5, 3), m(9, 2)],
  },
  {
    number: 9, date: "2026-05-17", label: "Сб 17.05 · Перше коло",
    bye: 6,
    matches: [m(1, 4), m(8, 5), m(7, 9), m(2, 3)],
  },
  // === ДРУГЕ КОЛО ===
  {
    number: 10, date: "2026-05-18", label: "Нд 18.05 · Друге коло",
    bye: 8,
    matches: [m(6, 9), m(2, 4), m(5, 1), m(3, 7)],
  },
  {
    number: 11, date: "2026-05-24", label: "Сб 24.05 · Друге коло",
    bye: 2,
    matches: [m(5, 8), m(6, 3), m(7, 1), m(9, 4)],
  },
  {
    number: 12, date: "2026-05-25", label: "Нд 25.05 · Друге коло",
    bye: 1,
    matches: [m(4, 2), m(9, 3), m(7, 5), m(6, 8)],
  },
  {
    number: 13, date: "2026-05-31", label: "Сб 31.05 · Друге коло",
    bye: 3,
    matches: [m(9, 8), m(4, 6), m(2, 5), m(1, 7)],
  },
  {
    number: 14, date: "2026-06-01", label: "Нд 01.06 · Друге коло",
    bye: 7,
    matches: [m(3, 8), m(1, 6), m(5, 4), m(2, 9)],
  },
  {
    number: 15, date: "2026-06-07", label: "Сб 07.06 · Друге коло",
    bye: 2,
    matches: [m(4, 7), m(8, 1), m(3, 6), m(9, 5)],
  },
  {
    number: 16, date: "2026-06-08", label: "Нд 08.06 · Друге коло",
    bye: 9,
    matches: [m(4, 3), m(7, 6), m(8, 2), m(1, 5)],
  },
  {
    number: 17, date: "2026-06-14", label: "Сб 14.06 · Друге коло",
    bye: 9,
    matches: [m(2, 7), m(8, 4), m(3, 1), m(6, 5)],
  },
  {
    number: 18, date: "2026-06-15", label: "Нд 15.06 · Друге коло",
    bye: 3,
    matches: [m(9, 1), m(5, 2), m(7, 8), m(6, 4)],
  },
];

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
    md.matches.forEach(match => {
      if (match.homeScore === null || match.awayScore === null) return;

      const home = stats[match.home];
      const away = stats[match.away];

      home.played++;
      away.played++;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.won++; home.points += 3; home.form.push("W");
        away.lost++; away.form.push("L");
      } else if (match.homeScore < match.awayScore) {
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
    md.matches.forEach(match => {
      if (match.homeScore !== null) goals[match.home] += match.homeScore;
      if (match.awayScore !== null) goals[match.away] += match.awayScore;
    });
  });

  return Object.entries(goals)
    .map(([id, g]) => ({ playerId: Number(id), goals: g }))
    .sort((a, b) => b.goals - a.goals);
}

export function getNextMatchday(): Matchday | null {
  for (const md of matchdays) {
    if (md.matches.some(m => m.homeScore === null)) return md;
  }
  return null;
}

export function getNextMatch(): { matchday: Matchday; match: Match } | null {
  for (const md of matchdays) {
    for (const match of md.matches) {
      if (match.homeScore === null) {
        return { matchday: md, match };
      }
    }
  }
  return null;
}

export function getRecentResults(count: number = 5): { matchday: Matchday; match: Match }[] {
  const results: { matchday: Matchday; match: Match }[] = [];
  for (const md of [...matchdays].reverse()) {
    for (const match of [...md.matches].reverse()) {
      if (match.homeScore !== null) {
        results.push({ matchday: md, match });
        if (results.length >= count) return results;
      }
    }
  }
  return results;
}
