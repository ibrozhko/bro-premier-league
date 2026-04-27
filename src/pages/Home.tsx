import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, ChevronRight, Calendar } from "lucide-react";
import {
  calculateStandings, getNextMatch, getNextMatchday,
  getSeasonSummary, lastUpdated, matchdays, getPlayer,
} from "@/data/leagueData";
import logo from "@/assets/logo.svg";

function Countdown({ targetIso }: { targetIso: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(targetIso).getTime();
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
  }, [targetIso]);

  const units = [
    { label: "Днів", value: timeLeft.days },
    { label: "Годин", value: timeLeft.hours },
    { label: "Хвилин", value: timeLeft.mins },
    { label: "Секунд", value: timeLeft.secs },
  ];

  return (
    <div className="flex gap-2 sm:gap-4 justify-center">
      {units.map(u => (
        <div key={u.label} className="bg-secondary rounded-lg sm:rounded-xl p-2.5 md:p-4 min-w-[58px] md:min-w-[80px] text-center">
          <div className="h-stat text-accent">{u.value}</div>
          <div className="t-label mt-1">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

function FormDot({ result }: { result: "W" | "D" | "L" }) {
  const colors = { W: "bg-green-500", D: "bg-gray-400", L: "bg-red-500" };
  return (
    <span
      className={`inline-flex w-6 h-6 rounded-full text-xs font-bold items-center justify-center text-foreground ${colors[result]}`}
    >
      {result}
    </span>
  );
}

export default function Home() {
  const standings = calculateStandings();
  const season = getSeasonSummary();
  const next = getNextMatch();
  const nextMd = getNextMatchday();
  // Show results from the current/last active tour: latest matchday that has at least one played match
  const activeTour = [...matchdays].reverse().find(md => md.matches.some(m => m.homeScore !== null));
  const recent = activeTour
    ? activeTour.matches
        .filter(m => m.homeScore !== null)
        .map(match => ({ matchday: activeTour, match }))
    : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-10 sm:py-14 md:py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <img src={logo} alt="BPL Logo" className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 mx-auto mb-5 md:mb-6 rounded-full object-cover" />
          <h1 className="h-page text-foreground">
            Bro Premier League
          </h1>
          <p className="mt-4 t-body md:text-lg text-muted-foreground max-w-[280px] sm:max-w-none mx-auto">
            FC 26 · Приватна Ліга · Сезон 1 · 9 Гравців · 72 Матчі
          </p>
          <p className="mt-3 t-label">Оновлено: {lastUpdated}</p>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-left">
            {[
              { label: "Лідер", value: season.leader?.name ?? "—", meta: season.leader?.club ?? "" },
              { label: "Зіграно", value: `${season.playedMatches}/${season.totalMatches}`, meta: "матчів" },
              { label: "Голів", value: season.totalGoals, meta: "у сезоні" },
              { label: "Атака", value: season.bestAttack?.name ?? "—", meta: `${season.bestAttackGoals} голів` },
            ].map(item => (
              <div key={item.label} className="bg-card/80 border border-border rounded-lg p-3 sm:p-4 min-w-0">
                <div className="t-label mb-1">{item.label}</div>
                <div className="h-card text-accent truncate">{item.value}</div>
                <div className="t-meta truncate">{item.meta}</div>
              </div>
            ))}
          </div>

          {/* Next Match */}
          {next && (
            <div className="mt-10 md:mt-12">
              <p className="t-label mb-4">
                Наступний матч — Тур {next.matchday.number}
              </p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6 bg-card rounded-xl md:rounded-2xl px-4 md:px-8 py-4 md:py-6 border border-border w-full max-w-[520px] mx-auto">
                <div className="text-right min-w-0">
                  <div className="md:flex md:items-baseline md:gap-2 md:justify-end">
                    <span className="h-card block truncate">{getPlayer(next.match.home).name}</span>
                    <span className="t-meta block md:inline truncate">{getPlayer(next.match.home).club}</span>
                  </div>
                </div>
                <span className="text-accent h-section">VS</span>
                <div className="text-left min-w-0">
                  <div className="md:flex md:items-baseline md:gap-2">
                    <span className="h-card block truncate">{getPlayer(next.match.away).name}</span>
                    <span className="t-meta block md:inline truncate">{getPlayer(next.match.away).club}</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Countdown targetIso={
                  next.matchday.number === 1
                    ? ({
                        "9-7": "2026-04-18T21:00:00+03:00",
                        "8-6": "2026-04-18T22:00:00+03:00",
                        "3-2": "2026-04-18T23:00:00+03:00",
                      } as Record<string, string>)[`${next.match.home}-${next.match.away}`] ?? `${next.matchday.date}T21:00:00+03:00`
                    : `${next.matchday.date}T21:00:00+03:00`
                } />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Next Matchday Games */}
      {nextMd && (() => {
        const unplayed = nextMd.matches.filter(m => m.homeScore === null);
        const openingMatch = nextMd.number === 1 && unplayed[0] && unplayed[0].home === 4 ? unplayed[0] : null;
        const restMatches = openingMatch ? unplayed.slice(1) : unplayed;
        if (unplayed.length === 0) return null;

        // Times for matchday 1 (18.04) by home-away player IDs
        const md1Times: Record<string, string> = {
          "9-7": "21:00",
          "8-6": "22:00",
          "3-2": "23:00",
        };

        const MatchRow = ({ match }: { match: typeof nextMd.matches[0] }) => {
          const home = getPlayer(match.home);
          const away = getPlayer(match.away);
          const time = nextMd.number === 1 ? md1Times[`${match.home}-${match.away}`] : undefined;
          return (
            <div className="px-3 md:px-6 py-3 md:py-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-5">
              <div className="min-w-0 text-right">
                <div className="md:flex md:items-baseline md:gap-2 md:justify-end">
                  <span className="h-card block truncate">{home.name}</span>
                  <span className="t-meta block md:inline truncate">{home.club}</span>
                </div>
              </div>
              <div className="min-w-[42px] md:min-w-[70px] text-center">
                {time ? (
                  <div>
                    <div className="text-muted-foreground h-card md:h-section">VS</div>
                    <div className="t-meta text-accent mt-1">{time}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground h-card md:h-section">VS</span>
                )}
              </div>
              <div className="min-w-0 text-left">
                <div className="md:flex md:items-baseline md:gap-2">
                  <span className="h-card block truncate">{away.name}</span>
                  <span className="t-meta block md:inline truncate">{away.club}</span>
                </div>
              </div>
            </div>
          );
        };

        return (
          <section className="py-10 px-4">
            <div className="container mx-auto max-w-4xl space-y-6">
              {/* Opening Match */}
              {openingMatch && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-accent text-xl">⭐</span>
                    <h2 className="h-section">Матч Відкриття</h2>
                    <span className="t-meta ml-auto">Пт 17.04 · 21:00</span>
                  </div>
                  <div className="bg-card rounded-xl border-2 border-accent overflow-hidden">
                    <MatchRow match={openingMatch} />
                  </div>
                </div>
              )}

              {/* Rest of matchday */}
              <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-7 w-7 text-primary" />
                    <h2 className="h-section">
                      {openingMatch ? `Матчі ${nextMd.number} Туру` : `Ігри ${nextMd.number} Туру`}
                    </h2>
                  <span className="t-meta ml-auto text-right">
                    {openingMatch ? "Сб 18.04" : nextMd.label}
                  </span>
                </div>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {restMatches.map((match, mi) => (
                      <MatchRow key={mi} match={match} />
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-secondary/30 t-meta">
                    🏝️ Відпочиває: {getPlayer(nextMd.bye).name} ({getPlayer(nextMd.bye).club})
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Recent Results — slider */}
      {recent.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <h2 className="h-section">Результати · Тур {activeTour!.number}</h2>
              <Link to="/fixtures" className="text-primary text-sm flex items-center gap-1 hover:underline whitespace-nowrap">
                Всі матчі <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recent.map((r, i) => {
                const home = getPlayer(r.match.home);
                const away = getPlayer(r.match.away);
                return (
                  <div
                    key={i}
                    className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 text-right">
                      <div className="md:flex md:items-baseline md:gap-2 md:justify-end">
                        <span className="t-body font-medium truncate">{home.name}</span>
                        <span className="t-meta truncate hidden md:inline">{home.club}</span>
                      </div>
                      <div className="t-meta truncate md:hidden">{home.club}</div>
                    </div>
                    <div className="shrink-0 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30">
                      <span className="font-heading text-xl text-accent tabular-nums">
                        {r.match.homeScore}:{r.match.awayScore}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="md:flex md:items-baseline md:gap-2">
                        <span className="t-body font-medium truncate">{away.name}</span>
                        <span className="t-meta truncate hidden md:inline">{away.club}</span>
                      </div>
                      <div className="t-meta truncate md:hidden">{away.club}</div>
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
            <h2 className="h-section flex items-center gap-3">
              <Trophy className="h-7 w-7 md:h-8 md:w-8 text-accent" /> Таблиця
            </h2>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-2 sm:px-4 text-left t-label">#</th>
                  <th className="py-3 px-2 sm:px-4 text-left t-label">Гравець</th>
                  <th className="py-3 px-2 sm:px-4 text-left t-label hidden md:table-cell">Клуб</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label">І</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label hidden xs:table-cell sm:table-cell">В</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label hidden sm:table-cell">Н</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label hidden sm:table-cell">П</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label hidden md:table-cell">ГЗ</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label hidden md:table-cell">ГП</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label">РГ</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label font-bold">О</th>
                  <th className="py-3 px-2 sm:px-4 text-center t-label hidden lg:table-cell">Форма</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => {
                  const p = getPlayer(s.playerId);
                  return (
                    <tr key={s.playerId} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-2 sm:px-4">
                        <span className={`font-heading text-base sm:text-lg ${i === 0 ? "text-accent" : i < 3 ? "text-primary" : ""}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 font-medium">
                        <div>{p.name}</div>
                        <div className="t-meta md:hidden flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                          {p.club}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden md:table-cell">
                        <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: `hsl(${p.clubColor})` }} />
                        {p.club}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center">{s.played}</td>
                      <td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">{s.won}</td>
                      <td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">{s.drawn}</td>
                      <td className="py-3 px-2 sm:px-4 text-center hidden sm:table-cell">{s.lost}</td>
                      <td className="py-3 px-2 sm:px-4 text-center hidden md:table-cell">{s.goalsFor}</td>
                      <td className="py-3 px-2 sm:px-4 text-center hidden md:table-cell">{s.goalsAgainst}</td>
                      <td className="py-3 px-2 sm:px-4 text-center">{s.goalDifference > 0 ? "+" : ""}{s.goalDifference}</td>
                      <td className="py-3 px-2 sm:px-4 text-center font-bold text-accent">{s.points}</td>
                      <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
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
          <div className="mt-3 t-meta leading-relaxed">
            І — ігри, В — перемоги, Н — нічиї, П — поразки, ГЗ — голи забиті, ГП — голи пропущені, РГ — різниця голів, О — очки.
          </div>
        </div>
      </section>
    </div>
  );
}
