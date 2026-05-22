import { players, calculateStandings, getTopScorers } from "@/data/leagueData";
import { Gamepad2, Monitor } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Players() {
  const { language, player, t } = useLanguage();
  const standings = calculateStandings();
  const scorers = getTopScorers();

  return (
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <div className="page-header">
          <div className="page-kicker">{language === "uk" ? "Учасники сезону" : "Season roster"}</div>
          <h1 className="h-page">{t("players.title")}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(p => {
            const displayPlayer = player(p);
            const s = standings.find(st => st.playerId === p.id)!;
            const goals = scorers.find(sc => sc.playerId === p.id)?.goals ?? 0;

            return (
              <div
                key={p.id}
                className="light-panel relative overflow-hidden rounded-md p-5"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-primary" />
                <div
                  className="absolute top-0 left-0 w-1 h-full opacity-90"
                  style={{ backgroundColor: `hsl(${p.clubColor})` }}
                />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="h-card truncate">{displayPlayer.name}</h3>
                    <p className="t-meta truncate">{displayPlayer.club}</p>
                  </div>
                  <span className="shrink-0 flex items-center gap-1 text-xs bg-[#f3f3f6] border border-[#2937da]/15 px-2 py-1 rounded-md text-[#343434]/70">
                    {p.platform === "PC" ? <Monitor className="h-3 w-3" /> : <Gamepad2 className="h-3 w-3" />}
                    {p.platform}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: language === "uk" ? "І" : "P", value: s.played },
                    { label: language === "uk" ? "ГЗ" : "GF", value: goals },
                    { label: language === "uk" ? "ГП" : "GA", value: s.goalsAgainst },
                    { label: language === "uk" ? "О" : "Pts", value: s.points },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#f3f3f6] border border-[#2937da]/15 rounded-md py-2">
                      <div className={`font-heading text-lg sm:text-xl ${stat.label === (language === "uk" ? "О" : "Pts") ? "text-primary" : "text-[#343434]"}`}>{stat.value}</div>
                      <div className="t-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
