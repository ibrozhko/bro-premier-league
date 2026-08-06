import { ArrowRight, CalendarDays, Shield, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoSeason2 from "@/assets/logo-season2-orange.png";
import {
  calculateSeason2Standings,
  getSeason2BestDefense,
  getSeason2LegLabel,
  getSeason2NextRound,
  getSeason2PlayedMatches,
  getSeason2TopScorers,
  season2LastUpdated,
  season2Rounds,
  season2Summary,
  type Season2Match,
} from "@/data/season2Data";
import {
  getSeason2PredictionAggregate,
  loadSeason2PredictionAggregates,
  type Season2PredictionAggregateMap,
} from "@/lib/season2Predictions";
import {
  getScheduleBadge,
  loadSeason2MatchSchedules,
  type Season2MatchSchedule,
} from "@/lib/season2Scheduling";
import Season2Shell from "./Season2Shell";

const season2BasePath = "";
const season2Path = (path = "") => `${season2BasePath}${path}` || "/";

export default function Season2Home() {
  const [predictionAggregates, setPredictionAggregates] = useState<Season2PredictionAggregateMap>({});
  const [matchSchedules, setMatchSchedules] = useState<Record<string, Season2MatchSchedule>>({});
  const playedMatches = getSeason2PlayedMatches();
  const topAttack = getSeason2TopScorers()[0];
  const bestDefense = getSeason2BestDefense()[0];
  const standings = calculateSeason2Standings();
  const nextRound = getSeason2NextRound();
  const nextMatches = nextRound?.matches ?? [];

  useEffect(() => {
    loadSeason2PredictionAggregates()
      .then(setPredictionAggregates)
      .catch(() => setPredictionAggregates({}));
    loadSeason2MatchSchedules()
      .then(setMatchSchedules)
      .catch(() => setMatchSchedules({}));
  }, []);

  return (
    <Season2Shell>
      <main>
        <section className="relative overflow-hidden border-b border-[#ff5a1f]/18 bg-[#f7f7f2] py-5 text-center text-[#111111] sm:py-8 md:py-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#ff5a1f]" />
          <div className="pointer-events-none absolute -left-28 top-32 hidden h-64 w-64 rounded-full border-[18px] border-[#ff5a1f] lg:block" />
          <div className="pointer-events-none absolute -right-28 bottom-24 hidden h-52 w-52 rounded-full border-[18px] border-[#bbf903] lg:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#bbf903] to-transparent" />
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-5">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.16)] sm:mb-4 sm:h-28 sm:w-28 sm:p-2.5 md:h-32 md:w-32 md:p-3">
              <img src={logoSeason2} alt="Bro Premier League" className="h-[124%] w-[124%] max-w-none object-contain" />
            </div>
            <h1 className="mx-auto max-w-5xl font-heading text-[2.1rem] leading-none sm:text-[3.45rem] md:text-[4.4rem]">
              Bro Premier <span className="text-[#bbf903]">League</span>
              <span className="block text-[#ff5a1f]">Season 2</span>
            </h1>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-[#111111]/68 sm:mt-3 sm:text-lg sm:leading-7">
              FC 26 · Season 2 · {season2Summary.players} гравців · {season2Summary.rounds} турів · {season2Summary.matches} матчів
            </p>
            <p className="mt-2 inline-flex rounded-full border border-[#ff5a1f]/35 bg-white px-3 py-1 text-[0.68rem] uppercase tracking-wide text-[#ff5a1f] sm:text-xs">
              Оновлено: {season2LastUpdated}
            </p>

            <div className="mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-px text-left sm:mt-5 lg:grid-cols-4">
              <HeroStat label="Зіграно" value={`${playedMatches.length}/${season2Summary.matches}`} />
              <HeroStat label="Матчів" value={season2Summary.matches} />
              <HeroStat label="Атака" value={topAttack?.player.name ?? "-"} meta={`${topAttack?.goalsFor ?? 0} голів`} />
              <HeroStat label="Захист" value={bestDefense?.player.name ?? "-"} meta={`${bestDefense?.goalsAgainst ?? 0} пропущено`} />
            </div>
          </div>
        </section>

        <section className="border-b border-[#111111]/10 bg-[#f7f7f2] py-5 sm:py-6">
          <div className="mx-auto grid max-w-5xl gap-2.5 px-4 sm:gap-3 sm:px-5 md:grid-cols-3">
            <InfoPill icon={Trophy} label="Формат" value="два кола · 30 турів" />
            <InfoPill icon={Users} label="Склад" value={`${season2Summary.players} гравців · ${season2Summary.players} клубів`} />
            <InfoPill icon={CalendarDays} label="Календар" value="тур у суботу + тур у неділю" />
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeader
                eyebrow="Match center"
                title="Матч-центр"
                text={nextRound ? `Найближчий тур Season 2: ${nextRound.dayLabel}. Тут видно пари туру, статус матчів і хто відпочиває.` : "Усі матчі сезону зіграні."}
              />
              <Link to={season2Path("/matches")} className="inline-flex h-10 items-center rounded-md bg-[#ff5a1f] px-4 text-sm font-bold text-white sm:h-11">
                Всі матчі <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
              <div className="mt-6 overflow-hidden rounded-md border border-[#111111]/12 bg-white">
                <div className="flex items-center justify-between gap-3 bg-[#111111] px-4 py-3 text-[#f7f7f2]">
                  <h3 className="font-heading text-2xl leading-none sm:text-3xl">
                  {nextRound ? `Наступні матчі · тур ${nextRound.round} · ${nextRound.dayLabel}` : "Наступні матчі"}
                </h3>
                <CalendarDays className="h-5 w-5 text-[#bbf903]" />
              </div>
              {nextRound && (
                <div className="flex flex-wrap items-center gap-2 border-b border-[#111111]/10 bg-[#ff5a1f]/8 px-4 py-2">
                  <span className="inline-flex rounded-full border border-[#ff5a1f]/25 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#ff5a1f]">
                    {getSeason2LegLabel(nextRound.leg)}
                  </span>
                  <RoundBye bye={nextRound.bye} />
                </div>
              )}
              <div className="divide-y divide-[#111111]/10">
              {nextMatches.length ? nextMatches.map(match => (
                <Season2MatchRow
                  key={match.id}
                  match={match}
                  predictionAggregates={predictionAggregates}
                  schedule={matchSchedules[match.id]}
                />
              )) : (
                  <div className="p-5 text-sm text-[#111111]/60">Немає майбутніх матчів.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#111111]/10 bg-white py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-5">
            <SectionHeader eyebrow="League table" title="Турнірна таблиця" text="Повна таблиця Season 2: очки, різниця, забиті, пропущені та форма за останні 5 матчів." />
            <div className="mt-6 overflow-hidden rounded-md border border-[#111111]/12">
              <StandingsTable standings={standings} />
            </div>
          </div>
        </section>
      </main>
    </Season2Shell>
  );
}

export function Season2MatchRow({
  match,
  predictionAggregates,
  schedule,
}: {
  match: Season2Match;
  predictionAggregates?: Season2PredictionAggregateMap;
  schedule?: Season2MatchSchedule;
}) {
  const played = match.homeScore !== null && match.awayScore !== null;

  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 px-4 py-3.5 sm:grid-cols-[116px_1fr_80px_1fr_90px] sm:gap-5 sm:px-6 sm:py-4">
      <div className="col-span-3 flex items-center justify-between gap-3 sm:col-span-1 sm:block">
        <div>
          <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[#111111]/45">Матч</div>
          <div className="mt-0.5 font-heading text-xl leading-none text-[#ff5a1f] sm:text-2xl">{match.id.split("-").at(-1)}</div>
        </div>
        <Status played={played} schedule={schedule} className="sm:hidden" />
      </div>
      <Team value={match.home.name} meta={match.home.club} align="right" />
      <div className="min-w-12 rounded-md bg-[#ff5a1f]/12 px-3 py-2 text-center font-heading text-lg leading-none text-[#ff5a1f] sm:text-xl">
        {played ? `${match.homeScore}:${match.awayScore}` : "VS"}
      </div>
      <Team value={match.away.name} meta={match.away.club} />
      <div className="hidden text-right sm:block">
        <Status played={played} schedule={schedule} />
      </div>
      <CommunityPrediction match={match} predictionAggregates={predictionAggregates} />
    </article>
  );
}

function CommunityPrediction({
  match,
  predictionAggregates,
}: {
  match: Season2Match;
  predictionAggregates?: Season2PredictionAggregateMap;
}) {
  const aggregate = getSeason2PredictionAggregate(match, predictionAggregates);
  if (!aggregate) return null;
  const odds = calculateCommunityOdds(aggregate);

  return (
    <div className="col-span-3 rounded-md border border-[#111111]/10 bg-[#111111]/[0.035] px-3 py-2 text-center text-xs font-bold text-[#111111]/58 sm:col-span-5 sm:text-sm">
      <span className="mr-2 text-[0.66rem] uppercase tracking-wide text-[#111111]/42 sm:text-xs">Лінія спільноти</span>
      <span className="text-[#ff5a1f]">{match.home.name} {odds.home}</span>
      <span className="mx-2 text-[#111111]/32">·</span>
      <span>X {odds.draw}</span>
      <span className="mx-2 text-[#111111]/32">·</span>
      <span className="text-[#ff5a1f]">{match.away.name} {odds.away}</span>
    </div>
  );
}

function calculateCommunityOdds(aggregate: Season2PredictionAggregateMap[string]) {
  const homeVotes = aggregate.homeVotes ?? Math.round((aggregate.homePercent / 100) * aggregate.total);
  const drawVotes = aggregate.drawVotes ?? Math.round((aggregate.drawPercent / 100) * aggregate.total);
  const awayVotes = aggregate.awayVotes ?? Math.round((aggregate.awayPercent / 100) * aggregate.total);
  const baseHome = 1;
  const baseDraw = 0.72;
  const baseAway = 1;
  const smoothedTotal = homeVotes + drawVotes + awayVotes + baseHome + baseDraw + baseAway;

  return {
    home: formatOdds((homeVotes + baseHome) / smoothedTotal),
    draw: formatOdds((drawVotes + baseDraw) / smoothedTotal),
    away: formatOdds((awayVotes + baseAway) / smoothedTotal),
  };
}

function formatOdds(probability: number) {
  const bookmakerMargin = 0.92;
  const odds = Math.min(9.99, Math.max(1.15, bookmakerMargin / probability));
  return odds.toFixed(2);
}

export function StandingsTable({ standings }: { standings: ReturnType<typeof calculateSeason2Standings> }) {
  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full min-w-[740px] text-left sm:min-w-[820px]">
        <thead className="bg-[#111111] text-[#f7f7f2]">
          <tr className="text-[0.68rem] uppercase tracking-wide sm:text-xs">
            <th className="px-3 py-3 sm:px-4">#</th>
            <th className="px-3 py-3 sm:px-4">Гравець</th>
            <th className="px-3 py-3 sm:px-4">Клуб</th>
            <th className="px-3 py-3 text-center sm:px-4">І</th>
            <th className="px-3 py-3 text-center sm:px-4">В</th>
            <th className="px-3 py-3 text-center sm:px-4">Н</th>
            <th className="px-3 py-3 text-center sm:px-4">П</th>
            <th className="px-3 py-3 text-center sm:px-4">ЗГ</th>
            <th className="px-3 py-3 text-center sm:px-4">ПГ</th>
            <th className="px-3 py-3 text-center sm:px-4">Різн.</th>
            <th className="px-3 py-3 text-center sm:px-4">О</th>
            <th className="px-3 py-3 text-center sm:px-4">Форма</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#111111]/10">
          {standings.map((row, index) => (
            <tr key={row.player.id}>
              <td className="px-3 py-3 font-heading text-xl text-[#ff5a1f] sm:px-4 sm:py-4 sm:text-2xl">{index + 1}</td>
              <td className="px-3 py-3 sm:px-4 sm:py-4">
                <div className="text-base font-bold sm:text-lg">{row.player.name}</div>
                {row.player.nick && <div className="text-xs text-[#111111]/45">{row.player.nick}</div>}
              </td>
              <td className="px-3 py-3 text-sm text-[#111111]/65 sm:px-4 sm:py-4 sm:text-base">{row.player.club}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.played}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.won}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.drawn}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.lost}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.goalsFor}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.goalsAgainst}</td>
              <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</td>
              <td className="px-3 py-3 text-center font-heading text-xl text-[#ff5a1f] sm:px-4 sm:py-4 sm:text-2xl">{row.points}</td>
              <td className="px-3 py-3 sm:px-4 sm:py-4">
                <FormPills form={row.form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormPills({ form }: { form: Array<"W" | "D" | "L"> }) {
  const values = form.length ? form : Array.from({ length: 5 }, () => null);

  return (
    <div className="flex justify-center gap-1">
      {values.map((value, index) => {
        const className = value === "W"
          ? "bg-[#bbf903] text-[#111111]"
          : value === "D"
            ? "bg-[#111111]/12 text-[#111111]"
            : value === "L"
              ? "bg-[#ff5a1f] text-white"
              : "bg-[#111111]/8 text-[#111111]/28";

        return (
          <span key={`${value ?? "empty"}-${index}`} className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-extrabold ${className}`}>
            {value ?? "-"}
          </span>
        );
      })}
    </div>
  );
}

export function RoundBye({ bye }: { bye: Season2Match["home"] | null }) {
  if (!bye) return null;

  return (
    <span className="inline-flex rounded-full border border-[#111111]/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#111111]/65">
      Відпочиває: <span className="ml-1 text-[#ff5a1f]">{bye.name}</span>
    </span>
  );
}

function HeroStat({ label, value, meta }: { label: string; value: number | string; meta?: string }) {
  return (
    <div className="border border-[#ff5a1f]/18 bg-white p-2.5 shadow-sm sm:p-4">
      <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[#111111]/48 sm:text-[0.7rem]">{label}</div>
      <div className="mt-1 break-words font-heading text-xl leading-none text-[#ff5a1f] sm:text-3xl">{value}</div>
      {meta && <div className="mt-1 break-words text-xs text-[#111111]/55">{meta}</div>}
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[#111111]/12 bg-white px-3 py-3 sm:px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#ff5a1f] text-white sm:h-10 sm:w-10">
        <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[0.68rem] font-bold uppercase tracking-wide text-[#ff5a1f]">{label}</div>
        <div className="text-sm font-semibold leading-snug sm:text-base">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-wide text-[#ff5a1f]">{eyebrow}</div>
      <h2 className="mt-2 font-heading text-3xl leading-none sm:text-5xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#111111]/68 sm:text-base">{text}</p>
    </div>
  );
}

function Team({ value, meta, align = "left" }: { value: string; meta: string; align?: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-base font-bold leading-tight sm:text-xl">{value}</div>
      <div className="mt-0.5 truncate text-xs leading-tight text-[#111111]/58 sm:text-sm">{meta}</div>
    </div>
  );
}

function Status({ played, schedule, className = "" }: { played: boolean; schedule?: Season2MatchSchedule; className?: string }) {
  const badge = getScheduleBadge(schedule);
  const isPostponed = schedule?.status === "postponed";

  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-[0.65rem] font-bold uppercase ${
      played
        ? "bg-[#111111] text-white"
        : isPostponed
          ? "bg-[#ff5a1f] text-white"
          : "bg-[#bbf903] text-[#111111]"
    } ${className}`}>
      {played ? "Зіграно" : badge ?? "Скоро"}
    </span>
  );
}
