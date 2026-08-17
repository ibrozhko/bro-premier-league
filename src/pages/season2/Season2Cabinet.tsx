import { Bell, CalendarDays, Clock3, House, ListChecks, LogOut, Table2, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  calculateSeason2Standings,
  getSeason2LegLabel,
  isSeason2Played,
  season2Players,
  season2Rounds,
  type Season2Match,
  type Season2Player,
  type Season2Round,
  type Season2Standing,
} from "@/data/season2Data";
import {
  getCurrentSeason2User,
  loginSeason2User,
  loadSeason2PredictionLeaderboard,
  logoutSeason2User,
  saveSeason2RoundPredictions,
  type Season2PredictionLeaderboardRow,
  type Season2SavedPrediction,
  type Season2User,
} from "@/lib/season2Predictions";
import {
  enableSeason2Push,
  getSeason2PushStatus,
  sendSeason2TestPush,
  type Season2PushStatus,
} from "@/lib/season2Push";
import {
  getScheduleBadge,
  loadSeason2MatchSchedules,
  saveSeason2MatchSchedule,
  type Season2MatchSchedule,
} from "@/lib/season2Scheduling";

type CabinetTab = "home" | "matches" | "predictions" | "table" | "profile";

const storageKey = "bpl-season2-cabinet-player";

export default function Season2Cabinet() {
  const [activeTab, setActiveTab] = useState<CabinetTab>("home");
  const [authStatus, setAuthStatus] = useState<"loading" | "ready">("loading");
  const [user, setUser] = useState<Season2User | null>(null);
  const [schedules, setSchedules] = useState<Record<string, Season2MatchSchedule>>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState(() => {
    if (typeof window === "undefined") return season2Players[0]?.id ?? "";
    return window.localStorage.getItem(storageKey) ?? season2Players[0]?.id ?? "";
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = themeMeta?.getAttribute("content");

    root.classList.add("bpl-cabinet-shell");
    body.classList.add("bpl-cabinet-shell");
    themeMeta?.setAttribute("content", "#111111");

    return () => {
      root.classList.remove("bpl-cabinet-shell");
      body.classList.remove("bpl-cabinet-shell");
      if (themeMeta && previousTheme) {
        themeMeta.setAttribute("content", previousTheme);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    loadSeason2MatchSchedules()
      .then(setSchedules)
      .catch(() => setSchedules({}));
  }, [user]);

  useEffect(() => {
    getCurrentSeason2User()
      .then(currentUser => {
        setUser(currentUser);
        if (currentUser?.playerId) {
          setSelectedPlayerId(currentUser.playerId);
          window.localStorage.setItem(storageKey, currentUser.playerId);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setAuthStatus("ready"));
  }, []);

  const selectedPlayer = season2Players.find(player => player.id === selectedPlayerId) ?? season2Players[0];
  const playerData = useMemo(() => getPlayerCabinetData(selectedPlayer), [selectedPlayer]);

  const handleLogin = (nextUser: Season2User) => {
    setUser(nextUser);
    setSelectedPlayerId(nextUser.playerId);
    window.localStorage.setItem(storageKey, nextUser.playerId);
  };

  const handleLogout = async () => {
    await logoutSeason2User();
    setUser(null);
  };

  return (
    <>
      <div className="min-h-[100svh] bg-[#111111] text-[#f7f7f2] lg:hidden">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111111]/95 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">BPL Cabinet</div>
              <h1 className="mt-1 font-heading text-[1.9rem] leading-none">Season 2</h1>
            </div>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 text-[0.78rem] font-bold text-white"
              >
                <span className="max-w-[110px] truncate">{selectedPlayer.name} · {selectedPlayer.nick}</span>
                <LogOut className="h-4 w-4 text-[#ff5a1f]" />
              </button>
            )}
          </div>
        </header>

        <main className="px-4 pb-28 pt-4">
          {authStatus === "loading" && <EmptyState text="Перевіряємо сесію..." />}
          {authStatus === "ready" && !user && <LoginPanel onLogin={handleLogin} />}
          {authStatus === "ready" && user && (
            <>
              {activeTab === "home" && (
                <HomeTab
                  player={selectedPlayer}
                  data={playerData}
                  schedules={schedules}
                  onScheduleUpdate={schedule => setSchedules(current => ({ ...current, [schedule.matchId]: schedule }))}
                />
              )}
              {activeTab === "matches" && <MatchesTab data={playerData} />}
              {activeTab === "predictions" && <PredictionsTab player={selectedPlayer} user={user} onUserUpdate={setUser} />}
              {activeTab === "table" && <TableTab data={playerData} />}
              {activeTab === "profile" && <ProfileTab player={selectedPlayer} user={user} onLogout={handleLogout} />}
            </>
          )}
        </main>

        {user && <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111111]/96 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          <div className="grid grid-cols-5 gap-1">
            <TabButton active={activeTab === "home"} icon={House} label="Головна" onClick={() => setActiveTab("home")} />
            <TabButton active={activeTab === "matches"} icon={CalendarDays} label="Матчі" onClick={() => setActiveTab("matches")} />
            <TabButton active={activeTab === "predictions"} icon={Trophy} label="Прогнози" onClick={() => setActiveTab("predictions")} />
            <TabButton active={activeTab === "table"} icon={Table2} label="Таблиця" onClick={() => setActiveTab("table")} />
            <TabButton active={activeTab === "profile"} icon={UserRound} label="Профіль" onClick={() => setActiveTab("profile")} />
          </div>
        </nav>}
      </div>

      <div className="hidden min-h-screen items-center justify-center bg-[#f7f7f2] p-8 text-center text-[#111111] lg:flex">
        <div className="max-w-sm rounded-md border border-[#111111]/12 bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#bbf903]">
            <UserRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-4xl leading-none">Мобільний кабінет</h1>
          <p className="mt-3 text-sm leading-6 text-[#111111]/62">
            Кабінет задуманий як застосунок для телефону. Відкрий цю сторінку з мобільного і додай на початковий екран.
          </p>
        </div>
      </div>
    </>
  );
}

function HomeTab({
  player,
  data,
  schedules,
  onScheduleUpdate,
}: {
  player: Season2Player;
  data: PlayerCabinetData;
  schedules: Record<string, Season2MatchSchedule>;
  onScheduleUpdate: (schedule: Season2MatchSchedule) => void;
}) {
  const primaryMatch = data.weekendMatches[0] ?? data.upcomingMatches[0] ?? data.recentMatches[0] ?? null;

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-white/10 bg-[#1e1e1e] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[1.5rem] font-extrabold leading-tight text-white">{player.name}</div>
            <p className="mt-1 truncate text-[1.05rem] text-white/60">{player.club}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CompactMetric label="Місце" value={`#${data.rank}`} />
            <CompactMetric label="Очки" value={data.standing.points} accent />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-white/10 bg-[#1e1e1e]">
        <div className="grid grid-cols-4">
          <HeroMetric label="І" value={data.standing.played} />
          <HeroMetric label="РГ" value={data.standing.goalDifference > 0 ? `+${data.standing.goalDifference}` : data.standing.goalDifference} />
          <HeroMetric label="ЗГ" value={data.standing.goalsFor} />
          <HeroMetric label="ПГ" value={data.standing.goalsAgainst} />
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-[#1e1e1e] p-4">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Форма</div>
        <div className="mt-4 flex gap-2">
          {getFormValues(data.standing.form).map((value, index) => (
            <span key={`${value}-${index}`} className={formClass(value)}>{value}</span>
          ))}
        </div>
      </section>

      <MobileSection
        title={data.weekendMatches.length ? "Твій вікенд" : primaryMatch && !isSeason2Played(primaryMatch) ? "Твій матч" : primaryMatch ? "Останній матч" : "Очікуємо календар"}
        icon={CalendarDays}
      >
        {data.weekendMatches.length ? (
          <div className="space-y-3">
            {data.weekendMatches.map(match => (
              <WeekendOpponentCard
                key={match.id}
                match={match}
                playerId={player.id}
                standings={data.standings}
                schedule={schedules[match.id]}
                schedules={schedules}
                onScheduleUpdate={onScheduleUpdate}
              />
            ))}
          </div>
        ) : primaryMatch ? <MobileMatchCard match={primaryMatch} playerId={player.id} /> : (
          <EmptyState text="Матчі ще не знайдені." />
        )}
      </MobileSection>
    </div>
  );
}

function CompactMetric({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`min-w-14 rounded-md px-2 py-1.5 text-center ${accent ? "bg-[#bbf903] text-[#111111]" : "bg-white/10 text-white"}`}>
      <div className="text-[0.55rem] font-extrabold uppercase tracking-wide opacity-55">{label}</div>
      <div className="mt-0.5 font-heading text-[1.35rem] leading-none">{value}</div>
    </div>
  );
}

function LoginPanel({ onLogin }: { onLogin: (user: Season2User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const nextUser = await loginSeason2User(username, password);
      if (!nextUser) throw new Error("Не вдалося увійти.");
      onLogin(nextUser);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Не вдалося увійти.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-white/10 bg-white/[0.06] p-4">
      <div>
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Особистий кабінет</div>
        <h2 className="mt-1 font-heading text-[2.1rem] leading-none text-white">Вхід</h2>
        <p className="mt-2 text-sm leading-6 text-white/56">Логін — твій нік у FC 26.</p>
      </div>

      <label className="block">
        <span className="text-[0.66rem] font-extrabold uppercase tracking-wide text-white/42">Нік у FC 26</span>
        <input
          value={username}
          onChange={event => setUsername(event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-white/12 bg-[#111111] px-3 text-base font-bold text-white outline-none focus:border-[#bbf903]"
          autoComplete="username"
        />
      </label>

      <label className="block">
        <span className="text-[0.66rem] font-extrabold uppercase tracking-wide text-white/42">Пароль</span>
        <input
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-white/12 bg-[#111111] px-3 text-base font-bold text-white outline-none focus:border-[#bbf903]"
          autoComplete="current-password"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-md bg-[#bbf903] text-sm font-extrabold text-[#111111] disabled:opacity-60"
      >
        {isSubmitting ? "Заходимо..." : "Увійти"}
      </button>

      {error && <div className="rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 p-3 text-sm font-bold text-[#ff5a1f]">{error}</div>}
    </form>
  );
}

function MatchesTab({ data }: { data: PlayerCabinetData }) {
  return (
    <div className="space-y-5">
      <MobileSection title="Мої найближчі" icon={CalendarDays}>
        {data.upcomingMatches.length ? data.upcomingMatches.map(match => (
          <MobileMatchCard key={match.id} match={match} playerId={data.standing.player.id} />
        )) : <EmptyState text="Майбутніх матчів немає." />}
      </MobileSection>

      <MobileSection title="Останні результати" icon={ListChecks}>
        {data.recentMatches.length ? data.recentMatches.map(match => (
          <MobileMatchCard key={match.id} match={match} playerId={data.standing.player.id} />
        )) : <EmptyState text="Зіграних матчів ще немає." />}
      </MobileSection>
    </div>
  );
}

function PredictionsTab({
  player,
  user,
  onUserUpdate,
}: {
  player: Season2Player;
  user: Season2User;
  onUserUpdate: (user: Season2User) => void;
}) {
  const predictionRounds = getSeason2PredictionWeekend();
  const [savedAt, setSavedAt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [predictions, setPredictions] = useState<Record<string, Season2SavedPrediction>>(() => user.predictions);
  const [leaderboard, setLeaderboard] = useState<Season2PredictionLeaderboardRow[]>([]);

  useEffect(() => {
    setPredictions(user.predictions);
    setSavedAt("");
    setStatusMessage("");
  }, [user.predictions]);

  useEffect(() => {
    loadSeason2PredictionLeaderboard()
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]));
  }, [user.predictions]);

  const updatePrediction = (matchId: string, side: keyof Season2SavedPrediction, value: string) => {
    if (predictions[matchId]?.locked) return;

    const normalized = value.replace(/[^\d]/g, "").slice(0, 2);
    setPredictions(current => ({
      ...current,
      [matchId]: {
        homeScore: current[matchId]?.homeScore ?? "",
        awayScore: current[matchId]?.awayScore ?? "",
        [side]: normalized,
      },
    }));
  };

  if (!predictionRounds.length) {
    return (
      <MobileSection title="Прогнози" icon={Trophy}>
        <EmptyState text="Зараз немає відкритого туру для прогнозів." />
      </MobileSection>
    );
  }

  const availableMatches = predictionRounds
    .flatMap(round => round.matches)
    .filter(match => !isSeason2Played(match) && !hasPlayer(match, player.id));
  const pendingMatches = availableMatches.filter(match => !predictions[match.id]?.locked);
  const filledCount = availableMatches.filter(match =>
    predictions[match.id]?.homeScore !== undefined &&
    predictions[match.id]?.homeScore !== "" &&
    predictions[match.id]?.awayScore !== undefined &&
    predictions[match.id]?.awayScore !== "",
  ).length;
  const pendingFilledCount = pendingMatches.filter(match =>
    predictions[match.id]?.homeScore !== undefined &&
    predictions[match.id]?.homeScore !== "" &&
    predictions[match.id]?.awayScore !== undefined &&
    predictions[match.id]?.awayScore !== "",
  ).length;
  const isComplete = pendingMatches.length > 0 && pendingFilledCount === pendingMatches.length;
  const isLocked = pendingMatches.length === 0 && availableMatches.length > 0;
  const totalPredictionPoints = Object.values(user.predictions).reduce((sum, prediction) => sum + (prediction.points ?? 0), 0);

  const savePredictions = async () => {
    if (isLocked || isSaving) return;
    if (!isComplete) {
      setStatusMessage("Заповни всі матчі туру перед збереженням.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    try {
      const updatedUser = await saveSeason2RoundPredictions({
        round: predictionRounds[0].round,
        predictions: pendingMatches.map(match => ({
          matchId: match.id,
          round: match.round,
          homePlayerId: match.home.id,
          awayPlayerId: match.away.id,
          predictedHomeScore: Number(predictions[match.id]?.homeScore),
          predictedAwayScore: Number(predictions[match.id]?.awayScore),
        })),
      });

      if (updatedUser) {
        onUserUpdate(updatedUser);
        setPredictions(updatedUser.predictions);
        loadSeason2PredictionLeaderboard()
          .then(setLeaderboard)
          .catch(() => setLeaderboard([]));
      }
      setSavedAt(new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Не вдалося зберегти прогнози.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[#bbf903]/35 bg-[#bbf903]/10 p-4">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Season 2 Predict</div>
        <h2 className="mt-1 font-heading text-[1.75rem] leading-none text-white">
          {getPredictionWeekendTitle(predictionRounds)}
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/58">
          Став рахунок на два тури вихідних. Свої матчі у прогнозах не показуємо.
        </p>
        <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.06] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wide text-white/42">Заповнено</span>
          <span className="font-heading text-xl leading-none text-[#ff5a1f]">{filledCount}/{availableMatches.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-md border border-[#ff5a1f]/25 bg-[#ff5a1f]/10 px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wide text-white/42">Очки прогнозів</span>
          <span className="font-heading text-xl leading-none text-[#bbf903]">{totalPredictionPoints}</span>
        </div>
        <p className="mt-3 text-xs font-bold leading-5 text-white/48">
          Точний рахунок — 10, правильний результат — 5, мимо — 0.
        </p>
      </section>

      <MobileSection title="Матчі вікенду" icon={CalendarDays}>
        <div className="space-y-3">
          {availableMatches.length ? predictionRounds.map(round => {
            const roundMatches = availableMatches.filter(match => match.round === round.round);
            if (!roundMatches.length) return null;

            return (
              <div key={round.round} className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
                  <span className="font-heading text-lg leading-none text-white">Тур {round.round}</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-white/42">{round.dayLabel}</span>
                </div>
                {roundMatches.map(match => (
                  <PredictionCard
                    key={match.id}
                    match={match}
                    value={predictions[match.id] ?? { homeScore: "", awayScore: "" }}
                    onChange={(side, value) => updatePrediction(match.id, side, value)}
                    locked={Boolean(predictions[match.id]?.locked)}
                  />
                ))}
              </div>
            );
          }) : <EmptyState text="У цьому вікенді немає матчів для твого прогнозу." />}
        </div>
        <button
          type="button"
          onClick={savePredictions}
          disabled={isLocked || isSaving || !availableMatches.length}
          className={`mt-4 h-12 w-full rounded-md text-sm font-extrabold ${
            isLocked
              ? "border border-[#bbf903]/35 bg-[#bbf903]/10 text-[#bbf903]"
              : "bg-[#bbf903] text-[#111111]"
          }`}
        >
          {isLocked ? "Прогнози зафіксовано" : isSaving ? "Зберігаємо..." : "Зберегти прогнози"}
        </button>
        {savedAt && <div className="mt-3 text-center text-xs font-bold text-[#bbf903]">Збережено о {savedAt}. Змінити вже не можна.</div>}
        {statusMessage && <div className="mt-3 rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 p-3 text-xs font-bold text-[#ff5a1f]">{statusMessage}</div>}
      </MobileSection>

      <PredictionLeaderboard rows={leaderboard} currentPlayerId={player.id} />
    </div>
  );
}

function PredictionLeaderboard({ rows, currentPlayerId }: { rows: Season2PredictionLeaderboardRow[]; currentPlayerId: string }) {
  return (
    <MobileSection title="Таблиця прогнозів" icon={Trophy}>
      <div className="mb-3 grid grid-cols-[34px_minmax(0,1fr)_52px_42px_42px] gap-2 px-2 text-[0.62rem] font-extrabold uppercase tracking-wide text-white/36">
        <span>#</span>
        <span>Гравець</span>
        <span className="text-right">Очки</span>
        <span className="text-right">Точні</span>
        <span className="text-right">Рез.</span>
      </div>
      <div className="space-y-2">
        {rows.length ? rows.map((row, index) => {
          const player = season2Players.find(item => item.id === row.playerId);
          const isCurrent = row.playerId === currentPlayerId;

          return (
            <div
              key={row.playerId}
              className={`grid grid-cols-[34px_minmax(0,1fr)_52px_42px_42px] items-center gap-2 rounded-md border px-2 py-3 ${
                isCurrent
                  ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
                  : "border-white/10 bg-white/[0.045] text-white"
              }`}
            >
              <div className="font-heading text-lg leading-none">#{index + 1}</div>
              <div className="min-w-0">
                <div className="truncate text-[0.92rem] font-extrabold leading-tight">{player?.name ?? row.displayName}</div>
                <div className={isCurrent ? "truncate text-[0.66rem] font-bold text-[#111111]/55" : "truncate text-[0.66rem] font-bold text-white/38"}>
                  {row.predictions} прогнозів
                </div>
              </div>
              <div className="text-right font-heading text-lg leading-none">{row.points}</div>
              <div className={`text-right text-sm font-extrabold ${isCurrent ? "text-[#111111]" : "text-[#bbf903]"}`}>{row.exact}</div>
              <div className={`text-right text-sm font-extrabold ${isCurrent ? "text-[#111111]" : "text-[#ff5a1f]"}`}>{row.correctResult}</div>
            </div>
          );
        }) : <EmptyState text="Таблиця зʼявиться після перших прогнозів." />}
      </div>
    </MobileSection>
  );
}

function TableTab({ data }: { data: PlayerCabinetData }) {
  return (
    <div className="space-y-4">
      <MobileSection title="Турнірна таблиця" icon={Table2}>
        <div className="space-y-2">
          {data.tableRows.map(row => (
            <div
              key={row.player.id}
              className={`grid grid-cols-[30px_minmax(0,1fr)_30px_30px_30px_34px_36px] items-center gap-1.5 rounded-md border px-2 py-3 ${
                row.player.id === data.standing.player.id
                  ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
                  : "border-white/10 bg-white/[0.06] text-white"
              }`}
            >
              <div className="font-heading text-lg leading-none">#{row.rank}</div>
              <div className="min-w-0">
                <div className="truncate text-[0.95rem] font-extrabold leading-tight">{row.player.name}</div>
                <div className={row.player.id === data.standing.player.id ? "truncate text-xs text-[#111111]/58" : "truncate text-xs text-white/48"}>
                  {row.player.club}
                </div>
              </div>
              <div className="text-center">
                <div className="font-heading text-base leading-none">{row.played}</div>
                <div className="mt-1 text-[0.55rem] font-extrabold uppercase opacity-45">І</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-base leading-none">{row.goalsFor}</div>
                <div className="mt-1 text-[0.55rem] font-extrabold uppercase opacity-45">ЗГ</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-base leading-none">{row.goalsAgainst}</div>
                <div className="mt-1 text-[0.55rem] font-extrabold uppercase opacity-45">ПГ</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-base leading-none">{row.goalDifference}</div>
                <div className="mt-1 text-[0.55rem] font-extrabold uppercase opacity-45">РГ</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-lg leading-none">{row.points}</div>
                <div className="mt-1 text-[0.55rem] font-extrabold uppercase opacity-45">О</div>
              </div>
            </div>
          ))}
        </div>
      </MobileSection>
    </div>
  );
}

function ProfileTab({
  player,
  user,
  onLogout,
}: {
  player: Season2Player;
  user: Season2User;
  onLogout: () => void;
}) {
  const [pushStatus, setPushStatus] = useState<Season2PushStatus | null>(null);
  const [pushMessage, setPushMessage] = useState("");
  const [isPushLoading, setIsPushLoading] = useState(false);

  useEffect(() => {
    getSeason2PushStatus()
      .then(setPushStatus)
      .catch(error => setPushStatus({
        supported: false,
        permission: "unsupported",
        enabled: false,
        message: error instanceof Error ? error.message : "Push поки недоступний.",
      }));
  }, []);

  const handleEnablePush = async () => {
    setIsPushLoading(true);
    setPushMessage("");

    try {
      const nextStatus = await enableSeason2Push();
      setPushStatus(nextStatus);
      setPushMessage("Push увімкнено. Тепер можна надсилати сповіщення на цей пристрій.");
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : "Не вдалося увімкнути push.");
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    setIsPushLoading(true);
    setPushMessage("");

    try {
      await sendSeason2TestPush();
      setPushMessage("Тестовий push відправлено.");
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : "Не вдалося відправити тестовий push.");
    } finally {
      setIsPushLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-white/10 bg-white/[0.06] p-4 text-white">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Обліковий запис</div>
        <h2 className="mt-1 font-heading text-[2.65rem] leading-none">{player.name}</h2>
        <p className="mt-1 truncate text-sm text-white/48">{player.club}</p>
        <div className="mt-4 rounded-md border border-[#ff5a1f]/30 bg-[#ff5a1f]/10 p-3">
          <div className="text-[0.66rem] font-bold uppercase tracking-wide text-white/42">Логін</div>
          <div className="mt-1 text-lg font-extrabold text-[#ff5a1f]">{user.username}</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ProfileField label="Команда" value={player.club} />
          <ProfileField label="Платформа" value={player.platform ?? "-"} />
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center gap-2 text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">
          <Bell className="h-4 w-4" />
          Push
        </div>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {pushStatus?.message ?? "Перевіряємо можливість push на цьому пристрої..."}
        </p>
        {pushStatus?.permission === "denied" && (
          <p className="mt-2 rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 p-3 text-xs font-bold text-[#ff5a1f]">
            Push заблоковано у браузері. Дозвіл треба повернути в налаштуваннях сайту.
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={handleEnablePush}
            disabled={!pushStatus?.supported || pushStatus.enabled || isPushLoading}
            className="h-11 rounded-md bg-[#bbf903] px-4 text-sm font-extrabold text-[#111111] disabled:opacity-45"
          >
            {pushStatus?.enabled ? "Push увімкнено" : isPushLoading ? "Працюємо..." : "Увімкнути push"}
          </button>
          <button
            type="button"
            onClick={handleTestPush}
            disabled={!pushStatus?.enabled || isPushLoading}
            className="h-11 rounded-md border border-[#ff5a1f]/40 bg-[#ff5a1f]/10 px-4 text-sm font-extrabold text-[#ff5a1f] disabled:opacity-45"
          >
            Надіслати тест
          </button>
        </div>
        {pushMessage && <p className="mt-3 text-xs font-bold leading-5 text-white/64">{pushMessage}</p>}
      </section>

      <button
        type="button"
        onClick={onLogout}
        className="h-12 w-full rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 text-sm font-extrabold text-[#ff5a1f]"
      >
        Вийти
      </button>
    </div>
  );
}

type PlayerCabinetData = ReturnType<typeof getPlayerCabinetData>;

function getPlayerCabinetData(player: Season2Player) {
  const standings = calculateSeason2Standings();
  const standing = standings.find(row => row.player.id === player.id) ?? standings[0];
  const rank = standings.findIndex(row => row.player.id === player.id) + 1;
  const allMatches = season2Rounds.flatMap(round => round.matches).filter(match => hasPlayer(match, player.id));
  const tableRows = getRankedRows(standings);
  const upcomingMatches = allMatches.filter(match => !isSeason2Played(match));
  const weekendIndex = getSeason2CabinetWeekendIndex();
  const weekendMatches = allMatches.filter(match => Math.floor((match.round - 1) / 2) === weekendIndex);

  return {
    standings,
    standing,
    rank: rank || 1,
    weekendMatches: weekendMatches.length ? weekendMatches.slice(0, 2) : upcomingMatches.slice(0, 2),
    upcomingMatches: upcomingMatches.slice(0, 5),
    recentMatches: allMatches.filter(isSeason2Played).reverse().slice(0, 5),
    tableRows,
  };
}

function getRankedRows(standings: Season2Standing[]) {
  return standings.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));
}

function hasPlayer(match: Season2Match, playerId: string) {
  return match.home.id === playerId || match.away.id === playerId;
}

function getSeason2PredictionWeekend() {
  const weekendIndex = getSeason2CabinetWeekendIndex();
  const calendarRounds = getSeason2WeekendRounds(weekendIndex).filter(round =>
    round.matches.some(match => !isSeason2Played(match)),
  );
  if (calendarRounds.length) return calendarRounds;

  const firstOpenRound = season2Rounds.find(round => round.matches.some(match => !isSeason2Played(match)));
  return firstOpenRound ? getSeason2WeekendRounds(Math.floor((firstOpenRound.round - 1) / 2)) : [];
}

function getSeason2WeekendRounds(weekendIndex: number) {
  return season2Rounds.filter(round => Math.floor((round.round - 1) / 2) === weekendIndex);
}

function getSeason2CabinetWeekendIndex(now = new Date()) {
  const currentDate = getKyivDateOnly(now);
  const weekendIndex = season2Rounds.findIndex((round, index) =>
    index % 2 === 0 &&
    getKyivDateOnly(new Date(`${season2Rounds[index + 1]?.date ?? round.date}T23:59:59+03:00`)) >= currentDate,
  );

  if (weekendIndex === -1) {
    return Math.max(0, Math.floor((season2Rounds.at(-1)?.round ?? 1) - 1) / 2);
  }

  return Math.floor(season2Rounds[weekendIndex].round - 1) / 2;
}

function getKyivDateOnly(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function getPredictionWeekendTitle(rounds: Season2Round[]) {
  if (rounds.length === 1) return `Тур ${rounds[0].round}`;
  return `Тури ${rounds.map(round => round.round).join(" та ")}`;
}

function PredictionCard({
  match,
  value,
  onChange,
  locked,
}: {
  match: Season2Match;
  value: Season2SavedPrediction;
  onChange: (side: keyof Season2SavedPrediction, value: string) => void;
  locked: boolean;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">
          Матч {match.id.split("-").at(-1)}
        </div>
        <div className="flex items-center gap-2">
          {locked && (
            <span className="rounded-md border border-[#bbf903]/25 bg-[#bbf903]/10 px-2 py-1 text-[0.66rem] font-extrabold text-[#bbf903]">
              {value.points ?? 0} оч.
            </span>
          )}
          <div className="text-xs text-white/42">{match.dayLabel}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PredictionTeam player={match.home} />
        <div className="grid grid-cols-[44px_auto_44px] items-center gap-2">
          <PredictionInput
            value={value.homeScore}
            label={`${match.home.name} голи`}
            onChange={nextValue => onChange("homeScore", nextValue)}
            disabled={locked}
          />
          <span className="font-heading text-xl leading-none text-[#ff5a1f]">:</span>
          <PredictionInput
            value={value.awayScore}
            label={`${match.away.name} голи`}
            onChange={nextValue => onChange("awayScore", nextValue)}
            disabled={locked}
          />
        </div>
        <PredictionTeam player={match.away} align="right" />
      </div>
    </article>
  );
}

function PredictionTeam({ player, align = "left" }: { player: Season2Player; align?: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-[0.92rem] font-extrabold leading-tight text-white">{player.name}</div>
      <div className="mt-0.5 truncate text-[0.7rem] text-white/45">{player.club}</div>
    </div>
  );
}

function PredictionInput({
  value,
  label,
  onChange,
  disabled,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <input
      inputMode="numeric"
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
      className="h-11 w-11 rounded-md border border-white/12 bg-[#111111] text-center font-heading text-xl leading-none text-[#bbf903] outline-none focus:border-[#bbf903] disabled:opacity-55"
      placeholder="-"
    />
  );
}

function WeekendOpponentCard({
  match,
  playerId,
  standings,
  schedule,
  schedules,
  onScheduleUpdate,
}: {
  match: Season2Match;
  playerId: string;
  standings: Season2Standing[];
  schedule?: Season2MatchSchedule;
  schedules: Record<string, Season2MatchSchedule>;
  onScheduleUpdate: (schedule: Season2MatchSchedule) => void;
}) {
  const opponent = match.home.id === playerId ? match.away : match.home;
  const opponentStanding = standings.find(row => row.player.id === opponent.id);
  const opponentRank = standings.findIndex(row => row.player.id === opponent.id) + 1;
  const [time, setTime] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState(() => getDefaultRescheduleDate(match.date));
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const playerSide = match.home.id === playerId ? "home" : "away";
  const opponentProposedTime = playerSide === "home" ? schedule?.awayProposedTime : schedule?.homeProposedTime;
  const ownProposedTime = playerSide === "home" ? schedule?.homeProposedTime : schedule?.awayProposedTime;
  const opponentProposedDate = playerSide === "home" ? schedule?.awayProposedDate : schedule?.homeProposedDate;
  const ownProposedDate = playerSide === "home" ? schedule?.homeProposedDate : schedule?.awayProposedDate;
  const effectiveDate = schedule?.agreedDate ?? match.date;
  const bookedTimes = getBookedTimesForDate(schedules, match.id, effectiveDate);
  const rescheduleDateOptions = getRescheduleDateOptions(match.date);
  const badge = getScheduleBadge(schedule);

  const saveAction = async (input: Parameters<typeof saveSeason2MatchSchedule>[0]) => {
    setIsSaving(true);
    setMessage("");

    try {
      const nextSchedule = await saveSeason2MatchSchedule(input);
      onScheduleUpdate(nextSchedule);
      setTime("");
      if (nextSchedule.agreedDate) setRescheduleDate(nextSchedule.agreedDate);
      setMessage(nextSchedule.status === "scheduled" ? "Час погоджено. Push пішов усім." : "Збережено.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не вдалося зберегти домовленість.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-md border border-white/10 bg-[#1e1e1e]">
      <div className="p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">
            Тур {match.round} · {getSeason2LegLabel(match.leg)}
          </div>
          <div className="mt-1 text-xs text-white/45">{match.dayLabel}</div>
          {schedule?.agreedDate && (
            <div className="mt-1 text-xs font-bold text-[#bbf903]">Новий день: {formatCabinetDate(schedule.agreedDate)}</div>
          )}
        </div>
        <span className={`inline-flex min-w-[5.75rem] items-center justify-center rounded-lg border px-2.5 py-1.5 text-[0.65rem] font-extrabold uppercase ${getCabinetScheduleStatusClass(schedule)}`}>
          {badge ?? "Без часу"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="text-[0.64rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Наступний суперник</div>
          <h3 className="mt-1 truncate text-[1.55rem] font-extrabold leading-tight text-white">{opponent.name}</h3>
          <p className="truncate text-[0.95rem] text-white/56">{opponent.club}</p>
          <p className="mt-1 truncate text-[0.72rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">FC 26 · {opponent.nick}</p>
        </div>
        <div className="rounded-md bg-[#bbf903] px-3 py-2 text-center text-[#111111]">
          <div className="text-[0.56rem] font-extrabold uppercase tracking-wide opacity-60">Місце</div>
          <div className="font-heading text-[1.55rem] leading-none">#{opponentRank || "-"}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <OpponentStat label="О" value={opponentStanding?.points ?? 0} />
        <OpponentStat label="Форма" value={getFormValues(opponentStanding?.form ?? []).join(" ") || "-"} />
        <OpponentStat label="ЗГ" value={opponentStanding?.goalsFor ?? 0} />
        <OpponentStat label="ПГ" value={opponentStanding?.goalsAgainst ?? 0} />
      </div>
      </div>

      {!isSeason2Played(match) && (
        <div className="space-y-2 border-t border-white/10 bg-[#111111] p-3">
          <div className="flex items-center gap-2 text-[0.64rem] font-extrabold uppercase tracking-wide text-white/40">
            <Clock3 className="h-3.5 w-3.5 text-[#ff5a1f]" />
            Узгодження часу
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => saveAction({ match, action: "day-status", dayStatus: "available" })}
              className="h-10 rounded-md bg-[#bbf903] text-[0.72rem] font-extrabold text-[#111111] disabled:opacity-50"
            >
              День ок
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setMessage("Обери новий день нижче і натисни «Запропонувати день».")}
              className="h-10 rounded-md border border-[#ff5a1f]/40 bg-[#ff5a1f]/10 text-[0.72rem] font-extrabold text-[#ff5a1f] disabled:opacity-50"
            >
              Перенести
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {rescheduleDateOptions.map(option => (
              <button
                type="button"
                key={option.date}
                disabled={isSaving}
                onClick={() => setRescheduleDate(option.date)}
                className={`h-9 rounded-md border px-1 text-[0.58rem] font-extrabold uppercase leading-tight disabled:opacity-50 ${
                  rescheduleDate === option.date
                    ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
                    : "border-white/10 bg-white/[0.05] text-white/60"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={rescheduleDate}
              min={getMinRescheduleDate(match.date)}
              onChange={event => setRescheduleDate(event.target.value)}
              className="h-10 min-w-0 rounded-md border border-white/20 bg-[#111111] px-3 text-center text-xs font-extrabold text-white outline-none focus:border-[#bbf903]"
            />
            <button
              type="button"
              disabled={isSaving || !rescheduleDate}
              onClick={() => saveAction({ match, action: "propose-date", date: rescheduleDate })}
              className="h-10 rounded-md border border-[#ff5a1f]/40 bg-[#ff5a1f]/10 px-2 text-[0.72rem] font-extrabold text-[#ff5a1f] disabled:opacity-50"
            >
              Запропонувати день
            </button>
          </div>

          {(opponentProposedDate || ownProposedDate) && (
            <div className="text-xs font-bold leading-5 text-white/58">
              {opponentProposedDate && opponentProposedDate !== schedule?.agreedDate ? `Суперник пропонує ${formatCabinetDate(opponentProposedDate)}. ` : ""}
              {ownProposedDate && ownProposedDate !== schedule?.agreedDate ? `Твій варіант ${formatCabinetDate(ownProposedDate)}.` : ""}
            </div>
          )}

          {opponentProposedDate && opponentProposedDate !== schedule?.agreedDate && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => saveAction({ match, action: "accept-date", date: opponentProposedDate })}
              className="h-10 w-full rounded-md border border-[#bbf903] bg-[#bbf903]/10 text-[0.72rem] font-extrabold text-[#bbf903] disabled:opacity-50"
            >
              Погодити день {formatCabinetDate(opponentProposedDate)}
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <select
              value={time}
              onChange={event => setTime(event.target.value)}
              className="h-10 min-w-0 rounded-md border border-white/20 bg-[#111111] px-3 text-center text-sm font-extrabold text-white outline-none focus:border-[#bbf903]"
            >
              <option value="">Обери час</option>
              {season2TimeSlots.map(slot => (
                <option key={slot} value={slot} disabled={bookedTimes.has(slot)}>
                  {slot}{bookedTimes.has(slot) ? " · зайнято" : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={isSaving || !time}
              onClick={() => saveAction({ match, action: "propose-time", time })}
              className="h-10 rounded-md bg-[#ff5a1f] px-2 text-[0.72rem] font-extrabold text-white disabled:bg-[#ff5a1f]/25 disabled:text-white/45"
            >
              Запропонувати
            </button>
          </div>

          {(opponentProposedTime || ownProposedTime) && (
            <div className="text-xs font-bold leading-5 text-white/58">
              {opponentProposedTime && opponentProposedTime !== schedule?.agreedTime ? `Суперник пропонує ${opponentProposedTime}. ` : ""}
              {ownProposedTime && ownProposedTime !== schedule?.agreedTime ? `Твоя пропозиція ${ownProposedTime}.` : ""}
            </div>
          )}

          {opponentProposedTime && opponentProposedTime !== schedule?.agreedTime && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => saveAction({ match, action: "accept-time", time: opponentProposedTime })}
              className="h-10 w-full rounded-md border border-[#bbf903] bg-[#bbf903]/10 text-[0.72rem] font-extrabold text-[#bbf903] disabled:opacity-50"
            >
              Погодити {opponentProposedTime}
            </button>
          )}

          {message && <div className="text-xs font-bold leading-5 text-white/62">{message}</div>}
        </div>
      )}
    </article>
  );
}

function OpponentStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-white/[0.06] px-2 py-2">
      <div className="text-[0.55rem] font-extrabold uppercase tracking-wide text-white/35">{label}</div>
      <div className="mt-1 truncate text-sm font-extrabold text-white">{value}</div>
    </div>
  );
}

const season2TimeSlots = Array.from({ length: 24 }, (_, index) => {
  const totalMinutes = 12 * 60 + index * 30;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

function getBookedTimesForDate(
  schedules: Record<string, Season2MatchSchedule>,
  currentMatchId: string,
  date: string,
) {
  const matchesById = new Map(season2Rounds.flatMap(round => round.matches).map(item => [item.id, item]));
  const bookedTimes = new Set<string>();

  Object.values(schedules).forEach(item => {
    if (item.matchId === currentMatchId || item.status !== "scheduled" || !item.agreedTime) return;
    const staticMatchDate = matchesById.get(item.matchId)?.date ?? "";
    const effectiveDate = item.agreedDate ?? staticMatchDate;
    if (effectiveDate === date) bookedTimes.add(item.agreedTime);
  });

  return bookedTimes;
}

function getDefaultRescheduleDate(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString().slice(0, 10);
}

function getMinRescheduleDate(date: string) {
  return getDefaultRescheduleDate(date);
}

function getRescheduleDateOptions(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return [];

  const candidates = [
    { date: addUtcDays(parsed, 1), label: "Наступний день" },
    { date: getNextUtcWeekday(parsed, 6), label: "Субота" },
    { date: getNextUtcWeekday(parsed, 0), label: "Неділя" },
  ];

  const seen = new Set<string>();
  return candidates.filter(candidate => {
    if (candidate.date <= date || seen.has(candidate.date)) return false;
    seen.add(candidate.date);
    return true;
  });
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function getNextUtcWeekday(date: Date, weekday: number) {
  const current = date.getUTCDay();
  const offset = ((weekday - current + 7) % 7) || 7;
  return addUtcDays(date, offset);
}

function formatCabinetDate(date: string) {
  const [, month, day] = date.split("-");
  return day && month ? `${day}.${month}` : date;
}

function MobileMatchCard({ match, playerId, featured = false }: { match: Season2Match; playerId: string; featured?: boolean }) {
  const played = isSeason2Played(match);
  const venueLabel = match.home.id === playerId ? "вдома" : "виїзд";

  return (
    <article className={featured ? "mt-4" : "mt-3 rounded-md border border-white/10 bg-white/[0.04] p-3"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">
            Тур {match.round} · {getSeason2LegLabel(match.leg)}
          </div>
          <div className="mt-1 text-xs text-white/45">{match.dayLabel} · {venueLabel}</div>
        </div>
        <span className={`rounded-md border px-2 py-1 text-[0.65rem] font-extrabold uppercase ${played ? "border-white/12 bg-white/12 text-white" : "border-[#bbf903] bg-[#bbf903] text-[#111111]"}`}>
          {played ? "Зіграно" : "Скоро"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock player={match.home} align="left" />
        <div className="rounded-md bg-[#ff5a1f]/16 px-3 py-2 text-center font-heading text-xl leading-none text-[#ff5a1f]">
          {played ? `${match.homeScore}:${match.awayScore}` : "VS"}
        </div>
        <TeamBlock player={match.away} align="right" />
      </div>
    </article>
  );
}

function TeamBlock({ player, align }: { player: Season2Player; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-[0.98rem] font-extrabold leading-tight">{player.name}</div>
      <div className="mt-0.5 truncate text-xs text-white/50">{player.club}</div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-r border-white/10 p-3 text-center text-white last:border-r-0">
      <div className="text-[0.58rem] font-extrabold uppercase tracking-wide text-white/38">{label}</div>
      <div className="mt-2 font-heading text-[1.45rem] leading-none text-[#ff5a1f]">{value}</div>
    </div>
  );
}

function MobileSection({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-[1.65rem] leading-none">{title}</h2>
        <Icon className="h-5 w-5 text-[#bbf903]" />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.05] p-3">
      <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-white/38">{label}</div>
      <div className="mt-1 truncate text-sm font-extrabold text-white">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="mt-3 rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-white/58">{text}</div>;
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof House; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[0.66rem] font-extrabold ${
        active ? "bg-[#bbf903] text-[#111111]" : "text-white/58"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function getFormValues(form: Array<"W" | "D" | "L">) {
  return form.length ? form : Array.from({ length: 5 }, () => "-");
}

function formClass(value: "W" | "D" | "L" | "-") {
  const color = value === "W"
    ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
    : value === "D"
      ? "border-white/22 bg-white/14 text-white"
      : value === "L"
        ? "border-[#ff5a1f] bg-[#ff5a1f] text-white"
        : "border-white/12 bg-transparent text-white/30";

  return `inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-extrabold ${color}`;
}

function getCabinetScheduleStatusClass(schedule?: Season2MatchSchedule) {
  if (schedule?.status === "scheduled") return "border-[#92c900] bg-[#bbf903] text-[#111111]";
  if (schedule?.status === "negotiating") return "border-[#f4d35e] bg-[#c9a7ff] text-[#111111]";
  if (schedule?.status === "day_confirmed") return "border-[#f4d35e] bg-[#ffe76a] text-[#111111]";
  if (schedule?.status === "postponed") return "border-[#d94716] bg-[#ff5a1f] text-[#111111]";
  return "border-[#18bfd0] bg-[#2af2ff] text-[#111111]";
}
