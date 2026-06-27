import { useMemo, useState } from "react";
import { Gamepad2, Monitor, ShieldCheck, Trophy, UsersRound } from "lucide-react";
import {
  calculateWorldCupStandings,
  worldCupGroups,
  worldCupTeams,
  type WorldCupGroupId,
  type WorldCupTeam,
} from "@/data/worldCup2026Data";

type GroupFilter = "all" | WorldCupGroupId;

function getFc26Nick(team: WorldCupTeam) {
  return team.fc26Nick ?? "Уточнюється";
}

function PlatformIcon({ platform }: { platform?: WorldCupTeam["platform"] }) {
  if (platform === "PC") return <Monitor className="h-6 w-6" />;
  return <Gamepad2 className="h-6 w-6" />;
}

export default function WorldCupPlayers() {
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("all");

  const standingsByName = useMemo(() => {
    return new Map(
      worldCupGroups.flatMap(group =>
        calculateWorldCupStandings(group.id).map((standing, index) => [
          standing.name,
          { ...standing, place: index + 1, group: group.id },
        ])
      )
    );
  }, []);

  const filteredTeams = activeGroup === "all"
    ? worldCupTeams
    : worldCupTeams.filter(team => team.group === activeGroup);

  const filters: { id: GroupFilter; label: string }[] = [
    { id: "all", label: "Усі" },
    ...worldCupGroups.map(group => ({ id: group.id, label: group.title })),
  ];

  return (
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <div className="page-header">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#ff008c]">Ростер турніру</div>
          <h1 className="h-page flex items-center gap-3">
            <UsersRound className="h-8 w-8 shrink-0 text-[#ff008c] md:h-10 md:w-10" /> Гравці
          </h1>
          <p className="t-body mt-3 max-w-3xl">
            15 учасників BPL World Cup 2026: групи, збірні, FC 26 ніки та поточна форма в турнірі.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map(filter => {
            const isActive = activeGroup === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveGroup(filter.id)}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-[#ff008c] bg-[#ff008c] text-white"
                    : "border-[#ff008c]/25 bg-white text-[#343434] hover:border-[#ff008c] hover:text-[#ff008c]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map(team => {
            const standing = standingsByName.get(team.name);
            const goalDifference = standing?.goalDifference ?? 0;
            const goalDifferenceLabel = goalDifference > 0 ? `+${goalDifference}` : String(goalDifference);

            return (
              <article key={team.name} className="light-panel relative overflow-hidden rounded-md p-5">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#ff008c]" />
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#ff008c]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#ff008c]">
                        Група {team.group}
                      </span>
                      <span className="rounded-md border border-[#ff008c]/20 bg-white px-2.5 py-1 text-xs font-semibold text-[#343434]/70">
                        № у групі {team.seed}
                      </span>
                    </div>
                    <h2 className="h-card truncate">{team.player}</h2>
                    <p className="t-meta mt-1 truncate">{team.team}</p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#bbf903] text-[#111111]">
                    <PlatformIcon platform={team.platform} />
                  </div>
                </div>

                <div className="mb-5 rounded-md border border-[#ff008c]/20 bg-[#ff008c]/5 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="t-label">Нік у FC 26</div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-[#343434]/70">
                      {team.platform ?? "FC 26"}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${team.fc26Nick ? "text-[#ff008c]" : "text-[#343434]/55"}`}>
                    {getFc26Nick(team)}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Місце", value: standing?.place ? `#${standing.place}` : "-" },
                    { label: "І", value: standing?.played ?? 0 },
                    { label: "О", value: standing?.points ?? 0 },
                    { label: "РГ", value: goalDifferenceLabel },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-md border border-[#ff008c]/15 bg-white py-2">
                      <div className={`font-heading text-lg sm:text-xl ${stat.label === "О" ? "text-[#ff008c]" : "text-[#343434]"}`}>
                        {stat.value}
                      </div>
                      <div className="t-label">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-[#ff008c]/15 bg-white px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#343434]/55">
                      <Trophy className="h-3.5 w-3.5 text-[#ff008c]" /> Атака
                    </div>
                    <div className="mt-1 font-heading text-xl text-[#343434]">{standing?.goalsFor ?? 0}</div>
                  </div>
                  <div className="rounded-md border border-[#ff008c]/15 bg-white px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#343434]/55">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#ff008c]" /> Захист
                    </div>
                    <div className="mt-1 font-heading text-xl text-[#343434]">{standing?.goalsAgainst ?? 0}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
