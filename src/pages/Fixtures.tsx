import { useState } from "react";
import { matchdays, getPlayer } from "@/data/leagueData";

export default function Fixtures() {
  const [filter, setFilter] = useState<number | "all">("all");
  const filtered = filter === "all" ? matchdays : matchdays.filter(md => md.number === filter);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-heading text-5xl mb-8">Матчі та Результати</h1>

        <div className="mb-8">
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

            const MatchRow = ({ m, highlight }: { m: typeof md.matches[0]; highlight?: boolean }) => {
              const home = getPlayer(m.home);
              const away = getPlayer(m.away);
              const played = m.homeScore !== null;
              return (
                <div className={`px-6 py-4 flex items-center justify-between ${highlight ? "bg-accent/5" : ""}`}>
                  <div className="flex-1 text-right">
                    <span className="font-medium text-lg">{home.name}</span>
                    <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">{home.club}</span>
                  </div>
                  <div className="mx-5 min-w-[70px] text-center">
                    {played ? (
                      <span className="font-heading text-2xl text-accent">{m.homeScore} - {m.awayScore}</span>
                    ) : (
                      <span className="text-muted-foreground font-heading text-2xl">VS</span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">{away.club}</span>
                    <span className="font-medium text-lg">{away.name}</span>
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
                        <span className="font-heading text-2xl text-accent">Матч Відкриття</span>
                        <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                          ⭐ 17.04 · 21:00
                        </span>
                      </div>
                      <span className="text-base text-muted-foreground">Тур {md.number}</span>
                    </div>
                    <MatchRow m={openingMatch} highlight />
                  </div>
                )}

                {/* Regular matches */}
                <div className={`bg-card rounded-xl border overflow-hidden border-border`}>
                  <div className="px-6 py-4 flex items-center justify-between bg-secondary/50">
                    <div>
                      <span className="font-heading text-2xl">
                        {isOpening ? `Матчі Туру ${md.number}` : `Тур ${md.number}`}
                      </span>
                    </div>
                    <span className="text-base text-muted-foreground">
                      {isOpening ? "Сб 18.04" : md.label}
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {restMatches.map((m, mi) => (
                      <MatchRow key={mi} m={m} />
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-secondary/30 text-sm text-muted-foreground">
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
