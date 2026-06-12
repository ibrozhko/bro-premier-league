import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Medal, ShieldCheck } from "lucide-react";
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

  const sortedMatches = useMemo(
    () => [...matchList].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime() || a.id - b.id),
    [matchList],
  );
  const nextMatch = sortedMatches.find(match => match.status !== "finished" && new Date(match.matchDate).getTime() > Date.now()) ?? sortedMatches[0];
  const latestResult = [...sortedMatches].reverse().find(match => match.status === "finished");
  const leader = users[0];
  const finishedCount = matchList.filter(match => match.status === "finished").length;

  return (
    <main className="content-shell py-6 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
        <div className="py-2 lg:py-8">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-md border border-[#2937da]/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2937da]">
              11 червня - 19 липня
            </span>
            <span className="rounded-md bg-[#bbf903] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#111111]">
              {finishedCount} матчі зіграно
            </span>
          </div>

          <h2 className="max-w-4xl font-heading text-[clamp(2.9rem,9vw,6rem)] leading-[0.88] tracking-normal text-[#343434]">
            Прогнозуй ЧС разом з BPL
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#343434]/72 sm:text-lg">
            Обирай рахунок, збирай очки за точність і дивись, як таблиця змінюється після кожного матчу.
          </p>

          <div className="mt-7 grid gap-3 sm:flex sm:flex-row">
            <Button asChild className="h-[52px] rounded-md bg-[#2937da] px-6 text-base font-bold text-white shadow-[0_18px_40px_rgba(41,55,218,0.18)] hover:bg-[#1f2ab4]">
              <Link to={user ? "/predict/predictions" : "/predict/login"}>
                {user ? "Мої прогнози" : "Увійти"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" className="h-[52px] rounded-md border-[#2937da]/25 bg-white px-6 font-semibold text-[#2937da] hover:bg-[#2937da] hover:text-white">
                <Link to="/predict/register">Реєстрація з кодом</Link>
              </Button>
            )}
          </div>
        </div>

        <aside className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_50px_rgba(41,55,218,0.10)]">
          <div className="brand-stripe h-1" />
          <div className="grid grid-cols-3 gap-px bg-[#2937da]/10">
            {[
              ["Команд", "48"],
              ["Матчі", matchList.length],
              ["Гравців", users.length],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-3">
                <div className="font-heading text-3xl leading-none text-[#2937da]">{value}</div>
                <div className="mt-1 text-[0.64rem] font-bold uppercase tracking-wide text-[#343434]/55">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 p-3">
            <MiniMatch title="Наступний матч" icon={CalendarDays} match={nextMatch} />
            {latestResult && <MiniMatch title="Останній результат" icon={ShieldCheck} match={latestResult} />}
            <div className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-md bg-[#f7f7fb] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2937da] text-white">
                <Medal className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">Лідер</div>
                <div className="truncate font-heading text-2xl leading-none text-[#343434]">{leader ? leader.displayName || leader.username : "Ще немає"}</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-3xl leading-none text-[#2937da]">{leader?.totalPoints ?? 0}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/55">балів</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Напрям", "5 балів"],
          ["Точний рахунок", "10 балів"],
          ["Плей-офф", "+5 за прохід"],
          ["Інвайти", "3 запрошення"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#2937da]/15 bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">{label}</div>
            <div className="mt-1 font-heading text-2xl leading-none text-[#343434]">{value}</div>
          </div>
        ))}
      </section>
    </main>
  );
}

function MiniMatch({ title, icon: Icon, match }: { title: string; icon: typeof CalendarDays; match?: PredictMatch }) {
  if (!match) return null;
  const score = match.homeScore === null || match.awayScore === null ? "VS" : `${match.homeScore}-${match.awayScore}`;

  return (
    <div className="rounded-md bg-[#f7f7fb] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#2937da]">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
        </div>
        <div className="text-right text-xs font-semibold text-[#343434]/55">{formatKyivDate(match.matchDate)}</div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Team name={match.homeTeam} code={match.homeCode} align="right" />
        <div className="min-w-[50px] text-center font-heading text-3xl leading-none text-[#2937da]">{score}</div>
        <Team name={match.awayTeam} code={match.awayCode} align="left" />
      </div>
    </div>
  );
}

function Team({ name, code, align }: { name: string; code: string; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-sm font-semibold text-[#343434]">{name}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/50">{code}</div>
    </div>
  );
}
