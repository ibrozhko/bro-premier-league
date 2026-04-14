import { calculateStandings, getPlayer } from "@/data/leagueData";

function FormDot({ result }: { result: "W" | "D" | "L" }) {
  const colors = { W: "bg-green-500", D: "bg-gray-400", L: "bg-red-500" };
  return (
    <span
      className={`inline-block w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-foreground ${colors[result]}`}
      title={result}
    >
      {result}
    </span>
  );
}

export default function Standings() {
  const standings = calculateStandings();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="font-heading text-5xl mb-8">League Standings</h1>
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 px-3 text-left">#</th>
                <th className="py-3 px-3 text-left">Player</th>
                <th className="py-3 px-3 text-left hidden md:table-cell">Club</th>
                <th className="py-3 px-3 text-center">P</th>
                <th className="py-3 px-3 text-center">W</th>
                <th className="py-3 px-3 text-center">D</th>
                <th className="py-3 px-3 text-center">L</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">GF</th>
                <th className="py-3 px-3 text-center hidden sm:table-cell">GA</th>
                <th className="py-3 px-3 text-center">GD</th>
                <th className="py-3 px-3 text-center font-bold">Pts</th>
                <th className="py-3 px-3 text-center hidden lg:table-cell">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const p = getPlayer(s.playerId);
                return (
                  <tr key={s.playerId} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`font-heading text-lg ${i === 0 ? "text-accent" : i < 3 ? "text-primary" : ""}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">{p.name}</td>
                    <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                      {p.club}
                    </td>
                    <td className="py-3 px-3 text-center">{s.played}</td>
                    <td className="py-3 px-3 text-center">{s.won}</td>
                    <td className="py-3 px-3 text-center">{s.drawn}</td>
                    <td className="py-3 px-3 text-center">{s.lost}</td>
                    <td className="py-3 px-3 text-center hidden sm:table-cell">{s.goalsFor}</td>
                    <td className="py-3 px-3 text-center hidden sm:table-cell">{s.goalsAgainst}</td>
                    <td className="py-3 px-3 text-center">{s.goalDifference > 0 ? "+" : ""}{s.goalDifference}</td>
                    <td className="py-3 px-3 text-center font-bold text-accent">{s.points}</td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <div className="flex gap-1 justify-center">
                        {s.form.length > 0
                          ? s.form.map((f, fi) => <FormDot key={fi} result={f} />)
                          : <span className="text-muted-foreground">—</span>
                        }
                      </div>
                    </td>
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
