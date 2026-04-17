import { getTopScorers, getPlayer } from "@/data/leagueData";
import { Trophy } from "lucide-react";

export default function TopScorers() {
  const scorers = getTopScorers();

  const medalColors = [
    "text-accent",
    "text-gray-300",
    "text-amber-700",
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="h-page mb-8 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-accent" /> Бомбардири
        </h1>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left t-label">#</th>
                <th className="py-3 px-4 text-left t-label">Гравець</th>
                <th className="py-3 px-4 text-left t-label">Клуб</th>
                <th className="py-3 px-4 text-center t-label font-bold">Голи</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((s, i) => {
                const p = getPlayer(s.playerId);
                return (
                  <tr key={s.playerId} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`font-heading text-lg ${i < 3 ? medalColors[i] : ""}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                      {p.club}
                    </td>
                    <td className="py-3 px-4 text-center font-heading text-xl text-accent">{s.goals}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
