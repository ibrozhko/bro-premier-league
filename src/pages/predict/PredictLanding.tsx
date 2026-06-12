import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Medal, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentPredictUser, getPredictMatches, getPredictUsers } from "@/lib/predictStore";
import { formatKyivDate, predictMatches, type PredictMatch, type PredictUser } from "@/data/predictData";

type Leader = PredictUser & { totalPoints: number };

export default function PredictLanding() {
  const [user, setUser] = useState<PredictUser | null>(null);
  const [users, setUsers] = useState<Leader[]>([]);
  const [matchList, setMatchList] = useState<PredictMatch[]>(predictMatches);

  useEffect(() => {
    getCurrentPredictUser().then(setUser).catch(() => setUser(null));
    getPredictUsers()
      .then(items => setUsers(items.filter(item => !item.isAdmin).sort((a, b) => b.totalPoints - a.totalPoints)))
      .catch(() => setUsers([]));
    getPredictMatches().then(setMatchList).catch(() => setMatchList(predictMatches));
  }, []);

  const now = Date.now();
  const sortedMatches = useMemo(
    () => [...matchList].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime() || a.id - b.id),
    [matchList],
  );
  const nextMatch = sortedMatches.find(match => match.status !== "finished" && new Date(match.matchDate).getTime() > now) ?? sortedMatches[0];
  const latestResult = [...sortedMatches].reverse().find(match => match.status === "finished");
  const leader = users[0];
  const finishedCount = matchList.filter(match => match.status === "finished").length;

  return (
    <main className="content-shell py-6 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="relative overflow-hidden rounded-md bg-[#2937da] p-5 text-white shadow-[0_24px_70px_rgba(41,55,218,0.22)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 brand-stripe" />
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-md bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">11 червня - 19 липня</span>
            <span className="rounded-md bg-[#bbf903] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#111111]">{finishedCount} зіграно</span>
          </div>
          <h2 className="max-w-3xl font-heading text-[3.35rem] leading-[0.88] tracking-normal text-white sm:text-7xl">
            Прогнозуй чемпіонат світу з друзями
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
            Живий турнір прогнозів BPL: ставиш рахунок, ловиш точні результати і піднімаєшся у таблиці після кожного матчу.
          </p>

          <div className="mt-6 grid gap-3 sm:flex sm:flex-row">
            <Button asChild className="h-[52px] rounded-md bg-[#bbf903] px-5 text-base font-bold text-[#111111] shadow-[0_18px_40px_rgba(187,249,3,0.18)] hover:bg-[#d4ff3c] sm:h-12">
              <Link to={user ? "/predict/predictions" : "/predict/login"}>
                {user ? "Мої прогнози" : "Увійти"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" className="h-12 rounded-md border-white/35 bg-white/10 px-5 text-white hover:bg-white hover:text-[#2937da]">
                <Link to="/predict/register">Зареєструватись з кодом</Link>
              </Button>
            )}
          </div>

          <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-md bg-white/15">
            {[
              ["Команд", "48"],
              ["Матчі", matchList.length],
              ["Гравців", users.length],
            ].map(([label, value]) => (
              <div key={label} className="bg-white/8 p-3">
                <div className="font-heading text-3xl leading-none text-[#bbf903]">{value}</div>
                <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-white/65">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <MatchCard title="Матч у фокусі" icon={CalendarDays} match={nextMatch} />
          {latestResult && <MatchCard title="Останній результат" icon={ShieldCheck} match={latestResult} />}
          <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
            <div className="brand-stripe h-1" />
            <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#2937da] text-white">
                <Medal className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">Лідер зараз</div>
                <div className="truncate font-heading text-2xl leading-none text-[#343434]">{leader ? leader.displayName || leader.username : "Ще немає"}</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-3xl leading-none text-[#2937da]">{leader?.totalPoints ?? 0}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/55">балів</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              ["Напрям", "5 балів"],
              ["Точний", "10 балів"],
              ["Плей-офф", "+5 за прохід"],
              ["Інвайти", "3 запрошення"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-[#2937da]/15 bg-white p-3">
                <div className="flex items-center gap-2 text-[#2937da]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
                </div>
                <div className="mt-1 font-heading text-xl leading-none text-[#343434]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MatchCard({ title, icon: Icon, match }: { title: string; icon: typeof CalendarDays; match?: PredictMatch }) {
  if (!match) return null;
  const score = match.homeScore === null || match.awayScore === null ? "VS" : `${match.homeScore}-${match.awayScore}`;

  return (
    <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
      <div className="grid grid-cols-[44px_1fr] gap-3 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#2937da]/10 text-[#2937da]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">{title}</div>
            <div className="text-xs font-semibold text-[#343434]/55">{formatKyivDate(match.matchDate)}</div>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Team name={match.homeTeam} code={match.homeCode} align="right" />
            <div className="min-w-[54px] text-center font-heading text-3xl leading-none text-[#2937da]">{score}</div>
            <Team name={match.awayTeam} code={match.awayCode} align="left" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Team({ name, code, align }: { name: string; code: string; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate font-semibold text-[#343434]">{name}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/50">{code}</div>
    </div>
  );
}
