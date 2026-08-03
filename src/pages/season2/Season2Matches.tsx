import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getSeason2LegLabel, getSeason2NextRound, season2Players, season2Rounds, type Season2Match } from "@/data/season2Data";
import Season2Shell, { Season2PageHeader } from "./Season2Shell";
import { RoundBye, Season2MatchRow } from "./Season2Home";

const activeFilterClass = "shrink-0 rounded-md border border-[#bbf903] bg-[#bbf903] px-3 py-1.5 text-sm font-bold text-[#111111]";
const inactiveFilterClass = "shrink-0 rounded-md border border-[#ff5a1f]/35 bg-white px-3 py-1.5 text-sm font-bold text-[#ff5a1f] hover:bg-[#ff5a1f] hover:text-white";

export default function Season2Matches() {
  const nextRound = getSeason2NextRound();
  const [playerFilter, setPlayerFilter] = useState<string | "all">("all");
  const [legFilter, setLegFilter] = useState<1 | 2 | "all">("all");
  const [roundFilter, setRoundFilter] = useState<number | "all">(nextRound?.round ?? "all");
  const [statusFilter, setStatusFilter] = useState<"all" | "played" | "upcoming">("all");

  const filteredRounds = useMemo(() => {
    return season2Rounds
      .map(round => ({
        ...round,
        matches: round.matches.filter(match => {
          const byPlayer = playerFilter === "all" || match.home.id === playerFilter || match.away.id === playerFilter;
          const byLeg = legFilter === "all" || match.leg === legFilter;
          const byRound = roundFilter === "all" || match.round === roundFilter;
          const played = match.homeScore !== null && match.awayScore !== null;
          const byStatus = statusFilter === "all" || (statusFilter === "played" ? played : !played);
          return byPlayer && byLeg && byRound && byStatus;
        }),
      }))
      .filter(round => round.matches.length > 0);
  }, [legFilter, playerFilter, roundFilter, statusFilter]);

  return (
    <Season2Shell>
      <main className="min-h-screen bg-[#f7f7f2] pb-12">
        <Season2PageHeader
          eyebrow="Calendar"
          title="Матчі та результати"
          text="За замовчуванням відкривається найближчий тур. Через фільтри можна подивитись повний календар, конкретного гравця або статус матчів."
        />
        <div className="mx-auto max-w-5xl px-5">
          <FilterBlock title="Фільтр по гравцю">
            <button onClick={() => setPlayerFilter("all")} className={playerFilter === "all" ? activeFilterClass : inactiveFilterClass}>Всі гравці</button>
            {season2Players.map(player => (
              <button key={player.id} onClick={() => setPlayerFilter(player.id)} className={playerFilter === player.id ? activeFilterClass : inactiveFilterClass}>
                {player.name}
              </button>
            ))}
          </FilterBlock>

          <FilterBlock title="Статус матчів">
            {[
              { value: "all", label: "Всі" },
              { value: "played", label: "Зіграні" },
              { value: "upcoming", label: "Майбутні" },
            ].map(item => (
              <button key={item.value} onClick={() => setStatusFilter(item.value as typeof statusFilter)} className={statusFilter === item.value ? activeFilterClass : inactiveFilterClass}>
                {item.label}
              </button>
            ))}
          </FilterBlock>

          <FilterBlock title="Коло">
            <button onClick={() => setLegFilter("all")} className={legFilter === "all" ? activeFilterClass : inactiveFilterClass}>Всі</button>
            {[1, 2].map(leg => (
              <button key={leg} onClick={() => setLegFilter(leg as 1 | 2)} className={legFilter === leg ? activeFilterClass : inactiveFilterClass}>
                {getSeason2LegLabel(leg as 1 | 2)}
              </button>
            ))}
          </FilterBlock>

          <FilterBlock title="Тур">
            <button onClick={() => setRoundFilter("all")} className={roundFilter === "all" ? activeFilterClass : inactiveFilterClass}>Всі</button>
            {season2Rounds.map(round => (
              <button key={round.round} onClick={() => setRoundFilter(round.round)} className={roundFilter === round.round ? activeFilterClass : inactiveFilterClass}>
                {round.round}
              </button>
            ))}
          </FilterBlock>

          <div className="mt-8 space-y-5">
            {filteredRounds.map(round => (
              <section key={round.round} className="overflow-hidden rounded-md border border-[#111111]/12 bg-white">
                <div className="flex flex-col gap-3 bg-[#111111] px-4 py-3 text-[#f7f7f2] sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h2 className="font-heading text-3xl leading-none">Тур {round.round}</h2>
                    <span className="rounded-full bg-[#bbf903] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#111111]">
                      {getSeason2LegLabel(round.leg)}
                    </span>
                    <RoundBye bye={round.bye} />
                  </div>
                  <span className="text-sm font-semibold text-[#f7f7f2]/70">{round.dayLabel} · {round.matches.length} матчів</span>
                </div>
                <div className="divide-y divide-[#111111]/10">
                  {round.matches.map(match => <Season2MatchRow key={match.id} match={match as Season2Match} />)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </Season2Shell>
  );
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[#111111]/50">{title}</div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {children}
      </div>
    </div>
  );
}
