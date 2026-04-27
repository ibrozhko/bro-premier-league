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

export const lastUpdated = "27.04.2026";

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

export const matchdays: Matchday[] = [
  // Щотижневе оновлення: міняйте тільки homeScore та awayScore.
  // Якщо матч ще не зіграний, залишайте обидва значення null.
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
    number: 3, date: "2026-04-25", label: "Сб 25.04 · Перше коло",
    bye: 4,
    matches: [
      { home: 1, away: 8, homeScore: 6, awayScore: 2 },
      { home: 5, away: 6, homeScore: 1, awayScore: 7 },
      { home: 3, away: 9, homeScore: 5, awayScore: 4 },
      { home: 7, away: 2, homeScore: 2, awayScore: 6 },
    ],
  },
  {
    number: 4, date: "2026-04-26", label: "Нд 26.04 · Перше коло",
    bye: 1,
    matches: [
      { home: 3, away: 4, homeScore: 5, awayScore: 7 },
      { home: 8, away: 9, homeScore: 6, awayScore: 2 },
      { home: 6, away: 2, homeScore: 0, awayScore: 2 },
      { home: 5, away: 7, homeScore: 1, awayScore: 2 },
    ],
  },
  {
    number: 5, date: "2026-05-02", label: "Сб 02.05 · Перше коло",
    bye: 7,
    matches: [
      { home: 1, away: 9, homeScore: null, awayScore: null },
      { home: 3, away: 5, homeScore: null, awayScore: null },
      { home: 2, away: 6, homeScore: null, awayScore: null },
      { home: 4, away: 8, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 6, date: "2026-05-03", label: "Нд 03.05 · Перше коло",
    bye: 6,
    matches: [
      { home: 1, away: 3, homeScore: null, awayScore: null },
      { home: 7, away: 4, homeScore: null, awayScore: null },
      { home: 5, away: 9, homeScore: null, awayScore: null },
      { home: 2, away: 8, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 7, date: "2026-05-09", label: "Сб 09.05 · Перше коло",
    bye: 8,
    matches: [
      { home: 9, away: 6, homeScore: null, awayScore: null },
      { home: 4, away: 5, homeScore: null, awayScore: null },
      { home: 1, away: 2, homeScore: null, awayScore: null },
      { home: 7, away: 3, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 8, date: "2026-05-10", label: "Нд 10.05 · Перше коло",
    bye: 4,
    matches: [
      { home: 6, away: 1, homeScore: null, awayScore: null },
      { home: 8, away: 7, homeScore: null, awayScore: null },
      { home: 5, away: 3, homeScore: null, awayScore: null },
      { home: 9, away: 2, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 9, date: "2026-05-16", label: "Сб 16.05 · Перше коло",
    bye: 6,
    matches: [
      { home: 1, away: 4, homeScore: null, awayScore: null },
      { home: 8, away: 5, homeScore: null, awayScore: null },
      { home: 7, away: 9, homeScore: null, awayScore: null },
      { home: 2, away: 3, homeScore: null, awayScore: null },
    ],
  },
  // === ДРУГЕ КОЛО ===
  {
    number: 10, date: "2026-05-17", label: "Нд 17.05 · Друге коло",
    bye: 8,
    matches: [
      { home: 6, away: 9, homeScore: null, awayScore: null },
      { home: 2, away: 4, homeScore: null, awayScore: null },
      { home: 5, away: 1, homeScore: null, awayScore: null },
      { home: 3, away: 7, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 11, date: "2026-05-23", label: "Сб 23.05 · Друге коло",
    bye: 2,
    matches: [
      { home: 5, away: 8, homeScore: null, awayScore: null },
      { home: 6, away: 3, homeScore: null, awayScore: null },
      { home: 7, away: 1, homeScore: null, awayScore: null },
      { home: 9, away: 4, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 12, date: "2026-05-24", label: "Нд 24.05 · Друге коло",
    bye: 1,
    matches: [
      { home: 4, away: 2, homeScore: null, awayScore: null },
      { home: 9, away: 3, homeScore: null, awayScore: null },
      { home: 7, away: 5, homeScore: null, awayScore: null },
      { home: 6, away: 8, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 13, date: "2026-05-30", label: "Сб 30.05 · Друге коло",
    bye: 3,
    matches: [
      { home: 9, away: 8, homeScore: null, awayScore: null },
      { home: 4, away: 6, homeScore: null, awayScore: null },
      { home: 2, away: 5, homeScore: null, awayScore: null },
      { home: 1, away: 7, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 14, date: "2026-05-31", label: "Нд 31.05 · Друге коло",
    bye: 7,
    matches: [
      { home: 3, away: 8, homeScore: null, awayScore: null },
      { home: 1, away: 6, homeScore: null, awayScore: null },
      { home: 5, away: 4, homeScore: null, awayScore: null },
      { home: 2, away: 9, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 15, date: "2026-06-06", label: "Сб 06.06 · Друге коло",
    bye: 2,
    matches: [
      { home: 4, away: 7, homeScore: null, awayScore: null },
      { home: 8, away: 1, homeScore: null, awayScore: null },
      { home: 3, away: 6, homeScore: null, awayScore: null },
      { home: 9, away: 5, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 16, date: "2026-06-07", label: "Нд 07.06 · Друге коло",
    bye: 9,
    matches: [
      { home: 4, away: 3, homeScore: null, awayScore: null },
      { home: 7, away: 6, homeScore: null, awayScore: null },
      { home: 8, away: 2, homeScore: null, awayScore: null },
      { home: 1, away: 5, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 17, date: "2026-06-13", label: "Сб 13.06 · Друге коло",
    bye: 9,
    matches: [
      { home: 2, away: 7, homeScore: null, awayScore: null },
      { home: 8, away: 4, homeScore: null, awayScore: null },
      { home: 3, away: 1, homeScore: null, awayScore: null },
      { home: 6, away: 5, homeScore: null, awayScore: null },
    ],
  },
  {
    number: 18, date: "2026-06-14", label: "Нд 14.06 · Друге коло",
    bye: 3,
    matches: [
      { home: 9, away: 1, homeScore: null, awayScore: null },
      { home: 5, away: 2, homeScore: null, awayScore: null },
      { home: 7, away: 8, homeScore: null, awayScore: null },
      { home: 6, away: 4, homeScore: null, awayScore: null },
    ],
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

export function getSeasonSummary() {
  const playedMatches = matchdays.flatMap(md => md.matches).filter(match => match.homeScore !== null && match.awayScore !== null);
  const totalMatches = matchdays.reduce((sum, md) => sum + md.matches.length, 0);
  const totalGoals = playedMatches.reduce((sum, match) => sum + match.homeScore! + match.awayScore!, 0);
  const standings = calculateStandings();
  const leader = standings[0] ? getPlayer(standings[0].playerId) : null;
  const bestAttack = standings.length > 0
    ? standings.reduce((best, current) => current.goalsFor > best.goalsFor ? current : best)
    : null;

  return {
    leader,
    bestAttack: bestAttack ? getPlayer(bestAttack.playerId) : null,
    bestAttackGoals: bestAttack?.goalsFor ?? 0,
    playedMatches: playedMatches.length,
    totalMatches,
    totalGoals,
  };
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
