import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Medal, ShieldCheck, Target, Trophy, UsersRound } from "lucide-react";
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
  const todayMatches = sortedMatches.filter(
    match => getKyivDayKey(match.matchDate) === todayKey && match.status !== "finished",
  );
  const yesterdayResults = sortedMatches.filter(
    match => getKyivDayKey(match.matchDate) === yesterdayKey && match.status === "finished",
  );

  return (
    <main>
      <section className="border-b border-white/15 bg-[#2937da] py-10 text-center text-white sm:py-12 md:py-14">
        <div className="content-shell">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white p-3 shadow-[0_18px_38px_rgba(0,0,0,0.18)] sm:h-32 sm:w-32">
            <img src={logoFull} alt="Bro Premier League" className="h-[124%] w-[124%] max-w-none object-contain" />
          </div>
          <div className="page-kicker text-[#bbf903]">Fantasy World Cup 2026</div>
          <h2 className="mx-auto max-w-3xl font-heading text-[2.6rem] leading-none text-white sm:text-[4rem] md:text-[5rem]">
            Чемпіонат <span className="text-[#bbf903]">прогнозів</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/82 sm:text-xl">
            Окрема гра BPL на ЧС-2026: став рахунок, збирай очки за точність і піднімайся у таблиці друзів.
          </p>

          <div className="mx-auto mt-7 grid max-w-4xl grid-cols-3 gap-px text-left">
            <HeroStat label="Зіграно" value={finishedCount} />
            <HeroStat label="Матчів" value={matchList.length} />
            <HeroStat label="Гравців" value={users.length} />
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
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

      <section className="coax-light py-10 sm:py-12">
        <div className="content-shell space-y-5">
          <section className="light-panel overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
            <div className="brand-stripe h-1" />
            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="page-kicker">Система балів</div>
                <h3 className="h-section">Як рахуються очки</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ScoreTile icon={Target} title="Напрям" value="5 балів" text="Перемога однієї з команд або нічия." />
                  <ScoreTile icon={Trophy} title="Точний рахунок" value="10 балів" text="Повний збіг рахунку матчу." />
                  <ScoreTile icon={ShieldCheck} title="Плей-офф" value="+5" text="Команда проходить у наступний раунд." />
                  <ScoreTile icon={UsersRound} title="Інвайти" value="3 коди" text="Кожен гравець має власні запрошення." />
                </div>
              </div>

              <div className="rounded-md border border-[#2937da]/15 bg-[#2937da] p-4 text-white">
                <div className="grid gap-4 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#bbf903] text-[#111111]">
                    <Medal className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide text-white/75">Лідер зараз</div>
                    <div className="truncate font-heading text-3xl leading-none text-white sm:text-4xl">
                      {leader ? leader.displayName || leader.username : "Ще немає"}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-heading text-4xl leading-none text-[#bbf903]">{leader?.totalPoints ?? 0}</div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-white/70">балів</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-col gap-2 border-b border-[#2937da]/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="page-kicker">Live data</div>
                <h3 className="h-section flex items-center gap-3">
                  <CalendarDays className="h-7 w-7 text-[#2937da]" />
                  Матч-центр
                </h3>
              </div>
              <div className="text-sm font-medium text-[#343434]/65">Результати оновлюються після синку</div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <MatchList title="Матчі сьогодні" empty="На сьогодні майбутніх матчів немає." icon={CalendarDays} matches={todayMatches} />
              <MatchList title="Результати вчора" empty="За вчора результатів ще немає." icon={ShieldCheck} matches={yesterdayResults} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-white/15 bg-[#3441dd] p-3 sm:p-4">
      <div className="font-heading text-3xl leading-none text-[#bbf903] sm:text-4xl">{value}</div>
      <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-wide text-white/75">{label}</div>
    </div>
  );
}

function MatchList({
  title,
  empty,
  icon: Icon,
  matches,
}: {
  title: string;
  empty: string;
  icon: typeof CalendarDays;
  matches: PredictMatch[];
}) {
  return (
    <div className="light-panel overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
      <div className="flex items-center justify-between border-b border-[#2937da]/10 bg-[#f7f7fb] px-4 py-3">
        <div className="flex items-center gap-2 text-[#2937da]">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
        </div>
      </div>
      <div className="divide-y divide-[#2937da]/10">
        {matches.length > 0 ? (
          matches.map(match => <MatchRow key={match.id} match={match} />)
        ) : (
          <div className="px-4 py-6 text-sm text-[#343434]/65">{empty}</div>
        )}
      </div>
    </div>
  );
}

function MatchRow({ match }: { match: PredictMatch }) {
  const score = match.homeScore === null || match.awayScore === null ? "VS" : `${match.homeScore}-${match.awayScore}`;

  return (
    <div className="grid gap-3 px-4 py-4 sm:grid-cols-[110px_1fr] sm:items-center">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#343434]/55">
        {match.groupName ? `Група ${match.groupName}` : stageLabel(match.stage)}
        <div className="mt-1 normal-case tracking-normal">{formatKyivDate(match.matchDate)}</div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Team name={match.homeTeam} code={match.homeCode} align="right" />
        <div className="min-w-[58px] text-center font-heading text-3xl leading-none text-[#2937da]">{score}</div>
        <Team name={match.awayTeam} code={match.awayCode} align="left" />
      </div>
    </div>
  );
}

function ScoreTile({ icon: Icon, title, value, text }: { icon: typeof Target; title: string; value: string; text: string }) {
  return (
    <div className="rounded-md border border-[#2937da]/15 bg-[#f7f7fb] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2937da]/10 text-[#2937da]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">{title}</div>
          <div className="font-heading text-xl leading-none text-[#343434]">{value}</div>
          <p className="mt-1 text-sm leading-5 text-[#343434]/65">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Team({ name, code, align }: { name: string; code: string; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-base font-semibold text-[#343434] sm:text-lg">{name}</div>
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
