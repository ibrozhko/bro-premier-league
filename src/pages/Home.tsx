import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight, Calendar } from "lucide-react";
import {
  calculateStandings, getNextMatch, getNextMatchday,
  getRecentResults, getPlayer,
} from "@/data/leagueData";
import logo from "@/assets/logo.svg";

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
    { label: "Днів", value: timeLeft.days },
    { label: "Годин", value: timeLeft.hours },
    { label: "Хвилин", value: timeLeft.mins },
    { label: "Секунд", value: timeLeft.secs },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {units.map(u => (
        <div key={u.label} className="bg-secondary rounded-xl p-3 md:p-4 min-w-[60px] md:min-w-[80px] text-center">
          <div className="font-heading text-3xl md:text-5xl text-accent">{u.value}</div>
          <div className="text-[10px] md:text-xs text-muted-foreground uppercase mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

function FormDot({ result }: { result: "W" | "D" | "L" }) {
  const colors = { W: "bg-green-500", D: "bg-gray-400", L: "bg-red-500" };
  return (
    <span
      className={`inline-flex w-6 h-6 rounded-full text-[11px] font-bold items-center justify-center text-foreground ${colors[result]}`}
    >
      {result}
    </span>
  );
}

export default function Home() {
  const standings = calculateStandings();
  const next = getNextMatch();
  const nextMd = getNextMatchday();
  const recent = getRecentResults(5);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-16 md:py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <img src={logo} alt="BPL Logo" className="h-32 w-32 md:h-40 md:w-40 mx-auto mb-6 rounded-full object-cover" />
          <h1 className="font-heading text-4xl md:text-7xl text-foreground leading-none">
            Bro Premier League
          </h1>
          <p className="mt-4 text-base md:text-2xl text-muted-foreground">
            FC 26 · Приватна Ліга · Сезон 1 · 9 Гравців · 72 Матчі
          </p>

          {/* Next Match */}
          {next && (
            <div className="mt-12">
              <p className="text-base text-muted-foreground uppercase tracking-widest mb-4">
                Наступний матч — Тур {next.matchday.number}
              </p>
              <div className="inline-flex items-center gap-4 md:gap-6 bg-card rounded-2xl px-5 md:px-8 py-4 md:py-6 border border-border">
                <div className="text-right">
                  <div className="font-heading text-xl md:text-4xl">{getPlayer(next.match.home).name}</div>
                  <div className="text-xs md:text-base text-muted-foreground">{getPlayer(next.match.home).club}</div>
                </div>
                <span className="text-accent font-heading text-2xl md:text-4xl">VS</span>
                <div className="text-left">
                  <div className="font-heading text-xl md:text-4xl">{getPlayer(next.match.away).name}</div>
                  <div className="text-xs md:text-base text-muted-foreground">{getPlayer(next.match.away).club}</div>
                </div>
              </div>
              <div className="mt-8">
                <Countdown targetDate={next.matchday.date} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Next Matchday Games */}
      {nextMd && (
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-7 w-7 text-primary" />
              <h2 className="font-heading text-2xl md:text-4xl">Ігри Туру {nextMd.number}</h2>
              <span className="text-base text-muted-foreground ml-auto">{nextMd.label}</span>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {nextMd.matches.map((match, mi) => {
                  const home = getPlayer(match.home);
                  const away = getPlayer(match.away);
                  return (
                    <div key={mi} className="px-3 md:px-6 py-3 md:py-5 flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <div className="font-medium text-sm md:text-lg">{home.name}</div>
                        <div className="text-xs text-muted-foreground">{home.club}</div>
                      </div>
                      <div className="mx-2 md:mx-5 min-w-[40px] md:min-w-[70px] text-center">
                        <span className="text-muted-foreground font-heading text-xl md:text-3xl">VS</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm md:text-lg">{away.name}</div>
                        <div className="text-xs text-muted-foreground">{away.club}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-3 bg-secondary/30 text-sm text-muted-foreground">
                🔴 Відпочиває: {getPlayer(nextMd.bye).name} ({getPlayer(nextMd.bye).club})
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Results — last 5 */}
      {recent.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl md:text-4xl">Останні Результати</h2>
              <Link to="/fixtures" className="text-primary text-base flex items-center gap-1 hover:underline">
                Всі матчі <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {recent.map((r, i) => {
                const home = getPlayer(r.match.home);
                const away = getPlayer(r.match.away);
                return (
                  <div key={i} className="bg-card rounded-xl border border-border p-5">
                    <div className="text-sm text-muted-foreground mb-2">Тур {r.matchday.number}</div>
                    <div className="text-center">
                      <div className="text-base font-medium">{home.name}</div>
                      <div className="font-heading text-4xl text-accent my-1">
                        {r.match.homeScore} - {r.match.awayScore}
                      </div>
                      <div className="text-base font-medium">{away.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Full Standings Table */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl md:text-4xl flex items-center gap-3">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-accent" /> Таблиця
            </h2>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-base whitespace-nowrap">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Гравець</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">Клуб</th>
                  <th className="py-3 px-4 text-center">І</th>
                  <th className="py-3 px-4 text-center">В</th>
                  <th className="py-3 px-4 text-center">Н</th>
                  <th className="py-3 px-4 text-center">П</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">ГЗ</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">ГП</th>
                  <th className="py-3 px-4 text-center">РГ</th>
                  <th className="py-3 px-4 text-center font-bold">О</th>
                  <th className="py-3 px-4 text-center hidden lg:table-cell">Форма</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => {
                  const p = getPlayer(s.playerId);
                  return (
                    <tr key={s.playerId} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`font-heading text-xl ${i === 0 ? "text-accent" : i < 3 ? "text-primary" : ""}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-base">{p.name}</td>
                      <td className="py-4 px-4 text-muted-foreground hidden md:table-cell">
                        <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                        {p.club}
                      </td>
                      <td className="py-4 px-4 text-center">{s.played}</td>
                      <td className="py-4 px-4 text-center">{s.won}</td>
                      <td className="py-4 px-4 text-center">{s.drawn}</td>
                      <td className="py-4 px-4 text-center">{s.lost}</td>
                      <td className="py-4 px-4 text-center hidden sm:table-cell">{s.goalsFor}</td>
                      <td className="py-4 px-4 text-center hidden sm:table-cell">{s.goalsAgainst}</td>
                      <td className="py-4 px-4 text-center">{s.goalDifference > 0 ? "+" : ""}{s.goalDifference}</td>
                      <td className="py-4 px-4 text-center font-bold text-accent text-lg">{s.points}</td>
                      <td className="py-4 px-4 hidden lg:table-cell">
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
      </section>
    </div>
  );
}
