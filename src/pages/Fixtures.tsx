import { useState } from "react";
import { matchdays, getPlayer, players } from "@/data/leagueData";
import { useLanguage } from "@/lib/i18n";

export default function Fixtures() {
  const { language, matchdayLabel, player, t } = useLanguage();
  const [filter, setFilter] = useState<number | "all">("all");
  const [playerFilter, setPlayerFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "played" | "upcoming">("all");

  const filteredByTour = filter === "all" ? matchdays : matchdays.filter(md => md.number === filter);
  const filteredByPlayer = playerFilter === "all"
    ? filteredByTour
    : filteredByTour
        .map(md => ({ ...md, matches: md.matches.filter(m => m.home === playerFilter || m.away === playerFilter) }))
        .filter(md => md.matches.length > 0);
  const filtered = statusFilter === "all"
    ? filteredByPlayer
    : filteredByPlayer
        .map(md => ({
          ...md,
          matches: md.matches.filter(m => statusFilter === "played" ? m.homeScore !== null : m.homeScore === null),
        }))
        .filter(md => md.matches.length > 0);
  const activeFilterClass = "filter-chip-active";
  const inactiveFilterClass = "filter-chip";

  return (
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <div className="page-header">
          <div className="page-kicker">{language === "uk" ? "Календар ліги" : "League schedule"}</div>
          <h1 className="h-page">{t("fixtures.title")}</h1>
        </div>

        <div className="mb-6">
          <div className="t-label mb-2">{t("fixtures.playerFilter")}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setPlayerFilter("all")}
                className={`${
                playerFilter === "all" ? activeFilterClass : inactiveFilterClass
              }`}
            >
              {language === "uk" ? "Всі гравці" : "All players"}
            </button>
            {players.map(p => (
              <button
                key={p.id}
                onClick={() => setPlayerFilter(p.id)}
                className={`${
                  playerFilter === p.id ? activeFilterClass : inactiveFilterClass
                }`}
              >
                {player(p).name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="t-label mb-2">{t("fixtures.statusFilter")}</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "all", label: t("common.all") },
              { value: "played", label: t("common.played") },
              { value: "upcoming", label: t("common.upcoming") },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value as typeof statusFilter)}
                className={`${
                  statusFilter === item.value ? activeFilterClass : inactiveFilterClass
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="t-label mb-2">{t("fixtures.matchdayFilter")}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setFilter("all")}
                className={`${
                filter === "all" ? activeFilterClass : inactiveFilterClass
              }`}
            >
              {t("common.all")}
            </button>
            {matchdays.map(md => (
              <button
                key={md.number}
                onClick={() => setFilter(md.number)}
                className={`${
                  filter === md.number ? activeFilterClass : inactiveFilterClass
                }`}
              >
                {md.number}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filtered.map(md => {
            const byePlayer = getPlayer(md.bye);
            const displayByePlayer = player(byePlayer);

            const MatchRow = ({ m }: { m: typeof md.matches[0] }) => {
              const home = getPlayer(m.home);
              const away = getPlayer(m.away);
              const displayHome = player(home);
              const displayAway = player(away);
              const played = m.homeScore !== null;
              return (
                <div className="px-3 sm:px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                  <div className="min-w-0 text-right">
                    <span className="font-medium t-body block truncate">{displayHome.name}</span>
                    <span className="t-meta sm:ml-2 block sm:inline truncate">{displayHome.club}</span>
                  </div>
                  <div className="min-w-[56px] sm:min-w-[70px] text-center">
                    {played ? (
                      <span className="font-heading text-lg sm:text-2xl text-primary">{m.homeScore} - {m.awayScore}</span>
                    ) : (
                      <div className="text-muted-foreground font-heading text-lg sm:text-2xl">VS</div>
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="font-medium t-body block truncate">{displayAway.name}</span>
                    <span className="t-meta sm:mr-2 block sm:inline truncate">{displayAway.club}</span>
                  </div>
                </div>
              );
            };

            return (
              <div key={md.number} className="space-y-4">
                <div className="light-panel overflow-hidden rounded-md">
                  <div className="h-px bg-primary" />
                  <div className="px-3 sm:px-6 py-4 flex items-center justify-between gap-3 bg-[#f3f3f6]">
                    <span className="h-card">{language === "uk" ? "Тур" : "Matchday"} {md.number}</span>
                    <span className="t-meta text-right">{matchdayLabel(md.label)}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {md.matches.map((m, mi) => (
                      <MatchRow key={mi} m={m} />
                    ))}
                  </div>
                  <div className="px-3 sm:px-6 py-3 border-t border-[#2937da]/15 bg-[#f3f3f6] t-meta">
                    {t("fixtures.bye")}: {displayByePlayer.name} ({displayByePlayer.club})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
