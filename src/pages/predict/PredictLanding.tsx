import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Medal, ShieldCheck } from "lucide-react";
import { getCurrentPredictUser, getPredictMatches, getPredictUsers } from "@/lib/predictStore";
import { formatKyivDate, predictMatches, type PredictMatch, type PredictUser } from "@/data/predictData";
import logoFull from "@/assets/logo-full.png";

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
  const leader = users[0];
  const finishedCount = matchList.filter(match => match.status === "finished").length;
  const todayKey = getKyivDayKey(new Date());
  const yesterdayKey = getKyivDayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const tomorrowKey = getKyivDayKey(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const nextMatchDayKeys = new Set([todayKey, tomorrowKey]);
  const resultDayKeys = new Set([todayKey, yesterdayKey]);
  const nextMatches = sortedMatches.filter(
    match => nextMatchDayKeys.has(getKyivDayKey(match.matchDate)) && match.status !== "finished",
  );
  const recentResults = sortedMatches.filter(
    match => resultDayKeys.has(getKyivDayKey(match.matchDate)) && match.status === "finished",
  );

  return (
    <main>
      <section className="border-b border-white/15 bg-[#2937da] py-9 text-center text-white sm:py-12 md:py-16">
        <div className="content-shell">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white p-3 shadow-[0_18px_38px_rgba(0,0,0,0.18)] sm:h-40 sm:w-40 sm:p-4 md:h-48 md:w-48 md:p-5">
            <img src={logoFull} alt="Bro Premier League" className="h-[124%] w-[124%] max-w-none object-contain" />
          </div>
          <div className="page-kicker text-[#bbf903]">Fantasy World Cup 2026</div>
          <h2 className="mx-auto max-w-none font-heading text-[2.35rem] leading-none text-white sm:text-[3.4rem] md:whitespace-nowrap md:text-[4.5rem]">
            Чемпіонат <span className="text-[#bbf903]">прогнозів</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Окрема гра BPL на ЧС-2026: став рахунок, збирай очки за точність і піднімайся у таблиці друзів.
          </p>

          <div className="mx-auto mt-5 grid max-w-3xl grid-cols-3 gap-px text-left">
            <HeroStat label="Зіграно" value={finishedCount} />
            <HeroStat label="Матчів" value={matchList.length} />
            <HeroStat label="Гравців" value={users.length} />
          </div>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={user ? "/predict/predictions" : "/predict/login"}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#bbf903] px-5 text-base font-bold text-[#111111] transition-colors hover:bg-[#d2ff3d]"
            >
              {user ? "Мої прогнози" : "Увійти"} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            {!user && (
              <Link
                to="/predict/register"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 bg-[#3441dd] px-5 font-semibold text-white transition-colors hover:bg-white hover:text-[#2937da]"
              >
                Реєстрація з кодом
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="coax-light py-8 sm:py-10">
        <div className="content-shell space-y-5">
          <section className="light-panel rounded-md border border-[#2937da]/15 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(41,55,218,0.06)] sm:px-5">
            <div className="grid gap-4 sm:grid-cols-[48px_1fr_auto] sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#2937da]/10 text-[#2937da]">
                <Medal className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">Поточний лідер</div>
                <div className="truncate font-heading text-3xl leading-none text-[#343434]">
                  {leader ? leader.displayName || leader.username : "Ще немає"}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-heading text-4xl leading-none text-[#2937da]">{leader?.totalPoints ?? 0}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/55">балів</div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 text-sm font-medium text-[#343434]/65">Результати оновлюються після синку</div>
            <div className="grid gap-5">
              <MatchList
                title="Наступні матчі"
                description="Найближчі матчі за сьогодні та завтра за київським часом."
                empty="На сьогодні та завтра майбутніх матчів немає."
                icon={CalendarDays}
                matches={nextMatches}
                tone="today"
              />
              <MatchList
                title="Результати"
                description="Завершені матчі за сьогодні та вчора за київським часом."
                empty="За сьогодні та вчора результатів ще немає."
                icon={ShieldCheck}
                matches={recentResults}
                tone="results"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-white/15 bg-[#3441dd] p-3 sm:p-3.5">
      <div className="font-heading text-2xl leading-none text-[#bbf903] sm:text-3xl">{value}</div>
      <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-white/75">{label}</div>
    </div>
  );
}

function MatchList({
  title,
  description,
  empty,
  icon: Icon,
  matches,
  tone,
}: {
  title: string;
  description: string;
  empty: string;
  icon: typeof CalendarDays;
  matches: PredictMatch[];
  tone: "today" | "results";
}) {
  return (
    <section>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-md ${tone === "today" ? "bg-[#2937da] text-white" : "bg-[#2937da]/10 text-[#2937da]"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="h-section text-[#343434]">{title}</h4>
            <p className="mt-1 text-sm text-[#343434]/62">{description}</p>
          </div>
        </div>
        <div className="w-fit rounded-md bg-[#2937da]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#2937da]">
          {matchCountLabel(matches.length)}
        </div>
      </div>
      <div className="light-panel overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
        {matches.length > 0 ? (
          <div className="divide-y divide-[#2937da]/10">
            {matches.map(match => <MatchRow key={match.id} match={match} />)}
          </div>
        ) : (
          <div className="px-4 py-6 text-sm text-[#343434]/65">{empty}</div>
        )}
      </div>
    </section>
  );
}

function MatchRow({ match }: { match: PredictMatch }) {
  const score = match.homeScore === null || match.awayScore === null ? "VS" : `${match.homeScore}-${match.awayScore}`;

  return (
    <div className="px-4 py-4 md:px-6 md:py-5">
      <div className="mb-3 flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-[#343434]/55 sm:flex-row sm:items-center sm:justify-between">
        <span>{match.groupName ? `Група ${match.groupName}` : stageLabel(match.stage)}</span>
        <span className="normal-case tracking-normal">{formatKyivDate(match.matchDate)}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 md:gap-6">
        <Team name={match.homeTeam} code={match.homeCode} align="right" />
        <div className="min-w-[72px] rounded-md bg-[#2937da]/10 px-3 py-2 text-center font-heading text-3xl leading-none text-[#2937da]">{score}</div>
        <Team name={match.awayTeam} code={match.awayCode} align="left" />
      </div>
    </div>
  );
}

function Team({ name, code, align, className = "" }: { name: string; code: string; align: "left" | "right"; className?: string }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      <div className="text-base font-semibold leading-tight text-[#343434] sm:text-xl">{name}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/50">{code}</div>
    </div>
  );
}

function getKyivDayKey(date: string | Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function stageLabel(stage: PredictMatch["stage"]) {
  const labels: Record<PredictMatch["stage"], string> = {
    group: "Група",
    round_of_32: "1/16",
    round_of_16: "1/8",
    quarterfinal: "1/4",
    semifinal: "1/2",
    bronze: "За 3 місце",
    final: "Фінал",
  };
  return labels[stage];
}

function matchCountLabel(count: number) {
  if (count === 1) return "1 матч";
  if (count >= 2 && count <= 4) return `${count} матчі`;
  return `${count} матчів`;
}
