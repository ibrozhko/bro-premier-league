import leagueData from "./leagueData.json";

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

export interface LeagueData {
  season: number;
  lastUpdated: string;
  players: Player[];
  matchdays: Matchday[];
}

export const currentSeason = (leagueData as LeagueData).season;
export const lastUpdated = (leagueData as LeagueData).lastUpdated;
export const players = (leagueData as LeagueData).players;
export const matchdays = (leagueData as LeagueData).matchdays;

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
