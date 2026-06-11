import { Medal } from "lucide-react";
import { getCorrectPredictionCount, getTournamentPoints } from "@/data/predictData";
import { getPredictUsers } from "@/lib/predictStore";

export default function PredictLeaderboard() {
  const users = getPredictUsers().sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <main className="content-shell py-10">
      <div className="page-header">
        <div className="page-kicker">Оновлення кожні 60 секунд у production</div>
        <h2 className="h-page">Таблиця лідерів</h2>
      </div>

      <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
        <div className="grid grid-cols-[56px_1fr_92px_110px_100px] gap-2 border-b border-[#2937da]/10 bg-[#f3f3f6] px-3 py-3 text-xs font-bold uppercase tracking-wide text-[#343434]/65">
          <span>#</span>
          <span>Нікнейм</span>
          <span className="text-right">Бали</span>
          <span className="text-right">Турнірні</span>
          <span className="text-right">Вірні</span>
        </div>
        {users.map((user, index) => (
          <div key={user.id} className="grid grid-cols-[56px_1fr_92px_110px_100px] gap-2 border-b border-[#2937da]/10 px-3 py-4 last:border-b-0">
            <span className="flex items-center gap-2 font-heading text-xl text-[#2937da]">
              {index < 3 && <Medal className="h-4 w-4 text-[#2937da]" />}
              {index + 1}
            </span>
            <span className="min-w-0 truncate font-semibold text-[#343434]">{user.username}</span>
            <span className="text-right font-heading text-xl text-[#2937da]">{user.totalPoints}</span>
            <span className="text-right text-sm text-[#343434]/75">{getTournamentPoints(user)}</span>
            <span className="text-right text-sm text-[#343434]/75">{getCorrectPredictionCount(user)}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
