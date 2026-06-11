import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clipboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatKyivDate, getTournamentPoints, predictMatches, stageLabels, type PredictUser } from "@/data/predictData";
import { getCurrentPredictUser, logoutPredictUser } from "@/lib/predictStore";

export default function PredictProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PredictUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentPredictUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <main className="content-shell py-10">
        <div className="rounded-md border border-[#2937da]/15 bg-white p-6 text-[#343434]/75">Завантажуємо профіль...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="content-shell py-10">
        <div className="rounded-md border border-[#2937da]/15 bg-white p-6">
          <h2 className="h-section text-[#343434]">Потрібен вхід</h2>
          <Button asChild className="mt-4 rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
            <Link to="/predict/login">Увійти</Link>
          </Button>
        </div>
      </main>
    );
  }

  const predictions = Object.values(user.predictions)
    .map(prediction => ({ prediction, match: predictMatches.find(match => match.id === prediction.matchId) }))
    .filter(item => item.match)
    .sort((a, b) => new Date(a.match!.matchDate).getTime() - new Date(b.match!.matchDate).getTime());
  const matchPoints = predictions.reduce((sum, item) => sum + item.prediction.pointsOutcome + item.prediction.pointsAdvancing, 0);
  const tournamentPoints = getTournamentPoints(user);

  async function logout() {
    await logoutPredictUser();
    navigate("/predict");
  }

  return (
    <main className="content-shell py-10">
      <div className="page-header">
        <div className="page-kicker">Особистий кабінет</div>
        <h2 className="h-page">{user.username}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Всього балів", value: matchPoints + tournamentPoints },
          { label: "Матчеві", value: matchPoints },
          { label: "Турнірні", value: tournamentPoints },
          { label: "Інвайти", value: `${user.invitesRemaining} з 3` },
        ].map(item => (
          <div key={item.label} className="rounded-md border border-[#2937da]/15 bg-white p-4">
            <div className="h-stat text-[#2937da]">{item.value}</div>
            <div className="t-label mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
          <div className="brand-stripe h-1" />
          <div className="space-y-5 p-5">
            <div>
              <h3 className="h-card text-[#343434]">Інвайт-код</h3>
              <div className="mt-3 flex gap-2">
                <code className="flex h-11 flex-1 items-center rounded-md border border-[#2937da]/15 bg-[#f3f3f6] px-3 font-bold text-[#2937da]">
                  {user.inviteCode}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-md border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white"
                  onClick={() => navigator.clipboard?.writeText(user.inviteCode)}
                  aria-label="Copy invite code"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="h-card text-[#343434]">Мої турнірні прогнози</h3>
              <dl className="mt-3 grid gap-3 text-sm">
                {[
                  ["Чемпіон", user.tournamentPrediction.champion],
                  ["Фіналіст", user.tournamentPrediction.finalist],
                  ["Бомбардир", user.tournamentPrediction.topScorer],
                  ["Темна конячка", user.tournamentPrediction.darkHorse],
                  ["Улюблена команда", user.tournamentPrediction.favoriteTeam],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-[#2937da]/10 pb-2 last:border-b-0">
                    <dt className="text-[#343434]/60">{label}</dt>
                    <dd className="font-semibold text-[#343434]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Button onClick={logout} variant="outline" className="h-11 rounded-md border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white">
              <LogOut className="mr-2 h-4 w-4" /> Вийти
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
          <div className="border-b border-[#2937da]/10 bg-[#f3f3f6] p-4">
            <h3 className="h-card text-[#343434]">Історія ставок</h3>
          </div>
          <div className="divide-y divide-[#2937da]/10">
            {predictions.length === 0 && <div className="p-5 text-sm text-[#343434]/70">Поки немає прогнозів.</div>}
            {predictions.map(({ prediction, match }) => (
              <div key={prediction.matchId} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="t-label">{stageLabels[match!.stage]} - {formatKyivDate(match!.matchDate)}</div>
                  <div className="truncate font-semibold text-[#343434]">{match!.homeTeam} vs {match!.awayTeam}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-heading text-xl text-[#2937da]">{prediction.predictedHomeScore}:{prediction.predictedAwayScore}</div>
                  <div className="t-meta">{prediction.pointsOutcome + prediction.pointsAdvancing} балів</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
