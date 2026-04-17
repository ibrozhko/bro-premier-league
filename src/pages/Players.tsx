import { players, calculateStandings, getTopScorers } from "@/data/leagueData";
import { Gamepad2, Monitor } from "lucide-react";

export default function Players() {
  const standings = calculateStandings();
  const scorers = getTopScorers();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="h-page mb-8">Гравці</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(p => {
            const s = standings.find(st => st.playerId === p.id)!;
            const goals = scorers.find(sc => sc.playerId === p.id)?.goals ?? 0;

            return (
              <div
                key={p.id}
                className="bg-card rounded-xl border border-border p-5 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: `hsl(${p.clubColor})` }}
                />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="h-card">{p.name}</h3>
                    <p className="t-meta">{p.club}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">
                    {p.platform === "PC" ? <Monitor className="h-3 w-3" /> : <Gamepad2 className="h-3 w-3" />}
                    {p.platform}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "І", value: s.played },
                    { label: "ГЗ", value: goals },
                    { label: "ГП", value: s.goalsAgainst },
                    { label: "О", value: s.points },
                  ].map(stat => (
                    <div key={stat.label} className="bg-secondary rounded-lg py-2">
                      <div className="font-heading text-xl text-accent">{stat.value}</div>
                      <div className="t-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
