import { FormEvent, useMemo, useState } from "react";
import { Plus, RotateCcw, Save, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentSeason, matchdays, getPlayer, players, type Player } from "@/data/leagueData";

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

type AdminTab = "results" | "players" | "season";

const savedPasswordKey = "bro-admin-password";
const platforms: Player["platform"][] = ["PS5", "Xbox", "PC"];
const defaultClubColors = [
  "217 78% 57%",
  "42 87% 55%",
  "0 70% 50%",
  "145 63% 42%",
  "280 65% 60%",
  "190 76% 48%",
];

export default function Admin() {
  const [password, setPassword] = useState(() => localStorage.getItem(savedPasswordKey) ?? "");
  const [activeTab, setActiveTab] = useState<AdminTab>("results");
  const [matchdayNumber, setMatchdayNumber] = useState(matchdays.find(md => md.matches.some(m => m.homeScore === null))?.number ?? matchdays[0].number);
  const selectedMatchday = useMemo(
    () => matchdays.find(md => md.number === matchdayNumber) ?? matchdays[0],
    [matchdayNumber],
  );
  const [matchIndex, setMatchIndex] = useState(0);
  const selectedMatch = selectedMatchday.matches[Math.min(matchIndex, selectedMatchday.matches.length - 1)];
  const [homeScore, setHomeScore] = useState(selectedMatch.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(selectedMatch.awayScore?.toString() ?? "");
  const [editablePlayers, setEditablePlayers] = useState<Player[]>(() => players.map(player => ({ ...player })));
  const [seasonConfirmation, setSeasonConfirmation] = useState("");
  const [generateSchedule, setGenerateSchedule] = useState(true);
  const [seasonStartDate, setSeasonStartDate] = useState(() => getDefaultSeasonStartDate());
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  const homePlayer = getPlayer(selectedMatch.home);
  const awayPlayer = getPlayer(selectedMatch.away);
  const nextSeason = currentSeason + 1;
  const usedPlayerIds = useMemo(() => getUsedPlayerIds(), []);

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

  async function sendAdminAction(body: Record<string, unknown>) {
    setIsSaving(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/update-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...body }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Не вдалося оновити дані");
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

  async function updateResult(nextHomeScore: number | null, nextAwayScore: number | null) {
    await sendAdminAction({
      action: "updateResult",
      matchdayNumber,
      home: selectedMatch.home,
      away: selectedMatch.away,
      homeScore: nextHomeScore,
      awayScore: nextAwayScore,
    });
  }

  async function handleResultSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedHomeScore = Number(homeScore);
    const parsedAwayScore = Number(awayScore);

    if (!Number.isInteger(parsedHomeScore) || !Number.isInteger(parsedAwayScore) || parsedHomeScore < 0 || parsedAwayScore < 0) {
      setStatus({ type: "error", message: "Введи два невідʼємні цілі числа для рахунку." });
      return;
    }

    await updateResult(parsedHomeScore, parsedAwayScore);
  }

  async function handlePlayersSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendAdminAction({
      action: "updatePlayers",
      players: editablePlayers,
    });
  }

  async function handleSeasonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendAdminAction({
      action: "startSeason",
      confirmation: seasonConfirmation,
      season: nextSeason,
      players: editablePlayers,
      generateSchedule,
      startDate: seasonStartDate,
    });
  }

  function updatePlayer(playerId: number, patch: Partial<Player>) {
    setEditablePlayers(current =>
      current.map(player => player.id === playerId ? { ...player, ...patch } : player),
    );
  }

  function addPlayer() {
    setEditablePlayers(current => {
      const nextId = Math.max(0, ...current.map(player => player.id)) + 1;

      return [
        ...current,
        {
          id: nextId,
          name: `Гравець ${nextId}`,
          club: "Новий клуб",
          platform: "PS5",
          clubColor: defaultClubColors[nextId % defaultClubColors.length],
        },
      ];
    });
  }

  function removePlayer(playerId: number) {
    setEditablePlayers(current => current.filter(player => player.id !== playerId));
  }

  return (
    <div className="min-h-screen py-10 sm:py-12">
      <div className="content-shell">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="h-page">Адмінка</h1>
            <p className="t-body text-muted-foreground">Сезон {currentSeason}: результати, гравці та підготовка нового сезону.</p>
          </div>
          <a className="t-body text-accent hover:underline" href="/fixtures">
            До календаря
          </a>
        </div>

        <section className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-6">
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

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-lg bg-secondary/50 p-1">
          {[
            { value: "results", label: "Результати" },
            { value: "players", label: "Гравці" },
            { value: "season", label: "Сезон" },
          ].map(tab => (
            <button
              key={tab.value}
              className={`h-10 rounded-md px-2 text-sm font-medium transition-colors ${
                activeTab === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              onClick={() => setActiveTab(tab.value as AdminTab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "results" && (
          <form onSubmit={handleResultSubmit} className="space-y-6">
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
          </form>
        )}

        {activeTab === "players" && (
          <form onSubmit={handlePlayersSubmit} className="space-y-4">
            <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="h-card">Склад ліги</h2>
                  <p className="t-body text-muted-foreground">
                    Зараз у списку {editablePlayers.length} гравців. Нові гравці отримують наступний вільний ID.
                  </p>
                </div>
                <Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={addPlayer}>
                  <Plus />
                  Додати гравця
                </Button>
              </div>
            </section>

            {editablePlayers.map(player => (
              <section key={player.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="h-card">ID {player.id}</div>
                    <div className="t-meta">Гравець сезону {currentSeason}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md border border-border" style={{ backgroundColor: `hsl(${player.clubColor})` }} />
                    <button
                      aria-label={`Видалити ${player.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      title={usedPlayerIds.has(player.id) ? "Для нового сезону з генерацією календаря" : "Видалити"}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminInput label="Імʼя" value={player.name} onChange={value => updatePlayer(player.id, { name: value })} />
                  <AdminInput label="Клуб" value={player.club} onChange={value => updatePlayer(player.id, { club: value })} />
                  <div>
                    <label className="t-label mb-2 block">Платформа</label>
                    <select
                      className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      value={player.platform}
                      onChange={event => updatePlayer(player.id, { platform: event.target.value as Player["platform"] })}
                    >
                      {platforms.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>
                  <AdminInput label="Колір HSL" value={player.clubColor} onChange={value => updatePlayer(player.id, { clubColor: value })} />
                </div>
              </section>
            ))}

            <Button className="w-full sm:w-auto" type="submit" disabled={isSaving || !password}>
              <Users />
              {isSaving ? "Зберігаю..." : "Зберегти гравців"}
            </Button>
          </form>
        )}

        {activeTab === "season" && (
          <form onSubmit={handleSeasonSubmit} className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="h-card">Почати сезон {nextSeason}</h2>
                <p className="t-body text-muted-foreground">
                  Поточний сезон {currentSeason} буде збережений в архів. Новий сезон можна створити з календарем під {editablePlayers.length} гравців.
                </p>
              </div>

              <label className="mb-4 flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3">
                <input
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={generateSchedule}
                  type="checkbox"
                  onChange={event => setGenerateSchedule(event.target.checked)}
                />
                <span>
                  <span className="t-body block font-medium">Згенерувати календар під актуальний список гравців</span>
                  <span className="t-meta block">
                    Double round-robin: кожен з кожним вдома і на виїзді. Якщо гравців непарна кількість, буде автоматичний пропуск туру.
                  </span>
                </span>
              </label>

              {generateSchedule && (
                <div className="mb-4">
                  <label className="t-label mb-2 block" htmlFor="season-start-date">
                    Дата першого туру
                  </label>
                  <input
                    id="season-start-date"
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    type="date"
                    value={seasonStartDate}
                    onChange={event => setSeasonStartDate(event.target.value)}
                  />
                </div>
              )}

              <label className="t-label mb-2 block" htmlFor="season-confirmation">
                Підтвердження
              </label>
              <input
                id="season-confirmation"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                value={seasonConfirmation}
                onChange={event => setSeasonConfirmation(event.target.value)}
                placeholder={`Введи SEASON ${nextSeason}`}
              />

              <Button
                className="mt-5 w-full sm:w-auto"
                type="submit"
                variant="destructive"
                disabled={isSaving || !password || seasonConfirmation !== `SEASON ${nextSeason}`}
              >
                <RotateCcw />
                {isSaving ? "Готую..." : `Архівувати і почати сезон ${nextSeason}`}
              </Button>
            </section>
          </form>
        )}

        {status.message && (
          <div
            className={`mt-6 rounded-md border p-4 t-body ${
              status.type === "success"
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-destructive/50 bg-destructive/10 text-destructive-foreground"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="t-label mb-2 block">{label}</label>
      <input
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
}

function getUsedPlayerIds() {
  const ids = new Set<number>();

  matchdays.forEach(matchday => {
    ids.add(matchday.bye);
    matchday.matches.forEach(match => {
      ids.add(match.home);
      ids.add(match.away);
    });
  });

  ids.delete(0);
  return ids;
}

function getDefaultSeasonStartDate() {
  const date = new Date();
  const day = date.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSaturday);

  return date.toISOString().slice(0, 10);
}
