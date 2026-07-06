export type WorldCupGroupId = "A" | "B" | "C";

export type WorldCupTeam = {
  group: WorldCupGroupId;
  seed: number;
  player: string;
  team: string;
  name: string;
  platform?: "PS5" | "PC" | "Xbox";
  fc26Nick?: string;
  achievements?: string[];
};

export type WorldCupMatch = {
  id: string;
  number: number;
  date: string;
  day: string;
  stage: string;
  group: WorldCupGroupId | null;
  round: string;
  time: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  note: string;
};

export type WorldCupStanding = {
  player: string;
  team: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export const worldCupStartDate = "2026-06-27T12:00:00+03:00";
export const worldCupFinalDate = "2026-07-19T19:00:00+03:00";
export const worldCupLastUpdated = "06.07.2026";

export const worldCupTeams: WorldCupTeam[] = [
  { group: "A" as WorldCupGroupId, seed: 1, player: "Сергій", team: "Туреччина 🇹🇷", name: "Сергій - Туреччина 🇹🇷", platform: "PS5", fc26Nick: "Flugergehaimer__" },
  { group: "A" as WorldCupGroupId, seed: 2, player: "Ігор", team: "Бельгія 🇧🇪", name: "Ігор - Бельгія 🇧🇪", platform: "PS5", fc26Nick: "BR7ZH" },
  { group: "A" as WorldCupGroupId, seed: 3, player: "Артем", team: "Марокко 🇲🇦", name: "Артем - Марокко 🇲🇦", platform: "PC", fc26Nick: "fen1kssss" },
  { group: "A" as WorldCupGroupId, seed: 4, player: "Коля", team: "Аргентина 🇦🇷", name: "Коля - Аргентина 🇦🇷", platform: "Xbox", fc26Nick: "Fixius777", achievements: ["Переможець кубку"] },
  { group: "A" as WorldCupGroupId, seed: 5, player: "Олексій", team: "Норвегія 🇳🇴", name: "Олексій - Норвегія 🇳🇴", platform: "PS5", fc26Nick: "Mer4iik", achievements: ["3 місце сезону 1"] },
  { group: "B" as WorldCupGroupId, seed: 1, player: "Андрій", team: "Україна 🇺🇦", name: "Андрій - Україна 🇺🇦", platform: "PC", fc26Nick: "Juced99", achievements: ["Переможець сезону 1"] },
  { group: "B" as WorldCupGroupId, seed: 2, player: "Женя", team: "Німеччина 🇩🇪", name: "Женя - Німеччина 🇩🇪", platform: "PC", fc26Nick: "evgnp11" },
  { group: "B" as WorldCupGroupId, seed: 3, player: "Сергій", team: "Іспанія 🇪🇸", name: "Сергій - Іспанія 🇪🇸", platform: "PS5", fc26Nick: "posolua", achievements: ["Фіналіст кубку"] },
  { group: "B" as WorldCupGroupId, seed: 4, player: "Влад", team: "Хорватія 🇭🇷", name: "Влад - Хорватія 🇭🇷", platform: "PS5", fc26Nick: "d_Xyqenko", achievements: ["2 місце сезону 1"] },
  { group: "B" as WorldCupGroupId, seed: 5, player: "Дмитро", team: "Бразилія 🇧🇷", name: "Дмитро - Бразилія 🇧🇷", platform: "PS5", fc26Nick: "LusuyKrab" },
  { group: "C" as WorldCupGroupId, seed: 1, player: "Кіріл", team: "Нідерланди 🇳🇱", name: "Кіріл - Нідерланди 🇳🇱", platform: "PC", fc26Nick: "orid27" },
  { group: "C" as WorldCupGroupId, seed: 2, player: "Саня", team: "Португалія 🇵🇹", name: "Саня - Португалія 🇵🇹", platform: "PS5", fc26Nick: "b2k_alex" },
  { group: "C" as WorldCupGroupId, seed: 3, player: "Дімас", team: "Уругвай 🇺🇾", name: "Дімас - Уругвай 🇺🇾", platform: "PC", fc26Nick: "Viking240222" },
  { group: "C" as WorldCupGroupId, seed: 4, player: "Жека", team: "Франція 🇫🇷", name: "Жека - Франція 🇫🇷", platform: "PS5", fc26Nick: "katrik_89" },
  { group: "C" as WorldCupGroupId, seed: 5, player: "Майкл", team: "Англія 🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "Майкл - Англія 🏴󠁧󠁢󠁥󠁮󠁧󠁿", platform: "PS5", fc26Nick: "early_actor62" },
];

export const worldCupMatches: WorldCupMatch[] = [
  { id: "WC26-01", number: 1, date: "27.06.2026", day: "Сб", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 1", time: "12:00", home: "Ігор - Бельгія 🇧🇪", away: "Олексій - Норвегія 🇳🇴", homeScore: 3, awayScore: 5, note: "" },
  { id: "WC26-02", number: 2, date: "27.06.2026", day: "Сб", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 1", time: "13:30", home: "Артем - Марокко 🇲🇦", away: "Коля - Аргентина 🇦🇷", homeScore: 3, awayScore: 4, note: "" },
  { id: "WC26-03", number: 3, date: "27.06.2026", day: "Сб", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 1", time: "15:00", home: "Женя - Німеччина 🇩🇪", away: "Дмитро - Бразилія 🇧🇷", homeScore: 12, awayScore: 2, note: "" },
  { id: "WC26-04", number: 4, date: "27.06.2026", day: "Сб", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 1", time: "16:30", home: "Сергій - Іспанія 🇪🇸", away: "Влад - Хорватія 🇭🇷", homeScore: 1, awayScore: 3, note: "" },
  { id: "WC26-05", number: 5, date: "27.06.2026", day: "Сб", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 1", time: "18:00", home: "Саня - Португалія 🇵🇹", away: "Майкл - Англія 🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeScore: 2, awayScore: 0, note: "" },
  { id: "WC26-06", number: 6, date: "27.06.2026", day: "Сб", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 1", time: "19:30", home: "Дімас - Уругвай 🇺🇾", away: "Жека - Франція 🇫🇷", homeScore: 2, awayScore: 1, note: "" },
  { id: "WC26-07", number: 7, date: "28.06.2026", day: "Нд", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 2", time: "12:00", home: "Сергій - Туреччина 🇹🇷", away: "Олексій - Норвегія 🇳🇴", homeScore: 6, awayScore: 3, note: "" },
  { id: "WC26-08", number: 8, date: "28.06.2026", day: "Нд", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 2", time: "13:30", home: "Ігор - Бельгія 🇧🇪", away: "Артем - Марокко 🇲🇦", homeScore: 3, awayScore: 2, note: "" },
  { id: "WC26-09", number: 9, date: "28.06.2026", day: "Нд", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 2", time: "15:00", home: "Андрій - Україна 🇺🇦", away: "Дмитро - Бразилія 🇧🇷", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-10", number: 10, date: "28.06.2026", day: "Нд", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 2", time: "16:30", home: "Женя - Німеччина 🇩🇪", away: "Сергій - Іспанія 🇪🇸", homeScore: 12, awayScore: 1, note: "" },
  { id: "WC26-11", number: 11, date: "28.06.2026", day: "Нд", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 2", time: "18:00", home: "Кіріл - Нідерланди 🇳🇱", away: "Майкл - Англія 🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeScore: 8, awayScore: 0, note: "" },
  { id: "WC26-12", number: 12, date: "28.06.2026", day: "Нд", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 2", time: "19:30", home: "Саня - Португалія 🇵🇹", away: "Дімас - Уругвай 🇺🇾", homeScore: 0, awayScore: 3, note: "" },
  { id: "WC26-13", number: 13, date: "04.07.2026", day: "Сб", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 3", time: "12:00", home: "Сергій - Туреччина 🇹🇷", away: "Коля - Аргентина 🇦🇷", homeScore: 10, awayScore: 0, note: "" },
  { id: "WC26-14", number: 14, date: "04.07.2026", day: "Сб", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 3", time: "13:30", home: "Олексій - Норвегія 🇳🇴", away: "Артем - Марокко 🇲🇦", homeScore: 5, awayScore: 5, note: "" },
  { id: "WC26-15", number: 15, date: "04.07.2026", day: "Сб", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 3", time: "15:00", home: "Андрій - Україна 🇺🇦", away: "Влад - Хорватія 🇭🇷", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-16", number: 16, date: "04.07.2026", day: "Сб", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 3", time: "16:30", home: "Дмитро - Бразилія 🇧🇷", away: "Сергій - Іспанія 🇪🇸", homeScore: 0, awayScore: 3, note: "" },
  { id: "WC26-17", number: 17, date: "04.07.2026", day: "Сб", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 3", time: "18:00", home: "Кіріл - Нідерланди 🇳🇱", away: "Жека - Франція 🇫🇷", homeScore: 9, awayScore: 2, note: "" },
  { id: "WC26-18", number: 18, date: "04.07.2026", day: "Сб", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 3", time: "19:30", home: "Майкл - Англія 🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Дімас - Уругвай 🇺🇾", homeScore: 2, awayScore: 6, note: "" },
  { id: "WC26-19", number: 19, date: "05.07.2026", day: "Нд", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 4", time: "12:00", home: "Сергій - Туреччина 🇹🇷", away: "Артем - Марокко 🇲🇦", homeScore: 3, awayScore: 2, note: "" },
  { id: "WC26-20", number: 20, date: "05.07.2026", day: "Нд", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 4", time: "13:30", home: "Коля - Аргентина 🇦🇷", away: "Ігор - Бельгія 🇧🇪", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-21", number: 21, date: "05.07.2026", day: "Нд", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 4", time: "15:00", home: "Андрій - Україна 🇺🇦", away: "Сергій - Іспанія 🇪🇸", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-22", number: 22, date: "05.07.2026", day: "Нд", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 4", time: "16:30", home: "Влад - Хорватія 🇭🇷", away: "Женя - Німеччина 🇩🇪", homeScore: 2, awayScore: 2, note: "" },
  { id: "WC26-23", number: 23, date: "05.07.2026", day: "Нд", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 4", time: "18:00", home: "Кіріл - Нідерланди 🇳🇱", away: "Дімас - Уругвай 🇺🇾", homeScore: 5, awayScore: 4, note: "" },
  { id: "WC26-24", number: 24, date: "05.07.2026", day: "Нд", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 4", time: "19:30", home: "Жека - Франція 🇫🇷", away: "Саня - Португалія 🇵🇹", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-25", number: 25, date: "11.07.2026", day: "Сб", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 5", time: "12:00", home: "Сергій - Туреччина 🇹🇷", away: "Ігор - Бельгія 🇧🇪", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-26", number: 26, date: "11.07.2026", day: "Сб", stage: "Група", group: "A" as WorldCupGroupId, round: "Тур 5", time: "13:30", home: "Коля - Аргентина 🇦🇷", away: "Олексій - Норвегія 🇳🇴", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-27", number: 27, date: "11.07.2026", day: "Сб", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 5", time: "15:00", home: "Андрій - Україна 🇺🇦", away: "Женя - Німеччина 🇩🇪", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-28", number: 28, date: "11.07.2026", day: "Сб", stage: "Група", group: "B" as WorldCupGroupId, round: "Тур 5", time: "16:30", home: "Влад - Хорватія 🇭🇷", away: "Дмитро - Бразилія 🇧🇷", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-29", number: 29, date: "11.07.2026", day: "Сб", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 5", time: "18:00", home: "Кіріл - Нідерланди 🇳🇱", away: "Саня - Португалія 🇵🇹", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-30", number: 30, date: "11.07.2026", day: "Сб", stage: "Група", group: "C" as WorldCupGroupId, round: "Тур 5", time: "19:30", home: "Жека - Франція 🇫🇷", away: "Майкл - Англія 🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeScore: null, awayScore: null, note: "" },
  { id: "WC26-31", number: 31, date: "12.07.2026", day: "Нд", stage: "1/4", group: null, round: "QF-1", time: "12:00", home: "Жереб після груп", away: "Жереб після груп", homeScore: null, awayScore: null, note: "Пари 1/4 визначить окремий жереб після групового етапу." },
  { id: "WC26-32", number: 32, date: "12.07.2026", day: "Нд", stage: "1/4", group: null, round: "QF-2", time: "13:30", home: "Жереб після груп", away: "Жереб після груп", homeScore: null, awayScore: null, note: "Пари 1/4 визначить окремий жереб після групового етапу." },
  { id: "WC26-33", number: 33, date: "12.07.2026", day: "Нд", stage: "1/4", group: null, round: "QF-3", time: "15:00", home: "Жереб після груп", away: "Жереб після груп", homeScore: null, awayScore: null, note: "Пари 1/4 визначить окремий жереб після групового етапу." },
  { id: "WC26-34", number: 34, date: "12.07.2026", day: "Нд", stage: "1/4", group: null, round: "QF-4", time: "16:30", home: "Жереб після груп", away: "Жереб після груп", homeScore: null, awayScore: null, note: "Пари 1/4 визначить окремий жереб після групового етапу." },
  { id: "WC26-35", number: 35, date: "18.07.2026", day: "Сб", stage: "1/2", group: null, round: "SF-1", time: "15:00", home: "Жереб після 1/4", away: "Жереб після 1/4", homeScore: null, awayScore: null, note: "Пари 1/2 визначить новий жереб після чвертьфіналів." },
  { id: "WC26-36", number: 36, date: "18.07.2026", day: "Сб", stage: "1/2", group: null, round: "SF-2", time: "17:00", home: "Жереб після 1/4", away: "Жереб після 1/4", homeScore: null, awayScore: null, note: "Пари 1/2 визначить новий жереб після чвертьфіналів." },
  { id: "WC26-37", number: 37, date: "19.07.2026", day: "Нд", stage: "Матч за 3 місце", group: null, round: "3rd", time: "17:00", home: "Після 1/2", away: "Після 1/2", homeScore: null, awayScore: null, note: "Учасники матчу за 3 місце стануть відомі після півфіналів." },
  { id: "WC26-38", number: 38, date: "19.07.2026", day: "Нд", stage: "Фінал", group: null, round: "Final", time: "19:00", home: "Після 1/2", away: "Після 1/2", homeScore: null, awayScore: null, note: "Фіналісти стануть відомі після півфіналів." },
];

export const worldCupGroups = (["A", "B", "C"] as WorldCupGroupId[]).map(id => ({
  id,
  title: `Група ${id}`,
  teams: worldCupTeams.filter(team => team.group === id),
}));

export function isPlayed(match: WorldCupMatch) {
  return match.homeScore !== null && match.awayScore !== null;
}

export function matchDateTime(match: WorldCupMatch) {
  const [day, month, year] = match.date.split(".");
  return `${year}-${month}-${day}T${match.time}:00+03:00`;
}

export function formatMatchDate(match: WorldCupMatch) {
  return `${match.day} ${match.date} · ${match.time}`;
}

export function calculateWorldCupStandings(groupId: WorldCupGroupId): WorldCupStanding[] {
  const rows = new Map<string, WorldCupStanding>();

  worldCupTeams
    .filter(team => team.group === groupId)
    .forEach(team => {
      rows.set(team.name, {
        player: team.player,
        team: team.team,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

  worldCupMatches
    .filter(match => match.group === groupId && isPlayed(match))
    .forEach(match => {
      const home = rows.get(match.home);
      const away = rows.get(match.away);
      if (!home || !away || match.homeScore === null || match.awayScore === null) return;

      home.played += 1;
      away.played += 1;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.won += 1;
        away.lost += 1;
        home.points += 3;
      } else if (match.homeScore < match.awayScore) {
        away.won += 1;
        home.lost += 1;
        away.points += 3;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  return [...rows.values()]
    .map(row => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name, "uk")
    );
}

export function getNextWorldCupMatches(now = new Date()) {
  const nowTime = now.getTime();
  const upcoming = worldCupMatches
    .filter(match => !isPlayed(match) && new Date(matchDateTime(match)).getTime() >= nowTime)
    .sort((a, b) => new Date(matchDateTime(a)).getTime() - new Date(matchDateTime(b)).getTime());
  return upcoming.length ? upcoming : worldCupMatches.filter(match => !isPlayed(match)).slice(0, 6);
}

export function getPlayedWorldCupMatches() {
  return worldCupMatches.filter(isPlayed);
}

export function getWorldCupStandings() {
  return worldCupGroups.flatMap(group => calculateWorldCupStandings(group.id));
}

export function getWorldCupTopScorers() {
  return getWorldCupStandings()
    .sort((a, b) =>
      b.goalsFor - a.goalsFor ||
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      a.name.localeCompare(b.name, "uk")
    );
}

export function getWorldCupBestDefense() {
  return getWorldCupStandings()
    .sort((a, b) =>
      a.goalsAgainst - b.goalsAgainst ||
      b.played - a.played ||
      b.goalDifference - a.goalDifference ||
      b.points - a.points ||
      a.name.localeCompare(b.name, "uk")
    );
}

export function groupMatchesByDate(matches: WorldCupMatch[]) {
  return matches.reduce<Record<string, WorldCupMatch[]>>((groups, match) => {
    const key = `${match.day} ${match.date}`;
    groups[key] = [...(groups[key] ?? []), match];
    return groups;
  }, {});
}
