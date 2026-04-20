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
            const isOpening = md.number === 1;
            const byePlayer = getPlayer(md.bye);
            const openingMatch = isOpening ? md.matches[0] : null;
            const restMatches = isOpening ? md.matches.slice(1) : md.matches;

            const md1Times: Record<string, string> = {
              "9-7": "21:00",
              "8-6": "22:00",
              "3-2": "23:00",
            };

            const MatchRow = ({ m, highlight }: { m: typeof md.matches[0]; highlight?: boolean }) => {
              const home = getPlayer(m.home);
              const away = getPlayer(m.away);
              const played = m.homeScore !== null;
              const time = md.number === 1 && !highlight ? md1Times[`${m.home}-${m.away}`] : undefined;
              return (
                <div className={`px-6 py-4 flex items-center justify-between ${highlight ? "bg-accent/5" : ""}`}>
                  <div className="flex-1 text-right">
                    <span className="font-medium t-body md:text-lg">{home.name}</span>
                    <span className="t-meta ml-2 hidden sm:inline">{home.club}</span>
                  </div>
                  <div className="mx-5 min-w-[70px] text-center">
                    {played ? (
                      <span className="font-heading text-2xl text-accent">{m.homeScore} - {m.awayScore}</span>
                    ) : (
                      <div>
                        <div className="text-muted-foreground font-heading text-2xl">VS</div>
                        {time && <div className="t-meta text-accent mt-1">{time}</div>}
                      </div>
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
                {/* Opening Match - separated */}
                {openingMatch && (
                  <div className="bg-card rounded-xl border-2 border-accent overflow-hidden shadow-lg shadow-accent/10">
                    <div className="px-6 py-4 flex items-center justify-between bg-accent/10">
                      <div>
                        <span className="h-card text-accent">Матч Відкриття</span>
                        <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                          ⭐ 17.04 · 21:00
                        </span>
                      </div>
                      <span className="t-meta">Тур {md.number}</span>
                    </div>
                    <MatchRow m={openingMatch} highlight />
                  </div>
                )}

                {/* Regular matches */}
                <div className={`bg-card rounded-xl border overflow-hidden border-border`}>
                  <div className="px-6 py-4 flex items-center justify-between bg-secondary/50">
                    <div>
                      <span className="h-card">
                        {isOpening ? `Матчі Туру ${md.number}` : `Тур ${md.number}`}
                      </span>
                    </div>
                    <span className="t-meta">
                      {isOpening ? "Сб 18.04" : md.label}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {restMatches.map((m, mi) => (
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
