import { ShieldCheck } from "lucide-react";
import { getWorldCupBestDefense } from "@/data/worldCup2026Data";

export default function WorldCupBestDefense() {
  const defenders = getWorldCupBestDefense();
  const medalColors = ["text-[#ff008c]", "text-[#343434]/70", "text-amber-700"];

  return (
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <div className="page-header">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#ff008c]">Міцність оборони</div>
          <h1 className="h-page flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 shrink-0 text-[#ff008c] md:h-10 md:w-10" /> Найкращий захист
          </h1>
        </div>

        <div className="light-panel overflow-hidden rounded-md">
          <div className="h-px bg-[#ff008c]" />
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 px-2 py-3 text-left t-label sm:px-4">#</th>
                <th className="px-2 py-3 text-left t-label sm:px-4">Гравець</th>
                <th className="hidden px-2 py-3 text-left t-label sm:table-cell sm:px-4">Збірна</th>
                <th className="hidden w-16 px-2 py-3 text-center t-label md:table-cell sm:px-4">І</th>
                <th className="w-24 px-2 py-3 text-center font-bold t-label sm:px-4">Пропущені</th>
              </tr>
            </thead>
            <tbody>
              {defenders.map((row, index) => (
                <tr key={row.name} className="border-b border-border last:border-0">
                  <td className="px-2 py-3 sm:px-4">
                    <span className={`font-heading text-lg ${index < 3 ? medalColors[index] : ""}`}>{index + 1}</span>
                  </td>
                  <td className="px-2 py-3 font-medium sm:px-4">
                    <div>{row.player}</div>
                    <div className="t-meta mt-0.5 sm:hidden">{row.team}</div>
                    <div className="t-meta mt-0.5 md:hidden">Зіграно: {row.played}</div>
                  </td>
                  <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell sm:px-4">{row.team}</td>
                  <td className="hidden px-2 py-3 text-center md:table-cell sm:px-4">{row.played}</td>
                  <td className="px-2 py-3 text-center font-heading text-lg text-[#ff008c] sm:px-4 sm:text-xl">{row.goalsAgainst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
