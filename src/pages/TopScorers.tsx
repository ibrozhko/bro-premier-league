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
          <Trophy className="h-8 w-8 md:h-10 md:w-10 text-accent shrink-0" /> Бомбардири
        </h1>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-2 sm:px-4 text-left t-label w-10">#</th>
                <th className="py-3 px-2 sm:px-4 text-left t-label">Гравець</th>
                <th className="py-3 px-2 sm:px-4 text-left t-label hidden sm:table-cell">Клуб</th>
                <th className="py-3 px-2 sm:px-4 text-center t-label font-bold w-16">Голи</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((s, i) => {
                const p = getPlayer(s.playerId);
                return (
                  <tr key={s.playerId} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`font-heading text-lg ${i < 3 ? medalColors[i] : ""}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 font-medium">
                      <div>{p.name}</div>
                      <div className="t-meta sm:hidden flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                        {p.club}
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden sm:table-cell">
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                      {p.club}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-center font-heading text-xl text-accent">{s.goals}</td>
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
