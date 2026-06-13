import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPredictUsers, getCurrentPredictUser, seedPredictUser, updateManualResult } from "@/lib/predictStore";
import { getTeamLabel, predictMatches, type PredictUser } from "@/data/predictData";

export default function PredictAdmin() {
  const [user, setUser] = useState<PredictUser | null>(null);
  const [users, setUsers] = useState<Array<PredictUser & { totalPoints: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seedName, setSeedName] = useState("");
  const [matchId, setMatchId] = useState(predictMatches[0].id.toString());
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getCurrentPredictUser(), getPredictUsers()])
      .then(([currentUser, loadedUsers]) => {
        setUser(currentUser);
        setUsers(loadedUsers.sort((a, b) => b.totalPoints - a.totalPoints));
      })
      .catch(err => setMessage(err instanceof Error ? err.message : "Не вдалося завантажити адмінку."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <main className="content-shell py-10">
        <div className="rounded-md border border-[#2937da]/15 bg-white p-6 text-[#343434]/75">Завантажуємо адмінку...</div>
      </main>
    );
  }

  if (!user?.isAdmin) {
    return (
      <main className="content-shell py-10">
        <div className="rounded-md border border-[#2937da]/15 bg-white p-6">
          <h2 className="h-section text-[#343434]">Доступ тільки для адміна</h2>
          <Button asChild className="mt-4 rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
            <Link to="/predict/login">Увійти</Link>
          </Button>
        </div>
      </main>
    );
  }

  async function seed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const created = await seedPredictUser(seedName);
      setSeedName("");
      setMessage(`Створено ${created.username}. Пароль: ${created.password}. Код: ${created.inviteCode}.`);
      setUsers(await getPredictUsers());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Не вдалося створити гравця.");
    }
  }

  async function updateResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedMatchId = Number(matchId);
    const parsedHome = Number(homeScore);
    const parsedAway = Number(awayScore);
    if (!Number.isInteger(parsedHome) || !Number.isInteger(parsedAway) || parsedHome < 0 || parsedAway < 0) {
      setMessage("Введи коректний рахунок.");
      return;
    }
    try {
      const match = await updateManualResult(parsedMatchId, parsedHome, parsedAway);
      setMessage(`Оновлено: ${getTeamLabel(match.homeTeam)} ${parsedHome}:${parsedAway} ${getTeamLabel(match.awayTeam)}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Не вдалося оновити матч.");
    }
  }

  return (
    <main className="content-shell py-10">
      <div className="page-header">
        <div className="page-kicker">Predict admin</div>
        <h2 className="h-page">Адмін-панель</h2>
      </div>

      {message && <div className="mb-5 rounded-md border border-[#2937da]/20 bg-white px-4 py-3 text-sm text-[#343434]">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={seed} className="rounded-md border border-[#2937da]/15 bg-white p-5">
          <h3 className="h-card text-[#343434]">Seed початкового гравця</h3>
          <div className="mt-4 flex gap-2">
            <Input value={seedName} onChange={event => setSeedName(event.target.value)} placeholder="Нікнейм" className="bg-white text-[#343434]" />
            <Button className="rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
              <Plus className="mr-2 h-4 w-4" /> Додати
            </Button>
          </div>
        </form>

        <form onSubmit={updateResult} className="rounded-md border border-[#2937da]/15 bg-white p-5">
          <h3 className="h-card text-[#343434]">Ручне оновлення результату</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_80px_80px_auto]">
            <select
              value={matchId}
              onChange={event => setMatchId(event.target.value)}
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-[#343434]"
            >
              {predictMatches.slice(0, 20).map(match => (
                <option key={match.id} value={match.id}>{getTeamLabel(match.homeTeam)} vs {getTeamLabel(match.awayTeam)}</option>
              ))}
            </select>
            <Input value={homeScore} onChange={event => setHomeScore(event.target.value)} inputMode="numeric" placeholder="H" className="bg-white text-[#343434]" />
            <Input value={awayScore} onChange={event => setAwayScore(event.target.value)} inputMode="numeric" placeholder="A" className="bg-white text-[#343434]" />
            <Button className="rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </form>
      </div>

      <section className="mt-6 overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
        <div className="border-b border-[#2937da]/10 bg-[#f3f3f6] p-4">
          <h3 className="h-card text-[#343434]">Гравці та інвайти</h3>
        </div>
        <div className="divide-y divide-[#2937da]/10">
          {users.map(item => (
            <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_120px_120px_120px] sm:items-center">
              <div>
                <div className="font-semibold text-[#343434]">{item.displayName || item.username}{item.isAdmin ? " (admin)" : ""}</div>
                <div className="t-meta">{item.username} · {item.inviteCode}</div>
              </div>
              <div className="text-sm text-[#343434]/75">Бали: {item.totalPoints}</div>
              <div className="text-sm text-[#343434]/75">Інвайти: {item.invitesRemaining}</div>
              <div className="text-sm text-[#343434]/75">Ставки: {Object.keys(item.predictions).length}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
