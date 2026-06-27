import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Crown, Shield, Trophy } from "lucide-react";
import {
  calculateWorldCupStandings,
  getPlayedWorldCupMatches,
  getWorldCupBestDefense,
  getWorldCupTopScorers,
  isPlayed,
  worldCupGroups,
  worldCupMatches,
  type WorldCupGroupId,
  type WorldCupMatch,
} from "@/data/worldCup2026Data";
import logoFull from "@/assets/logo-full.png";

export default function WorldCup2026() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const playedMatches = getPlayedWorldCupMatches();
  const firstRoundMatches = worldCupMatches.filter(match => match.round === "Тур 1");
  const topAttack = getWorldCupTopScorers()[0];
  const bestDefense = getWorldCupBestDefense()[0];
  const activeGroup = worldCupGroups[activeGroupIndex] ?? worldCupGroups[0];

  return (
    <main className="min-h-screen bg-[#f3f3f6] text-[#343434]">
      <section className="relative overflow-hidden border-b border-[#ff008c]/15 bg-[#f3f3f6] py-8 text-center sm:py-10 md:py-12">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#ff008c]" />
        <div className="pointer-events-none absolute -left-24 top-20 hidden h-64 w-64 rounded-full border-[20px] border-[#ff008c]/10 lg:block" />
        <div className="pointer-events-none absolute -right-20 bottom-10 hidden h-56 w-56 rounded-full border-[18px] border-[#bbf903]/70 lg:block" />
        <div className="content-shell relative z-10">
          <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white p-2.5 shadow-[0_18px_38px_rgba(0,0,0,0.18)] sm:h-36 sm:w-36 sm:p-3.5 md:h-40 md:w-40 md:p-4">
            <img src={logoFull} alt="Bro Premier League Logo" className="h-[124%] w-[124%] max-w-none object-contain" />
          </div>
          <h1 className="font-heading text-[2.2rem] leading-none text-[#343434] sm:text-[3.1rem] md:text-[4rem]">
            BPL World Cup <span className="text-[#ff008c]">2026</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-sm text-[#343434]/75 sm:max-w-none sm:text-lg md:text-xl">
            FC 26 · Турнір до ЧС 2026 · 15 гравців · 3 групи · 38 матчів
          </p>
          <p className="mt-3 inline-flex rounded-full border border-[#ff008c]/30 bg-white px-3 py-1 text-[0.68rem] uppercase tracking-wide text-[#ff008c] sm:text-xs">
            Оновлено: 27.06.2026
          </p>

          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-px text-left lg:grid-cols-4">
            <HeroStat label="Зіграно" value={`${playedMatches.length}/${worldCupMatches.length}`} />
            <HeroStat label="Голів" value={getWorldCupTopScorers().reduce((sum, row) => sum + row.goalsFor, 0)} />
            <HeroStat label="Атака" value={topAttack?.player ?? "-"} meta={topAttack ? `${topAttack.goalsFor} голів` : "ще без голів"} />
            <HeroStat label="Захист" value={bestDefense?.player ?? "-"} meta={bestDefense ? `${bestDefense.goalsAgainst} пропущено` : "ще без матчів"} />
          </div>
        </div>
      </section>

      <section className="border-b border-[#ff008c]/15 bg-white py-5">
        <div className="content-shell grid gap-3 sm:grid-cols-3">
          <InfoPill icon={Trophy} label="Формат" value="3 групи по 5" />
          <InfoPill icon={Shield} label="Учасники" value="15 гравців" />
          <InfoPill icon={CalendarDays} label="Фінал" value="19.07.2026" />
        </div>
      </section>

      <section id="wc-match-center" className="border-b border-[#ff008c]/15 py-10 sm:py-12">
        <div className="content-shell">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader
              eyebrow="Match center"
              title="Матч-центр"
              text="Розклад матчів першого туру."
            />
            <Link to="/fixtures" className="inline-flex h-11 items-center rounded-md bg-[#ff008c] px-4 text-sm font-bold text-white hover:bg-[#df007b]">
              Всі матчі <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {firstRoundMatches.map(match => <MatchCard key={match.id} match={match} />)}
          </div>
        </div>
      </section>

      <section id="wc-groups" className="border-b border-[#ff008c]/15 bg-white py-10 sm:py-12">
        <div className="content-shell">
          <SectionHeader
            eyebrow="Group tables"
            title="Таблиці груп"
            text="Таблиці рахуються автоматично з результатів: очки, різниця голів, забиті мʼячі."
          />
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {worldCupGroups.map((group, index) => (
              <button
                key={group.id}
                onClick={() => setActiveGroupIndex(index)}
                className={`h-11 shrink-0 rounded-md px-5 text-sm font-bold transition-colors ${
                  activeGroupIndex === index
                    ? "bg-[#bbf903] text-[#111111]"
                    : "border border-[#ff008c]/25 bg-white text-[#ff008c] hover:bg-[#ff008c] hover:text-white"
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <GroupCard groupId={activeGroup.id} title={activeGroup.title} featured />
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value, meta }: { label: string; value: number | string; meta?: string }) {
  return (
    <div className="border border-[#ff008c]/15 bg-white p-3 shadow-sm">
      <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[#343434]/55">{label}</div>
      <div className="mt-1 truncate font-heading text-2xl leading-none text-[#ff008c] sm:text-3xl">{value}</div>
      {meta && <div className="mt-1 truncate text-xs text-[#343434]/65">{meta}</div>}
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[#ff008c]/15 bg-[#f3f3f6] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#ff008c] text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[0.68rem] font-bold uppercase tracking-wide text-[#ff008c]">{label}</div>
        <div className="truncate font-semibold text-[#343434]">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-bold uppercase tracking-wide text-[#ff008c]">{eyebrow}</div>
      <h2 className="mt-2 font-heading text-4xl leading-none text-[#343434] sm:text-5xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#343434]/68 sm:text-base">{text}</p>
    </div>
  );
}

function GroupCard({ groupId, title, featured = false }: { groupId: WorldCupGroupId; title: string; featured?: boolean }) {
  const standings = calculateWorldCupStandings(groupId);

  return (
    <section className={`${featured ? "w-full" : "min-w-[82vw] sm:min-w-[520px] lg:min-w-[31.5%]"} snap-start overflow-hidden rounded-md border border-[#ff008c]/20 bg-white shadow-[0_18px_48px_rgba(255,0,140,0.08)]`}>
      <div className="flex items-center justify-between bg-[#ff008c] px-4 py-3 text-white">
        <h3 className="font-heading text-3xl leading-none">{title}</h3>
        <Crown className="h-5 w-5 text-[#bbf903]" />
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[560px] text-sm sm:text-base">
          <thead>
            <tr className="border-b border-[#ff008c]/15 text-[0.68rem] uppercase tracking-wide text-[#343434]/55">
              <th className="py-2 text-left">#</th>
              <th className="py-2 text-left">Гравець</th>
              <th className="py-2 text-center">І</th>
              <th className="py-2 text-center">В</th>
              <th className="py-2 text-center">Н</th>
              <th className="py-2 text-center">П</th>
              <th className="py-2 text-center">РГ</th>
              <th className="py-2 text-center">О</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => (
              <tr key={row.name} className="border-b border-[#ff008c]/10 last:border-b-0">
                <td className="py-3 font-heading text-xl leading-none text-[#ff008c]">{index + 1}</td>
                <td className="py-3">
                  <div className="text-base font-semibold leading-tight sm:text-lg">{row.player}</div>
                  <div className="mt-0.5 text-sm text-[#343434]/58">{row.team}</div>
                </td>
                <td className="py-3 text-center">{row.played}</td>
                <td className="py-3 text-center">{row.won}</td>
                <td className="py-3 text-center">{row.drawn}</td>
                <td className="py-3 text-center">{row.lost}</td>
                <td className="py-3 text-center">{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</td>
                <td className="py-3 text-center font-bold text-[#ff008c]">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MatchCard({ match, compact = false }: { match: WorldCupMatch; compact?: boolean }) {
  return (
    <article className="overflow-hidden rounded-md border border-[#ff008c]/20 bg-white shadow-[0_18px_48px_rgba(255,0,140,0.08)]">
      <div className="h-1 bg-[#ff008c]" />
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-wide text-[#ff008c]">{matchLabel(match)}</div>
          <div className="text-xs font-semibold text-[#343434]/58">{formatMatchDateOnly(match)}</div>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
          <TeamName value={match.home} align="right" />
          <ScoreBox match={match} />
          <TeamName value={match.away} align="left" />
        </div>
        <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#343434]/50">{match.round}</div>
      </div>
    </article>
  );
}

function TeamName({ value, align }: { value: string; align: "left" | "right" }) {
  const [player, team] = value.split(" - ");

  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-base font-semibold leading-tight text-[#343434] sm:text-lg">{player}</div>
      <div className="mt-0.5 truncate text-sm text-[#343434]/58">{team ?? value}</div>
    </div>
  );
}

function matchLabel(match: WorldCupMatch) {
  return match.group ? `Група ${match.group}` : match.stage;
}

function formatMatchDateOnly(match: WorldCupMatch) {
  return `${match.day} ${match.date}`;
}

function ScoreBox({ match }: { match: WorldCupMatch }) {
  return (
    <div className="min-w-[58px] rounded-md bg-[#ff008c]/10 px-2.5 py-1 text-center font-heading text-xl leading-none text-[#ff008c] sm:min-w-[68px]">
      {isPlayed(match) ? `${match.homeScore}:${match.awayScore}` : "VS"}
    </div>
  );
}
