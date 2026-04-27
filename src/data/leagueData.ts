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
