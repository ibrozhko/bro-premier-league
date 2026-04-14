import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Trophy, ChevronRight } from "lucide-react";
import { calculateStandings, getNextMatch, getRecentResults, getPlayer, matchdays } from "@/data/leagueData";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(targetDate + "T18:00:00").getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.mins },
    { label: "Secs", value: timeLeft.secs },
  ];

  return (
    <div className="flex gap-3">
      {units.map(u => (
        <div key={u.label} className="bg-secondary rounded-lg p-3 min-w-[60px] text-center">
          <div className="font-heading text-3xl text-accent">{u.value}</div>
          <div className="text-xs text-muted-foreground uppercase">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const standings = calculateStandings();
  const next = getNextMatch();
  const recent = getRecentResults();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Crown className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-6xl md:text-8xl text-foreground leading-none">
            Bro Premier League
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            FC 26 Private League · Season 2026 · 9 Players · 72 Matches
          </p>

          {next && (
            <div className="mt-10">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Next Match — Matchday {next.matchday.number}
              </p>
              <div className="inline-flex items-center gap-4 bg-card rounded-xl px-6 py-4 border border-border">
                <span className="font-heading text-2xl">{getPlayer(next.match.home).name}</span>
                <span className="text-accent font-heading text-xl">VS</span>
                <span className="font-heading text-2xl">{getPlayer(next.match.away).name}</span>
              </div>
              <div className="mt-6">
                <Countdown targetDate={next.matchday.date} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Results */}
      {recent.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-3xl">Latest Results</h2>
              <Link to="/fixtures" className="text-primary text-sm flex items-center gap-1 hover:underline">
                All Fixtures <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recent.map((r, i) => {
                const home = getPlayer(r.match.home);
                const away = getPlayer(r.match.away);
                return (
                  <div key={i} className="flex-shrink-0 bg-card rounded-lg border border-border p-4 min-w-[220px]">
                    <div className="text-xs text-muted-foreground mb-2">MD {r.matchday.number}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{home.name}</span>
                      <span className="font-heading text-xl text-accent mx-2">
                        {r.match.homeScore} - {r.match.awayScore}
                      </span>
                      <span className="text-sm font-medium">{away.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Top 3 Standings */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-3xl flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" /> Standings
            </h2>
            <Link to="/standings" className="text-primary text-sm flex items-center gap-1 hover:underline">
              Full Table <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-left hidden sm:table-cell">Club</th>
                  <th className="py-3 px-4 text-center">P</th>
                  <th className="py-3 px-4 text-center">GD</th>
                  <th className="py-3 px-4 text-center font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.slice(0, 3).map((s, i) => {
                  const p = getPlayer(s.playerId);
                  return (
                    <tr key={s.playerId} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-heading text-lg">
                        <span className={i === 0 ? "text-accent" : ""}>{i + 1}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{p.club}</td>
                      <td className="py-3 px-4 text-center">{s.played}</td>
                      <td className="py-3 px-4 text-center">{s.goalDifference > 0 ? "+" : ""}{s.goalDifference}</td>
                      <td className="py-3 px-4 text-center font-bold text-accent">{s.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
