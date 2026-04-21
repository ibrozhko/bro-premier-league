import { useState } from "react";
import { matchdays, getPlayer, players } from "@/data/leagueData";

export default function Fixtures() {
  const [filter, setFilter] = useState<number | "all">("all");
  const [playerFilter, setPlayerFilter] = useState<number | "all">("all");

  const filteredByTour = filter === "all" ? matchdays : matchdays.filter(md => md.number === filter);
  const filtered = playerFilter === "all"
    ? filteredByTour
    : filteredByTour
        .map(md => ({ ...md, matches: md.matches.filter(m => m.home === playerFilter || m.away === playerFilter) }))
        .filter(md => md.matches.length > 0);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="h-page mb-8">Матчі та Результати</h1>

        <div className="mb-6">
          <div className="t-label mb-2">Фільтр по гравцю</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPlayerFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                playerFilter === "all" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Всі гравці
            </button>
            {players.map(p => (
              <button
                key={p.id}
                onClick={() => setPlayerFilter(p.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  playerFilter === p.id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="t-label mb-2">Фільтр по туру</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Всі
            </button>
            {matchdays.map(md => (
              <button
                key={md.number}
                onClick={() => setFilter(md.number)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className="font-medium t-body md:text-lg">{home.name}</span>
                    <span className="t-meta ml-2 hidden sm:inline">{home.club}</span>
                  </div>
                  <div className="mx-5 min-w-[70px] text-center">
                    {played ? (
                      <span className="font-heading text-2xl text-accent">{m.homeScore} - {m.awayScore}</span>
                    ) : (
                      <div className="text-muted-foreground font-heading text-2xl">VS</div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="t-meta mr-2 hidden sm:inline">{away.club}</span>
                    <span className="font-medium t-body md:text-lg">{away.name}</span>
                  </div>
                </div>
              );
            };

            return (
              <div key={md.number} className="space-y-4">
                <div className="bg-card rounded-xl border overflow-hidden border-border">
                  <div className="px-6 py-4 flex items-center justify-between bg-secondary/50">
                    <span className="h-card">Тур {md.number}</span>
                    <span className="t-meta">{md.label}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {md.matches.map((m, mi) => (
                      <MatchRow key={mi} m={m} />
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-secondary/30 t-meta">
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
