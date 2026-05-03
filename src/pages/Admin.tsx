import { FormEvent, useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { matchdays, getPlayer } from "@/data/leagueData";

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

const savedPasswordKey = "bro-admin-password";

export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem(savedPasswordKey) ?? "");
  const [matchdayNumber, setMatchdayNumber] = useState(matchdays.find(md => md.matches.some(m => m.homeScore === null))?.number ?? matchdays[0].number);
  const selectedMatchday = useMemo(
    () => matchdays.find(md => md.number === matchdayNumber) ?? matchdays[0],
    [matchdayNumber],
  );
  const [matchIndex, setMatchIndex] = useState(0);
  const selectedMatch = selectedMatchday.matches[Math.min(matchIndex, selectedMatchday.matches.length - 1)];
  const [homeScore, setHomeScore] = useState(selectedMatch.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(selectedMatch.awayScore?.toString() ?? "");
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  const homePlayer = getPlayer(selectedMatch.home);
  const awayPlayer = getPlayer(selectedMatch.away);

  function chooseMatchday(value: number) {
    const nextMatchday = matchdays.find(md => md.number === value) ?? matchdays[0];
    const nextIndex = nextMatchday.matches.findIndex(m => m.homeScore === null);
    const safeIndex = nextIndex >= 0 ? nextIndex : 0;
    const nextMatch = nextMatchday.matches[safeIndex];

    setMatchdayNumber(value);
    setMatchIndex(safeIndex);
    setHomeScore(nextMatch.homeScore?.toString() ?? "");
    setAwayScore(nextMatch.awayScore?.toString() ?? "");
  }

  function chooseMatch(index: number) {
    const nextMatch = selectedMatchday.matches[index];

    setMatchIndex(index);
    setHomeScore(nextMatch.homeScore?.toString() ?? "");
    setAwayScore(nextMatch.awayScore?.toString() ?? "");
  }

  async function updateResult(nextHomeScore: number | null, nextAwayScore: number | null) {
    setIsSaving(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/update-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          matchdayNumber,
          home: selectedMatch.home,
          away: selectedMatch.away,
          homeScore: nextHomeScore,
          awayScore: nextAwayScore,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Не вдалося оновити результат");
      }

      localStorage.setItem(savedPasswordKey, password);
      setStatus({
        type: "success",
        message: `${payload.message}. Vercel вже запускає оновлення сайту.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Невідома помилка",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (!Number.isInteger(parsedHomeScore) || !Number.isInteger(parsedAwayScore) || parsedHomeScore < 0 || parsedAwayScore < 0) {
      setStatus({ type: "error", message: "Введи два невідʼємні цілі числа для рахунку." });
      return;
    }

    await updateResult(parsedHomeScore, parsedAwayScore);
  }

  return (
    <div className="min-h-screen py-10 sm:py-12">
      <div className="content-shell">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="h-page">Адмінка</h1>
            <p className="t-body text-muted-foreground">Оновлення рахунків через GitHub commit.</p>
          </div>
          <a className="t-body text-accent hover:underline" href="/fixtures">
            До календаря
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <label className="t-label mb-2 block" htmlFor="admin-password">
              Пароль
            </label>
            <input
              id="admin-password"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="ADMIN_PASSWORD"
            />
          </section>

          <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="mb-5 grid gap-4 sm:grid-cols-[160px_1fr]">
              <div>
                <label className="t-label mb-2 block" htmlFor="matchday">
                  Тур
                </label>
                <select
                  id="matchday"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  value={matchdayNumber}
                  onChange={event => chooseMatchday(Number(event.target.value))}
                >
                  {matchdays.map(md => (
                    <option key={md.number} value={md.number}>
                      Тур {md.number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="t-label mb-2 block" htmlFor="match">
                  Матч
                </label>
                <select
                  id="match"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  value={matchIndex}
                  onChange={event => chooseMatch(Number(event.target.value))}
                >
                  {selectedMatchday.matches.map((match, index) => {
                    const home = getPlayer(match.home);
                    const away = getPlayer(match.away);
                    const score = match.homeScore === null || match.awayScore === null
                      ? "не зіграно"
                      : `${match.homeScore}-${match.awayScore}`;

                    return (
                      <option key={`${match.home}-${match.away}`} value={index}>
                        {home.name} - {away.name} · {score}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="rounded-md bg-secondary/50 p-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="min-w-0 text-right">
                  <div className="h-card truncate">{homePlayer.name}</div>
                  <div className="t-meta truncate">{homePlayer.club}</div>
                </div>
                <div className="font-heading text-2xl text-accent">VS</div>
                <div className="min-w-0 text-left">
                  <div className="h-card truncate">{awayPlayer.name}</div>
                  <div className="t-meta truncate">{awayPlayer.club}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <input
                  className="h-14 min-w-0 rounded-md border border-input bg-background px-3 text-center font-heading text-3xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  inputMode="numeric"
                  min={0}
                  type="number"
                  value={homeScore}
                  onChange={event => setHomeScore(event.target.value)}
                />
                <span className="text-2xl text-muted-foreground">:</span>
                <input
                  className="h-14 min-w-0 rounded-md border border-input bg-background px-3 text-center font-heading text-3xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  inputMode="numeric"
                  min={0}
                  type="number"
                  value={awayScore}
                  onChange={event => setAwayScore(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto" type="submit" disabled={isSaving || !password}>
                <Save />
                {isSaving ? "Оновлюю..." : "Оновити"}
              </Button>
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="secondary"
                disabled={isSaving || !password}
                onClick={() => updateResult(null, null)}
              >
                <Trash2 />
                Очистити результат
              </Button>
            </div>
          </section>

          {status.message && (
            <div
              className={`rounded-md border p-4 t-body ${
                status.type === "success"
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-destructive/50 bg-destructive/10 text-destructive-foreground"
              }`}
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
