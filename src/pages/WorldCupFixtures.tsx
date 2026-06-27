import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { groupMatchesByDate, isPlayed, worldCupMatches, worldCupTeams, type WorldCupMatch } from "@/data/worldCup2026Data";

const activeFilterClass = "shrink-0 rounded-md border border-[#bbf903] bg-[#bbf903] px-3 py-1.5 text-sm font-bold text-[#111111] transition-colors";
const inactiveFilterClass = "shrink-0 rounded-md border border-[#ff008c]/25 bg-white px-3 py-1.5 text-sm font-medium text-[#ff008c] transition-colors hover:bg-[#ff008c] hover:text-white";

export default function WorldCupFixtures() {
  const [playerFilter, setPlayerFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "played" | "upcoming">("all");
  const [stageFilter, setStageFilter] = useState<string | "all">("all");
  const [groupFilter, setGroupFilter] = useState<"all" | "playoff" | "A" | "B" | "C">("all");

  const stages = useMemo(() => [...new Set(worldCupMatches.map(match => match.stage))], []);
  const filteredMatches = worldCupMatches.filter(match => {
    const byPlayer = playerFilter === "all" || match.home === playerFilter || match.away === playerFilter;
    const byStage = stageFilter === "all" || match.stage === stageFilter;
    const byGroup =
      groupFilter === "all" ||
      (groupFilter === "playoff" ? match.group === null : match.group === groupFilter);
    const byStatus =
      statusFilter === "all" ||
      (statusFilter === "played" ? isPlayed(match) : !isPlayed(match));
    return byPlayer && byStage && byGroup && byStatus;
  });
  const grouped = groupMatchesByDate(filteredMatches);

  return (
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <div className="page-header">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#ff008c]">Календар турніру</div>
          <h1 className="h-page">Матчі та результати</h1>
        </div>

        <FilterBlock title="Фільтр по гравцю">
          <button onClick={() => setPlayerFilter("all")} className={playerFilter === "all" ? activeFilterClass : inactiveFilterClass}>
            Всі гравці
          </button>
          {worldCupTeams.map(team => (
            <button
              key={team.name}
              onClick={() => setPlayerFilter(team.name)}
              className={playerFilter === team.name ? activeFilterClass : inactiveFilterClass}
            >
              {team.player}
            </button>
          ))}
        </FilterBlock>

        <FilterBlock title="Статус матчів">
          {[
            { value: "all", label: "Всі" },
            { value: "played", label: "Зіграні" },
            { value: "upcoming", label: "Майбутні" },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value as typeof statusFilter)}
              className={statusFilter === item.value ? activeFilterClass : inactiveFilterClass}
            >
              {item.label}
            </button>
          ))}
        </FilterBlock>

        <FilterBlock title="Фільтр по групі">
          {[
            { value: "all", label: "Всі" },
            { value: "A", label: "Група A" },
            { value: "B", label: "Група B" },
            { value: "C", label: "Група C" },
            { value: "playoff", label: "Плей-оф" },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setGroupFilter(item.value as typeof groupFilter)}
              className={groupFilter === item.value ? activeFilterClass : inactiveFilterClass}
            >
              {item.label}
            </button>
          ))}
        </FilterBlock>

        <FilterBlock title="Етап">
          <button onClick={() => setStageFilter("all")} className={stageFilter === "all" ? activeFilterClass : inactiveFilterClass}>
            Всі
          </button>
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={stageFilter === stage ? activeFilterClass : inactiveFilterClass}
            >
              {stage}
            </button>
          ))}
        </FilterBlock>

        <div className="mt-8 space-y-6">
          {Object.entries(grouped).map(([dateLabel, matches]) => (
            <section key={dateLabel} className="light-panel overflow-hidden rounded-md">
              <div className="h-px bg-[#ff008c]" />
              <div className="flex items-center justify-between gap-3 bg-[#f3f3f6] px-3 py-4 sm:px-6">
                <span className="h-card">{dateLabel}</span>
                <span className="t-meta text-right">{matches.length} матчів</span>
              </div>
              <div className="divide-y divide-border">
                {matches.map(match => <MatchRow key={match.id} match={match} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="t-label mb-2">{title}</div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {children}
      </div>
    </div>
  );
}

function MatchRow({ match }: { match: WorldCupMatch }) {
  const played = isPlayed(match);

  return (
    <div className="px-3 py-4 sm:grid sm:grid-cols-[110px_1fr_90px] sm:items-center sm:gap-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-0 sm:block">
        <div>
          <div className="font-heading text-xl leading-none text-[#ff008c] sm:text-2xl">{match.round}</div>
          <div className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#343434]/55">
            {matchLabel(match)}
          </div>
        </div>
        <MatchStatus played={played} className="sm:hidden" />
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
        <TeamName value={match.home} align="right" />
        <div className="rounded-md bg-[#ff008c]/10 px-2 py-2 text-center font-heading text-lg leading-none text-[#ff008c] sm:min-w-[68px] sm:py-1 sm:text-2xl">
          {played ? `${match.homeScore}:${match.awayScore}` : "VS"}
        </div>
        <TeamName value={match.away} align="left" />
      </div>
      <div className="hidden text-right sm:block">
        <MatchStatus played={played} />
      </div>
    </div>
  );
}

function MatchStatus({ played, className = "" }: { played: boolean; className?: string }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-[0.65rem] font-bold uppercase ${played ? "bg-[#343434] text-white" : "bg-accent text-accent-foreground"} ${className}`}>
      {played ? "Зіграно" : "Скоро"}
    </span>
  );
}

function matchLabel(match: WorldCupMatch) {
  return match.group ? `Група ${match.group}` : match.stage;
}

function TeamName({ value, align }: { value: string; align: "left" | "right" }) {
  const [player, team] = value.split(" - ");

  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="break-words text-base font-semibold leading-tight text-[#343434] sm:truncate sm:text-sm sm:font-medium">{player}</div>
      <div className="mt-0.5 break-words text-xs leading-tight text-[#343434]/58 sm:truncate">{team ?? value}</div>
    </div>
  );
}
