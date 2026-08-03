import { Gamepad2, Medal, Monitor, ShieldCheck, Trophy } from "lucide-react";
import { calculateSeason2Standings, season2Players, type Season2Player, type Season2Standing } from "@/data/season2Data";
import Season2Shell, { Season2PageHeader } from "./Season2Shell";

export default function Season2Players() {
  const standings = calculateSeason2Standings();
  const standingsByPlayer = new Map(standings.map((standing, index) => [
    standing.player.id,
    { ...standing, place: index + 1 },
  ]));

  return (
    <Season2Shell>
      <main className="min-h-screen bg-[#f7f7f2] pb-12">
        <Season2PageHeader
          eyebrow="Squad"
          title="Гравці"
          text="Склад Season 2 з обраними клубами, FC 26 ніками і платформами."
        />
        <section className="mx-auto grid max-w-5xl gap-3 px-4 sm:grid-cols-2 sm:gap-4 sm:px-5 lg:grid-cols-3">
          {season2Players.map(player => {
            const standing = standingsByPlayer.get(player.id);
            const goalDifference = standing?.goalDifference ?? 0;
            const goalDifferenceLabel = goalDifference > 0 ? `+${goalDifference}` : String(goalDifference);

            return (
              <article key={player.id} className="relative flex h-full overflow-hidden rounded-md border border-[#111111]/12 bg-white">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#ff5a1f]" />
                <div className="flex h-full w-full flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-3 sm:mb-4 sm:min-h-[156px] sm:gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#ff5a1f]/10 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-[#ff5a1f] sm:px-2.5 sm:py-1 sm:text-xs">
                          <Medal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          #{standing?.place ?? "-"}
                        </span>
                      </div>
                      <h2 className="text-[1.65rem] font-extrabold leading-none sm:text-2xl sm:leading-tight">{player.name}</h2>
                      <p className="mt-1 truncate text-sm leading-tight text-[#111111]/55">{player.club}</p>
                      {player.achievements?.length ? (
                        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
                          {player.achievements.map(achievement => (
                            <span
                              key={achievement}
                              className="inline-flex items-center gap-1 rounded-full border border-[#bbf903]/45 bg-[#bbf903]/18 px-2 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-wide text-[#111111] sm:px-2.5 sm:py-1 sm:text-[0.62rem]"
                            >
                              <Trophy className="h-2.5 w-2.5 text-[#ff5a1f] sm:h-3 sm:w-3" />
                              {achievement}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#bbf903] text-[#111111] sm:h-12 sm:w-12">
                      <PlatformIcon player={player} />
                    </div>
                  </div>

                  <div className="mb-3 rounded-md border border-[#ff5a1f]/18 bg-[#ff5a1f]/5 px-3 py-2.5 sm:mb-5 sm:px-4 sm:py-3">
                    <div className="mb-1.5 flex items-center justify-between gap-3 sm:mb-2">
                      <div className="text-[0.65rem] font-bold uppercase tracking-wide text-[#111111]/45">Нік у FC 26</div>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-[#111111]/65">
                        {player.platform ?? "FC 26"}
                      </span>
                    </div>
                    <div className="truncate text-base font-bold leading-tight text-[#ff5a1f]">{player.nick ?? "Уточнюється"}</div>
                  </div>

                  <div>
                    <div className="grid grid-cols-4 gap-1.5 text-center sm:gap-2">
                      {[
                        { label: "І", value: standing?.played ?? 0 },
                        { label: "О", value: standing?.points ?? 0 },
                        { label: "В", value: standing?.won ?? 0 },
                        { label: "РГ", value: goalDifferenceLabel },
                      ].map(stat => (
                        <StatBox key={stat.label} label={stat.label} value={stat.value} highlight={stat.label === "О"} />
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2">
                      <Metric icon={Trophy} label="Атака" value={`${standing?.goalsFor ?? 0} голів`} />
                      <Metric icon={ShieldCheck} label="Захист" value={`${standing?.goalsAgainst ?? 0} пропущено`} />
                    </div>

                    <div className="mt-3 rounded-md border border-[#111111]/10 bg-[#f7f7f2] px-3 py-2 sm:mt-4">
                      <div className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#111111]/45 sm:mb-2">Форма</div>
                      <FormPills form={standing?.form ?? []} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </Season2Shell>
  );
}

function PlatformIcon({ player }: { player: Season2Player }) {
  if (player.platform === "PC") return <Monitor className="h-[18px] w-[18px] sm:h-5 sm:w-5" />;
  return <Gamepad2 className="h-[18px] w-[18px] sm:h-5 sm:w-5" />;
}

function StatBox({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="rounded-md border border-[#111111]/10 bg-[#f7f7f2] py-1.5 sm:py-2">
      <div className={`font-heading text-base leading-none sm:text-xl ${highlight ? "text-[#ff5a1f]" : "text-[#111111]"}`}>{value}</div>
      <div className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-[#111111]/45 sm:text-[0.65rem]">{label}</div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#111111]/10 bg-white px-2.5 py-2 sm:px-3">
      <div className="flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-wide text-[#111111]/45 sm:gap-2 sm:text-[0.65rem]">
        <Icon className="h-3 w-3 text-[#ff5a1f] sm:h-3.5 sm:w-3.5" />
        {label}
      </div>
      <div className="mt-1 truncate font-heading text-lg leading-none text-[#111111] sm:text-xl">{value}</div>
    </div>
  );
}

function FormPills({ form }: { form: Season2Standing["form"] }) {
  const values = form.length ? form : Array.from({ length: 5 }, () => null);

  return (
    <div className="flex gap-1">
      {values.map((value, index) => {
        const className = value === "W"
          ? "bg-[#bbf903] text-[#111111]"
          : value === "D"
            ? "bg-[#111111]/12 text-[#111111]"
            : value === "L"
              ? "bg-[#ff5a1f] text-white"
              : "bg-[#111111]/8 text-[#111111]/28";

        return (
          <span key={`${value ?? "empty"}-${index}`} className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.58rem] font-extrabold sm:h-6 sm:w-6 sm:text-[0.65rem] ${className}`}>
            {value ?? "-"}
          </span>
        );
      })}
    </div>
  );
}
