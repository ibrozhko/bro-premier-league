import { useState } from "react";
import { matchdays, getPlayer } from "@/data/leagueData";

export default function Fixtures() {
  const [filter, setFilter] = useState<number | "all">("all");

  const filtered = filter === "all" ? matchdays : matchdays.filter(md => md.number === filter);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-heading text-5xl mb-8">Матчі та Результати</h1>

        {/* Filter */}
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

        {/* Matchday cards */}
        <div className="space-y-6">
          {filtered.map(md => {
            const isOpening = md.number === 1;
            const byePlayer = getPlayer(md.bye);

            return (
              <div
                key={md.number}
                className={`bg-card rounded-xl border overflow-hidden ${
                  isOpening ? "border-accent shadow-lg shadow-accent/10" : "border-border"
                }`}
              >
                <div className={`px-5 py-3 flex items-center justify-between ${
                  isOpening ? "bg-accent/10" : "bg-secondary/50"
                }`}>
                  <div>
                    <span className={`font-heading text-xl ${isOpening ? "text-accent" : ""}`}>
                      Тур {md.number}
                    </span>
                    {isOpening && (
                      <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                        ВІДКРИТТЯ
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{md.label}</span>
                </div>

                <div className="divide-y divide-border">
                  {md.matches.map((m, mi) => {
                    const home = getPlayer(m.home);
                    const away = getPlayer(m.away);
                    const played = m.homeScore !== null;
                    const isFirstEver = md.number === 1 && mi === 0;

                    return (
                      <div
                        key={mi}
                        className={`px-5 py-3 flex items-center justify-between ${
                          isFirstEver ? "bg-accent/5" : ""
                        }`}
                      >
                        <div className="flex-1 text-right">
                          <span className="font-medium">{home.name}</span>
                          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{home.club}</span>
                        </div>
                        <div className="mx-4 min-w-[60px] text-center">
                          {played ? (
                            <span className="font-heading text-xl text-accent">
                              {m.homeScore} - {m.awayScore}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-heading text-lg">VS</span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">{away.club}</span>
                          <span className="font-medium">{away.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 py-2 bg-secondary/30 text-xs text-muted-foreground">
                  🔴 Відпочиває: {byePlayer.name} ({byePlayer.club})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
