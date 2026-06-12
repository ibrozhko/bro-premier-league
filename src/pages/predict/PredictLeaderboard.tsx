import { Medal } from "lucide-react";
import { useEffect, useState } from "react";
import { getCorrectPredictionCount, getTournamentPoints } from "@/data/predictData";
import { getPredictUsers } from "@/lib/predictStore";
import type { PredictUser } from "@/data/predictData";

export default function PredictLeaderboard() {
  const [users, setUsers] = useState<Array<PredictUser & { totalPoints: number }>>([]);
  const [error, setError] = useState("");
  const podium = users.slice(0, 3);

  useEffect(() => {
    getPredictUsers()
      .then(items => setUsers(items.filter(user => !user.isAdmin).sort((a, b) => b.totalPoints - a.totalPoints)))
      .catch(err => setError(err instanceof Error ? err.message : "Не вдалося завантажити лідерборд."));
  }, []);

  return (
    <main className="content-shell py-6 sm:py-10">
      <div className="page-header">
        <div className="page-kicker">Оновлюється після синку результатів</div>
        <h2 className="h-page">Таблиця лідерів</h2>
      </div>
      {error && <div className="mb-5 rounded-md border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {podium.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
          {podium.map((user, index) => (
            <div
              key={user.id}
              className={`overflow-hidden rounded-md border border-[#2937da]/15 bg-white p-3 shadow-sm ${
                index === 0 ? "bg-[#2937da] text-white" : "text-[#343434]"
              }`}
            >
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md ${
                index === 0 ? "bg-[#bbf903] text-[#111111]" : "bg-[#2937da]/10 text-[#2937da]"
              }`}>
                <Medal className="h-5 w-5" />
              </div>
              <div className="font-heading text-2xl leading-none">{index + 1}</div>
              <div className={`mt-1 truncate text-sm font-bold ${index === 0 ? "text-white" : "text-[#343434]"}`}>
                {user.displayName || user.username}
              </div>
              <div className={`mt-2 font-heading text-3xl leading-none ${index === 0 ? "text-[#bbf903]" : "text-[#2937da]"}`}>
                {user.totalPoints}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_72px] gap-2 border-b border-[#2937da]/10 bg-[#f3f3f6] px-3 py-3 text-xs font-bold uppercase tracking-wide text-[#343434]/65 sm:grid-cols-[56px_1fr_92px_110px_100px]">
          <span>#</span>
          <span>Ім'я</span>
          <span className="text-right">Бали</span>
          <span className="hidden text-right sm:block">Турнірні</span>
          <span className="hidden text-right sm:block">Вірні</span>
        </div>
        {users.map((user, index) => (
          <div key={user.id} className="grid grid-cols-[44px_minmax(0,1fr)_72px] gap-2 border-b border-[#2937da]/10 px-3 py-4 last:border-b-0 sm:grid-cols-[56px_1fr_92px_110px_100px]">
            <span className="flex items-center gap-2 font-heading text-xl text-[#2937da]">
              {index < 3 && <Medal className="h-4 w-4 text-[#2937da]" />}
              {index + 1}
            </span>
            <span className="min-w-0 truncate font-semibold text-[#343434]">{user.displayName || user.username}</span>
            <span className="text-right font-heading text-xl text-[#2937da]">{user.totalPoints}</span>
            <span className="hidden text-right text-sm text-[#343434]/75 sm:block">{getTournamentPoints(user)}</span>
            <span className="hidden text-right text-sm text-[#343434]/75 sm:block">{getCorrectPredictionCount(user)}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
