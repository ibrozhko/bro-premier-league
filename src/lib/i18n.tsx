import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Player } from "@/data/leagueData";

export type Language = "uk" | "en";

type TranslationKey =
  | "nav.home"
  | "nav.fixtures"
  | "nav.players"
  | "nav.topScorers"
  | "nav.bestDefense"
  | "hero.subtitle"
  | "common.updated"
  | "common.all"
  | "common.played"
  | "common.upcoming"
  | "common.player"
  | "common.club"
  | "home.leader"
  | "home.played"
  | "home.goals"
  | "home.attack"
  | "home.defense"
  | "home.conceded"
  | "home.matches"
  | "home.seasonGoals"
  | "home.nextMatch"
  | "home.openingMatch"
  | "home.matchdayGames"
  | "home.games"
  | "home.recentResults"
  | "home.allMatches"
  | "home.table"
  | "home.tableLegend"
  | "countdown.days"
  | "countdown.hours"
  | "countdown.minutes"
  | "countdown.seconds"
  | "fixtures.title"
  | "fixtures.playerFilter"
  | "fixtures.statusFilter"
  | "fixtures.matchdayFilter"
  | "fixtures.bye"
  | "players.title"
  | "topScorers.title"
  | "topScorers.goals"
  | "bestDefense.title"
  | "bestDefense.goalsAgainst"
  | "footer.about"
  | "footer.rules"
  | "footer.ruleWin"
  | "footer.ruleDraw"
  | "footer.ruleLoss"
  | "footer.ruleTiebreak"
  | "footer.ruleRound"
  | "footer.follow"
  | "footer.twitch"
  | "footer.youtube"
  | "footer.support"
  | "footer.live"
  | "footer.rights"
  | "notFound.message"
  | "notFound.home";

const translations: Record<Language, Record<TranslationKey, string>> = {
  uk: {
    "nav.home": "Головна",
    "nav.fixtures": "Матчі",
    "nav.players": "Гравці",
    "nav.topScorers": "Бомбардири",
    "nav.bestDefense": "Захист",
    "hero.subtitle": "FC 26 · Приватна Ліга · Сезон 1 · 9 Гравців · 72 Матчі",
    "common.updated": "Оновлено",
    "common.all": "Всі",
    "common.played": "Зіграні",
    "common.upcoming": "Майбутні",
    "common.player": "Гравець",
    "common.club": "Клуб",
    "home.leader": "Лідер",
    "home.played": "Зіграно",
    "home.goals": "Голів",
    "home.attack": "Атака",
    "home.defense": "Захист",
    "home.conceded": "Пропущено",
    "home.matches": "матчів",
    "home.seasonGoals": "у сезоні",
    "home.nextMatch": "Наступний матч",
    "home.openingMatch": "Матч Відкриття",
    "home.matchdayGames": "Матчі",
    "home.games": "Ігри",
    "home.recentResults": "Результати",
    "home.allMatches": "Всі матчі",
    "home.table": "Таблиця",
    "home.tableLegend": "І — ігри, В — перемоги, Н — нічиї, П — поразки, ГЗ — голи забиті, ГП — голи пропущені, РГ — різниця голів, О — очки.",
    "countdown.days": "Днів",
    "countdown.hours": "Годин",
    "countdown.minutes": "Хвилин",
    "countdown.seconds": "Секунд",
    "fixtures.title": "Матчі та Результати",
    "fixtures.playerFilter": "Фільтр по гравцю",
    "fixtures.statusFilter": "Статус матчів",
    "fixtures.matchdayFilter": "Фільтр по туру",
    "fixtures.bye": "Відпочиває",
    "players.title": "Гравці",
    "topScorers.title": "Бомбардири",
    "topScorers.goals": "Голи",
    "bestDefense.title": "Найкращий захист",
    "bestDefense.goalsAgainst": "Пропущені",
    "footer.about": "Приватна ліга FC 26 · Сезон 1 · 9 гравців · 18 турів · 72 матчі. Подвійне коло · Квітень – Червень 2026.",
    "footer.rules": "Правила",
    "footer.ruleWin": "Перемога — 3 очки",
    "footer.ruleDraw": "Нічия — 1 очко",
    "footer.ruleLoss": "Поразка — 0 очок",
    "footer.ruleTiebreak": "Тайбрейк: очки → різниця голів → голи забиті",
    "footer.ruleRound": "Кожен тур — 4 матчі + 1 відпочиває",
    "footer.follow": "Стежити за лігою",
    "footer.twitch": "BPL на Twitch",
    "footer.youtube": "BPL на YouTube",
    "footer.support": "На розвиток ліги",
    "footer.live": "Трансляції матчів та турнірів у прямому ефірі.",
    "footer.rights": "© 2026 Bro Premier League. Всі права захищені.",
    "notFound.message": "Сторінку не знайдено",
    "notFound.home": "Повернутися на головну",
  },
  en: {
    "nav.home": "Home",
    "nav.fixtures": "Fixtures",
    "nav.players": "Players",
    "nav.topScorers": "Top Scorers",
    "nav.bestDefense": "Defense",
    "hero.subtitle": "FC 26 · Private League · Season 1 · 9 Players · 72 Matches",
    "common.updated": "Updated",
    "common.all": "All",
    "common.played": "Played",
    "common.upcoming": "Upcoming",
    "common.player": "Player",
    "common.club": "Club",
    "home.leader": "Leader",
    "home.played": "Played",
    "home.goals": "Goals",
    "home.attack": "Attack",
    "home.defense": "Defense",
    "home.conceded": "Conceded",
    "home.matches": "matches",
    "home.seasonGoals": "this season",
    "home.nextMatch": "Next match",
    "home.openingMatch": "Opening Match",
    "home.matchdayGames": "Matches",
    "home.games": "Games",
    "home.recentResults": "Results",
    "home.allMatches": "All matches",
    "home.table": "Standings",
    "home.tableLegend": "P — played, W — wins, D — draws, L — losses, GF — goals for, GA — goals against, GD — goal difference, Pts — points.",
    "countdown.days": "Days",
    "countdown.hours": "Hours",
    "countdown.minutes": "Minutes",
    "countdown.seconds": "Seconds",
    "fixtures.title": "Fixtures and Results",
    "fixtures.playerFilter": "Player filter",
    "fixtures.statusFilter": "Match status",
    "fixtures.matchdayFilter": "Matchday filter",
    "fixtures.bye": "Bye",
    "players.title": "Players",
    "topScorers.title": "Top Scorers",
    "topScorers.goals": "Goals",
    "bestDefense.title": "Best Defense",
    "bestDefense.goalsAgainst": "Conceded",
    "footer.about": "Private FC 26 league · Season 1 · 9 players · 18 matchdays · 72 matches. Double round-robin · April – June 2026.",
    "footer.rules": "Rules",
    "footer.ruleWin": "Win — 3 points",
    "footer.ruleDraw": "Draw — 1 point",
    "footer.ruleLoss": "Loss — 0 points",
    "footer.ruleTiebreak": "Tiebreak: points → goal difference → goals for",
    "footer.ruleRound": "Each matchday — 4 matches + 1 bye",
    "footer.follow": "Follow the league",
    "footer.twitch": "BPL on Twitch",
    "footer.youtube": "BPL on YouTube",
    "footer.support": "Support the league",
    "footer.live": "Live broadcasts of matches and tournaments.",
    "footer.rights": "© 2026 Bro Premier League. All rights reserved.",
    "notFound.message": "Page not found",
    "notFound.home": "Return home",
  },
};

const playerTranslations: Record<number, Record<Language, { name: string; club: string }>> = {
  1: { uk: { name: "Андрій", club: "Динамо Київ" }, en: { name: "Andrii", club: "Dynamo Kyiv" } },
  2: { uk: { name: "Влад", club: "Аль Наср" }, en: { name: "Vlad", club: "Al Nassr" } },
  3: { uk: { name: "Коля", club: "Брайтон" }, en: { name: "Kolia", club: "Brighton" } },
  4: { uk: { name: "Міша", club: "Атлетіко Мадрид" }, en: { name: "Misha", club: "Atletico Madrid" } },
  5: { uk: { name: "Жека", club: "Бенфіка" }, en: { name: "Zheka", club: "Benfica" } },
  6: { uk: { name: "Ігор", club: "Ліон" }, en: { name: "Ihor", club: "Lyon" } },
  7: { uk: { name: "Сашко", club: "Реал Мадрид" }, en: { name: "Sashko", club: "Real Madrid" } },
  8: { uk: { name: "Олексій", club: "Ліль" }, en: { name: "Oleksii", club: "Lille" } },
  9: { uk: { name: "Сергій", club: "Марсель" }, en: { name: "Serhii", club: "Marseille" } },
};

const matchdayTokenMap: Record<Language, Record<string, string>> = {
  uk: {},
  en: {
    "Пт–Сб": "Fri-Sat",
    "Нд": "Sun",
    "Сб": "Sat",
    "Перше коло": "First leg",
    "Друге коло": "Second leg",
    "·": "·",
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  player: (player: Player) => Player;
  matchdayLabel: (label: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "uk";
    return window.localStorage.getItem("bpl-language") === "en" ? "en" : "uk";
  });

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("bpl-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "uk" ? "en" : "uk"),
    t: key => translations[language][key],
    player: source => {
      const translated = playerTranslations[source.id]?.[language];
      return translated ? { ...source, ...translated } : source;
    },
    matchdayLabel: label => {
      let translated = label;
      Object.entries(matchdayTokenMap[language]).forEach(([from, to]) => {
        translated = translated.split(from).join(to);
      });
      return translated;
    },
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
