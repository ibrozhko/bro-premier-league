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
  const nextMatch = sortedMatches.find(match => match.status !== "finished" && new Date(match.matchDate).getTime() > Date.now()) ?? sortedMatches[0];
  const latestResult = [...sortedMatches].reverse().find(match => match.status === "finished");
  const leader = users[0];
  const finishedCount = matchList.filter(match => match.status === "finished").length;

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
          <div className="flex flex-col gap-2 border-b border-[#2937da]/20 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="page-kicker">Live data</div>
              <h3 className="h-section flex items-center gap-3">
                <CalendarDays className="h-7 w-7 text-[#2937da]" />
                Турнірний центр
              </h3>
            </div>
            <div className="text-sm font-medium text-[#343434]/65">Результати оновлюються після синку</div>
          </div>

          <div className="light-panel overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
            <div className="brand-stripe h-1" />
            <div className="grid gap-4 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <MatchPanel title="Наступний матч" icon={CalendarDays} match={nextMatch} />
                {latestResult ? <MatchPanel title="Останній результат" icon={ShieldCheck} match={latestResult} /> : null}
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
          </div>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Rule icon={Target} title="Напрям" value="5 балів" text="Вгадай переможця або нічию." />
            <Rule icon={Trophy} title="Точний рахунок" value="10 балів" text="Попади в рахунок матчу." />
            <Rule icon={ShieldCheck} title="Плей-офф" value="+5" text="За команду, яка пройде далі." />
            <Rule icon={UsersRound} title="Інвайти" value="3 коди" text="Запрошуй друзів у турнір." />
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

function MatchPanel({ title, icon: Icon, match }: { title: string; icon: typeof CalendarDays; match?: PredictMatch }) {
  if (!match) return null;
  const score = match.homeScore === null || match.awayScore === null ? "VS" : `${match.homeScore}-${match.awayScore}`;

  return (
    <div className="rounded-md border border-[#2937da]/15 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#2937da]">
          <Icon className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
        </div>
        <span className="text-right text-xs font-semibold text-[#343434]/55">{formatKyivDate(match.matchDate)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Team name={match.homeTeam} code={match.homeCode} align="right" />
        <div className="min-w-[58px] text-center font-heading text-4xl leading-none text-[#2937da]">{score}</div>
        <Team name={match.awayTeam} code={match.awayCode} align="left" />
      </div>
    </div>
  );
}

function Rule({ icon: Icon, title, value, text }: { icon: typeof Target; title: string; value: string; text: string }) {
  return (
    <div className="rounded-md border border-[#2937da]/15 bg-white p-4 shadow-[0_12px_30px_rgba(41,55,218,0.05)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2937da]/10 text-[#2937da]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">{title}</div>
          <div className="font-heading text-2xl leading-none text-[#343434]">{value}</div>
        </div>
      </div>
      <p className="text-sm leading-5 text-[#343434]/65">{text}</p>
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
