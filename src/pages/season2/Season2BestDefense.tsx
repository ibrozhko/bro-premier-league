import { getSeason2BestDefense } from "@/data/season2Data";
import Season2Shell, { Season2PageHeader } from "./Season2Shell";

export default function Season2BestDefense() {
  const rows = getSeason2BestDefense();

  return (
    <Season2Shell>
      <main className="min-h-screen bg-[#f7f7f2] pb-12">
        <Season2PageHeader eyebrow="Defense" title="Захист" text="Хто менше пропускає у Season 2. Стартові нулі тимчасові, далі рейтинг рахуватиметься з матчів." />
        <section className="mx-auto max-w-5xl px-5">
          <div className="overflow-hidden rounded-md border border-[#111111]/12 bg-white">
            <table className="w-full min-w-[620px] text-left sm:min-w-[680px]">
              <thead className="bg-[#111111] text-[#f7f7f2]">
                <tr className="text-[0.68rem] uppercase tracking-wide sm:text-xs">
                  <th className="px-3 py-3 sm:px-4">#</th>
                  <th className="px-3 py-3 sm:px-4">Гравець</th>
                  <th className="px-3 py-3 sm:px-4">Клуб</th>
                  <th className="px-3 py-3 text-center sm:px-4">Матчів</th>
                  <th className="px-3 py-3 text-center sm:px-4">Пропущено</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/10">
                {rows.map((row, index) => (
                  <tr key={row.player.id}>
                    <td className="px-3 py-3 font-heading text-xl text-[#ff5a1f] sm:px-4 sm:py-4 sm:text-2xl">{index + 1}</td>
                    <td className="px-3 py-3 text-base font-bold sm:px-4 sm:py-4 sm:text-lg">{row.player.name}</td>
                    <td className="px-3 py-3 text-sm text-[#111111]/60 sm:px-4 sm:py-4 sm:text-base">{row.player.club}</td>
                    <td className="px-3 py-3 text-center text-sm font-semibold sm:px-4 sm:py-4 sm:text-base">{row.played}</td>
                    <td className="px-3 py-3 text-center font-heading text-xl text-[#ff5a1f] sm:px-4 sm:py-4 sm:text-2xl">{row.goalsAgainst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </Season2Shell>
  );
}
