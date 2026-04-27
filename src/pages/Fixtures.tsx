import { useState } from "react";
import { matchdays, getPlayer, players } from "@/data/leagueData";

export default function Fixtures() {
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

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="h-page mb-8">Матчі та Результати</h1>

        <div className="mb-6">
          <div className="t-label mb-2">Фільтр по гравцю</div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setPlayerFilter("all")}
              className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                playerFilter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Всі гравці
            </button>
            {players.map(p => (
              <button
                key={p.id}
                onClick={() => setPlayerFilter(p.id)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  playerFilter === p.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="t-label mb-2">Статус матчів</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "all", label: "Всі" },
              { value: "played", label: "Зіграні" },
              { value: "upcoming", label: "Майбутні" },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value as typeof statusFilter)}
                className={`px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === item.value ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="t-label mb-2">Фільтр по туру</div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Всі
            </button>
            {matchdays.map(md => (
              <button
                key={md.number}
                onClick={() => setFilter(md.number)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === md.number ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
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

            const MatchRow = ({ m }: { m: typeof md.matches[0] }) => {
              const home = getPlayer(m.home);
              const away = getPlayer(m.away);
              const played = m.homeScore !== null;
              return (
                <div className="px-3 sm:px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                  <div className="min-w-0 text-right">
                    <span className="font-medium t-body md:text-lg block truncate">{home.name}</span>
                    <span className="t-meta sm:ml-2 block sm:inline truncate">{home.club}</span>
                  </div>
                  <div className="min-w-[56px] sm:min-w-[70px] text-center">
                    {played ? (
                      <span className="font-heading text-xl sm:text-2xl text-accent">{m.homeScore} - {m.awayScore}</span>
                    ) : (
                      <div className="text-muted-foreground font-heading text-xl sm:text-2xl">VS</div>
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="font-medium t-body md:text-lg block truncate">{away.name}</span>
                    <span className="t-meta sm:mr-2 block sm:inline truncate">{away.club}</span>
                  </div>
                </div>
              );
            };

            return (
              <div key={md.number} className="space-y-4">
                <div className="bg-card rounded-xl border overflow-hidden border-border">
                  <div className="px-3 sm:px-6 py-4 flex items-center justify-between gap-3 bg-secondary/50">
                    <span className="h-card">Тур {md.number}</span>
                    <span className="t-meta text-right">{md.label}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {md.matches.map((m, mi) => (
                      <MatchRow key={mi} m={m} />
                    ))}
                  </div>
                  <div className="px-3 sm:px-6 py-3 bg-secondary/30 t-meta">
                    🏝️ Відпочиває: {byePlayer.name} ({byePlayer.club})
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
