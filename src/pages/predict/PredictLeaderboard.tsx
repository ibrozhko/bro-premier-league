import { Medal, ShieldCheck, Target, Trophy, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getCorrectPredictionCount, getExactPredictionCount, getTournamentPoints } from "@/data/predictData";
import { getPredictUsers } from "@/lib/predictStore";
import type { PredictUser } from "@/data/predictData";

export default function PredictLeaderboard() {
  const [users, setUsers] = useState<Array<PredictUser & { totalPoints: number }>>([]);
  const [error, setError] = useState("");
  const leader = users[0];

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

      {leader && (
        <div className="mb-4 overflow-hidden rounded-md border border-[#2937da]/15 bg-[#2937da] text-white shadow-[0_18px_48px_rgba(41,55,218,0.18)]">
          <div className="brand-stripe h-1" />
          <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#bbf903] text-[#111111]">
              <Medal className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-white/70">Лідер зараз</div>
              <div className="truncate font-heading text-3xl leading-none text-white">{leader.displayName || leader.username}</div>
            </div>
            <div className="text-right">
              <div className="font-heading text-4xl leading-none text-[#bbf903]">{leader.totalPoints}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/70">балів</div>
            </div>
          </div>
        </div>
      )}

      <section className="mb-4 overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
        <div className="brand-stripe h-1" />
        <div className="p-4">
          <div className="page-kicker">Система балів</div>
          <h3 className="h-section">Як рахуються очки</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreTile icon={Target} title="Напрям" value="5 балів" text="Перемога однієї з команд або нічия." />
            <ScoreTile icon={Trophy} title="Точний рахунок" value="10 балів" text="Повний збіг рахунку матчу." />
            <ScoreTile icon={ShieldCheck} title="Плей-офф" value="+5" text="Команда проходить у наступний раунд." />
            <ScoreTile icon={UsersRound} title="Інвайти" value="3 коди" text="Кожен гравець має власні запрошення." />
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_72px] gap-2 border-b border-[#2937da]/10 bg-[#f3f3f6] px-3 py-3 text-xs font-bold uppercase tracking-wide text-[#343434]/65 sm:grid-cols-[56px_1fr_92px_96px_92px_92px]">
          <span>#</span>
          <span>Ім'я</span>
          <span className="text-right">Бали</span>
          <span className="hidden text-right sm:block">Турнірні</span>
          <span className="hidden text-right sm:block">Напрям</span>
          <span className="hidden text-right sm:block">Точні</span>
        </div>
        {users.map((user, index) => (
          <div key={user.id} className="grid grid-cols-[44px_minmax(0,1fr)_72px] items-center gap-2 border-b border-[#2937da]/10 px-3 py-4 last:border-b-0 sm:grid-cols-[56px_1fr_92px_96px_92px_92px]">
            <span className="flex items-center gap-2 font-heading text-xl text-[#2937da]">
              {index < 3 ? (
                <Medal className="h-5 w-5" />
              ) : null}
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-[#343434]">{user.displayName || user.username}</span>
              <span className="mt-1 flex gap-3 text-xs font-semibold uppercase tracking-wide text-[#343434]/55 sm:hidden">
                <span>Напрям {getCorrectPredictionCount(user)}</span>
                <span>Точні {getExactPredictionCount(user)}</span>
              </span>
            </span>
            <span className="text-right font-heading text-xl text-[#2937da]">{user.totalPoints}</span>
            <span className="hidden text-right text-sm text-[#343434]/75 sm:block">{getTournamentPoints(user)}</span>
            <span className="hidden text-right text-sm text-[#343434]/75 sm:block">{getCorrectPredictionCount(user)}</span>
            <span className="hidden text-right text-sm text-[#343434]/75 sm:block">{getExactPredictionCount(user)}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

function ScoreTile({ icon: Icon, title, value, text }: { icon: typeof Target; title: string; value: string; text: string }) {
  return (
    <div className="rounded-md border border-[#2937da]/15 bg-[#f7f7fb] p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2937da]/10 text-[#2937da]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-[#2937da]">{title}</div>
          <div className="font-heading text-xl leading-none text-[#343434]">{value}</div>
          <p className="mt-1 text-sm leading-5 text-[#343434]/65">{text}</p>
        </div>
      </div>
    </div>
  );
}
