import { Bell, CalendarDays, House, ListChecks, LogOut, Radio, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  getSeason2LegLabel,
  isSeason2Played,
  season2Rounds,
  type Season2Match,
  type Season2Round,
} from "@/data/season2Data";
import {
  getCurrentSeason2User,
  loadSeason2PredictionLeaderboard,
  loginSeason2User,
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
import { getScheduleBadge, loadSeason2MatchSchedules, type Season2MatchSchedule } from "@/lib/season2Scheduling";

type FanTab = "home" | "predictions" | "rating" | "profile";

export default function Season2FanCabinet() {
  const [activeTab, setActiveTab] = useState<FanTab>("home");
  const [authStatus, setAuthStatus] = useState<"loading" | "ready">("loading");
  const [user, setUser] = useState<Season2User | null>(null);
  const [schedules, setSchedules] = useState<Record<string, Season2MatchSchedule>>({});

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
      if (themeMeta && previousTheme) themeMeta.setAttribute("content", previousTheme);
    };
  }, []);

  useEffect(() => {
    getCurrentSeason2User()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthStatus("ready"));
  }, []);

  useEffect(() => {
    if (!user) return;

    loadSeason2MatchSchedules()
      .then(setSchedules)
      .catch(() => setSchedules({}));
  }, [user]);

  const displayName = user?.displayName ?? user?.username ?? "Фан";

  return (
    <>
      <div className="min-h-[100svh] bg-[#111111] text-[#f7f7f2] lg:hidden">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111111]/95 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">BPL Fan Zone</div>
              <h1 className="mt-1 font-heading text-[1.9rem] leading-none">Season 2</h1>
            </div>
            {user && (
              <button
                type="button"
                onClick={async () => {
                  await logoutSeason2User();
                  setUser(null);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 text-[0.78rem] font-bold text-white"
              >
                <span className="max-w-[120px] truncate">{displayName}</span>
                <LogOut className="h-4 w-4 text-[#ff5a1f]" />
              </button>
            )}
          </div>
        </header>

        <main className="px-4 pb-28 pt-4">
          {authStatus === "loading" && <EmptyState text="Перевіряємо сесію..." />}
          {authStatus === "ready" && !user && <FanLoginPanel onLogin={setUser} />}
          {authStatus === "ready" && user && (
            <>
              {activeTab === "home" && <FanHomeTab user={user} schedules={schedules} />}
              {activeTab === "predictions" && <FanPredictionsTab user={user} onUserUpdate={setUser} />}
              {activeTab === "rating" && <FanRatingTab currentUser={user} />}
              {activeTab === "profile" && <FanProfileTab user={user} onLogout={async () => {
                await logoutSeason2User();
                setUser(null);
              }} />}
            </>
          )}
        </main>

        {user && (
          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111111]/96 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
            <div className="grid grid-cols-4 gap-1">
              <FanTabButton active={activeTab === "home"} icon={House} label="Головна" onClick={() => setActiveTab("home")} />
              <FanTabButton active={activeTab === "predictions"} icon={Trophy} label="Прогнози" onClick={() => setActiveTab("predictions")} />
              <FanTabButton active={activeTab === "rating"} icon={ListChecks} label="Рейтинг" onClick={() => setActiveTab("rating")} />
              <FanTabButton active={activeTab === "profile"} icon={UserRound} label="Профіль" onClick={() => setActiveTab("profile")} />
            </div>
          </nav>
        )}
      </div>

      <div className="hidden min-h-screen items-center justify-center bg-[#f7f7f2] p-8 text-center text-[#111111] lg:flex">
        <div className="max-w-sm rounded-md border border-[#111111]/12 bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#bbf903]">
            <UserRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-heading text-4xl leading-none">Fan Zone</h1>
          <p className="mt-3 text-sm leading-6 text-[#111111]/62">
            Кабінет вболівальника зроблений як мобільний застосунок. Відкрий його з телефону і додай на початковий екран.
          </p>
        </div>
      </div>
    </>
  );
}

function FanHomeTab({ user, schedules }: { user: Season2User; schedules: Record<string, Season2MatchSchedule> }) {
  const upcomingMatches = useMemo(() => season2Rounds.flatMap(round => round.matches).filter(match => !isSeason2Played(match)).slice(0, 6), []);
  const playedMatches = useMemo(() => season2Rounds.flatMap(round => round.matches).filter(isSeason2Played).reverse().slice(0, 4), []);
  const points = Object.values(user.predictions).reduce((sum, prediction) => sum + (prediction.points ?? 0), 0);

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-[#bbf903]/35 bg-[#bbf903]/10 p-4">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Твій фан-акаунт</div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[1.65rem] font-extrabold leading-tight text-white">{user.displayName ?? user.username}</h2>
            <p className="mt-1 text-sm leading-5 text-white/55">Прогнози, ефіри і пуші ліги в одному місці.</p>
          </div>
          <div className="rounded-md bg-[#bbf903] px-3 py-2 text-center text-[#111111]">
            <div className="text-[0.56rem] font-extrabold uppercase tracking-wide opacity-60">Очки</div>
            <div className="font-heading text-[1.55rem] leading-none">{points}</div>
          </div>
        </div>
      </section>

      <FanSection title="Live центр" icon={Radio}>
        <a
          href="https://www.twitch.tv/bpl2026"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.05] p-4"
        >
          <div>
            <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">Основний канал</div>
            <div className="mt-1 text-xl font-extrabold text-white">twitch.tv/bpl2026</div>
          </div>
          <span className="rounded-md bg-[#bbf903] px-3 py-2 text-xs font-extrabold uppercase text-[#111111]">Відкрити</span>
        </a>
      </FanSection>

      <FanSection title="Найближчі матчі" icon={CalendarDays}>
        <div className="space-y-3">
          {upcomingMatches.map(match => <FanMatchCard key={match.id} match={match} schedule={schedules[match.id]} />)}
        </div>
      </FanSection>

      <FanSection title="Останні результати" icon={ListChecks}>
        <div className="space-y-3">
          {playedMatches.length ? playedMatches.map(match => <FanMatchCard key={match.id} match={match} />) : <EmptyState text="Результатів ще немає." />}
        </div>
      </FanSection>
    </div>
  );
}

function FanPredictionsTab({ user, onUserUpdate }: { user: Season2User; onUserUpdate: (user: Season2User) => void }) {
  const predictionRounds = getSeason2PredictionWeekend();
  const [view, setView] = useState<"open" | "history">("open");
  const [predictions, setPredictions] = useState<Record<string, Season2SavedPrediction>>(() => user.predictions);
  const [historyRound, setHistoryRound] = useState(() => getDefaultPredictionHistoryRound(user.predictions));
  const [statusMessage, setStatusMessage] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPredictions(user.predictions);
    setHistoryRound(getDefaultPredictionHistoryRound(user.predictions));
  }, [user.predictions]);

  const availableMatches = predictionRounds.flatMap(round => round.matches).filter(match => !isSeason2Played(match));
  const pendingMatches = availableMatches.filter(match => !predictions[match.id]?.locked);
  const pendingFilledCount = pendingMatches.filter(match =>
    predictions[match.id]?.homeScore !== undefined &&
    predictions[match.id]?.homeScore !== "" &&
    predictions[match.id]?.awayScore !== undefined &&
    predictions[match.id]?.awayScore !== "",
  ).length;
  const filledCount = availableMatches.filter(match =>
    predictions[match.id]?.homeScore !== undefined &&
    predictions[match.id]?.homeScore !== "" &&
    predictions[match.id]?.awayScore !== undefined &&
    predictions[match.id]?.awayScore !== "",
  ).length;
  const isComplete = pendingMatches.length > 0 && pendingFilledCount === pendingMatches.length;
  const isLocked = pendingMatches.length === 0 && availableMatches.length > 0;
  const history = getSeason2PredictionHistory(user.predictions);
  const historyRounds = getPredictionHistoryRounds(history);
  const selectedHistoryRound = historyRounds.find(round => round.round === historyRound) ?? historyRounds[0];

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

  const savePredictions = async () => {
    if (isLocked || isSaving) return;
    if (!isComplete) {
      setStatusMessage("Заповни всі матчі перед збереженням.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    try {
      const updatedUser = await saveSeason2RoundPredictions({
        round: predictionRounds[0]?.round ?? 1,
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
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Fan Predict</div>
        <h2 className="mt-1 font-heading text-[1.75rem] leading-none text-white">{getPredictionWeekendTitle(predictionRounds)}</h2>
        <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.06] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wide text-white/42">Заповнено</span>
          <span className="font-heading text-xl leading-none text-[#ff5a1f]">{filledCount}/{availableMatches.length}</span>
        </div>
        <p className="mt-3 text-xs font-bold leading-5 text-white/48">Точний рахунок - 10, правильний результат - 5, мимо - 0.</p>
      </section>

      <div className="grid grid-cols-2 gap-1 rounded-md border border-white/10 bg-white/[0.04] p-1">
        <button type="button" onClick={() => setView("open")} className={`h-10 rounded-[0.32rem] text-[0.72rem] font-extrabold ${view === "open" ? "bg-[#bbf903] text-[#111111]" : "text-white/48"}`}>Відкриті</button>
        <button type="button" onClick={() => setView("history")} className={`h-10 rounded-[0.32rem] text-[0.72rem] font-extrabold ${view === "history" ? "bg-[#bbf903] text-[#111111]" : "text-white/48"}`}>Історія</button>
      </div>

      {view === "open" && (
        <FanSection title="Матчі для прогнозу" icon={CalendarDays}>
          <div className="space-y-3">
            {predictionRounds.length && availableMatches.length ? predictionRounds.map(round => (
              <div key={round.round} className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
                  <span className="font-heading text-lg leading-none text-white">Тур {round.round}</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-white/42">{round.dayLabel}</span>
                </div>
                {availableMatches.filter(match => match.round === round.round).map(match => (
                  <FanPredictionCard
                    key={match.id}
                    match={match}
                    value={predictions[match.id] ?? { homeScore: "", awayScore: "" }}
                    onChange={(side, value) => updatePrediction(match.id, side, value)}
                    locked={Boolean(predictions[match.id]?.locked)}
                  />
                ))}
              </div>
            )) : <EmptyState text="Поки немає відкритих матчів для прогнозу." />}
          </div>
          <button
            type="button"
            onClick={savePredictions}
            disabled={isLocked || isSaving || !availableMatches.length}
            className={`mt-4 h-12 w-full rounded-md text-sm font-extrabold ${isLocked ? "border border-[#bbf903]/35 bg-[#bbf903]/10 text-[#bbf903]" : "bg-[#bbf903] text-[#111111]"}`}
          >
            {isLocked ? "Прогнози зафіксовано" : isSaving ? "Зберігаємо..." : "Зберегти прогнози"}
          </button>
          {savedAt && <div className="mt-3 text-center text-xs font-bold text-[#bbf903]">Збережено о {savedAt}. Змінити вже не можна.</div>}
          {statusMessage && <div className="mt-3 rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 p-3 text-xs font-bold text-[#ff5a1f]">{statusMessage}</div>}
        </FanSection>
      )}

      {view === "history" && (
        <FanPredictionHistory
          predictions={selectedHistoryRound?.items ?? []}
          rounds={historyRounds}
          selectedRound={selectedHistoryRound?.round}
          onSelectRound={setHistoryRound}
        />
      )}
    </div>
  );
}

function FanRatingTab({ currentUser }: { currentUser: Season2User }) {
  const [rows, setRows] = useState<Season2PredictionLeaderboardRow[]>([]);

  useEffect(() => {
    loadSeason2PredictionLeaderboard().then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <FanSection title="Рейтинг прогнозистів" icon={Trophy}>
      <div className="mb-3 grid grid-cols-[34px_minmax(0,1fr)_52px_42px_42px] gap-2 px-2 text-[0.62rem] font-extrabold uppercase tracking-wide text-white/36">
        <span>#</span>
        <span>Учасник</span>
        <span className="text-right">Очки</span>
        <span className="text-right">Точні</span>
        <span className="text-right">Рез.</span>
      </div>
      <div className="space-y-2">
        {rows.length ? rows.map((row, index) => {
          const isCurrent = row.playerId === currentUser.playerId;
          return (
            <div
              key={row.playerId}
              className={`grid grid-cols-[34px_minmax(0,1fr)_52px_42px_42px] items-center gap-2 rounded-md border px-2 py-3 ${
                isCurrent ? "border-[#bbf903] bg-[#bbf903] text-[#111111]" : "border-white/10 bg-white/[0.045] text-white"
              }`}
            >
              <div className="font-heading text-lg leading-none">#{index + 1}</div>
              <div className="min-w-0">
                <div className="truncate text-[0.92rem] font-extrabold leading-tight">{row.displayName}</div>
                <div className={isCurrent ? "truncate text-[0.66rem] font-bold text-[#111111]/55" : "truncate text-[0.66rem] font-bold text-white/38"}>
                  {row.role === "fan" ? "вболівальник" : "гравець"} · {row.predictions} прогнозів
                </div>
              </div>
              <div className="text-right font-heading text-lg leading-none">{row.points}</div>
              <div className={`text-right text-sm font-extrabold ${isCurrent ? "text-[#111111]" : "text-[#bbf903]"}`}>{row.exact}</div>
              <div className={`text-right text-sm font-extrabold ${isCurrent ? "text-[#111111]" : "text-[#ff5a1f]"}`}>{row.correctResult}</div>
            </div>
          );
        }) : <EmptyState text="Рейтинг зʼявиться після прогнозів." />}
      </div>
    </FanSection>
  );
}

function FanProfileTab({ user, onLogout }: { user: Season2User; onLogout: () => void }) {
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
      setPushMessage("Push увімкнено. Тепер ти в курсі ефірів, результатів і прогнозів.");
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
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Профіль фаната</div>
        <h2 className="mt-1 truncate font-heading text-[2.4rem] leading-none">{user.displayName ?? user.username}</h2>
        <div className="mt-4 rounded-md border border-[#ff5a1f]/30 bg-[#ff5a1f]/10 p-3">
          <div className="text-[0.66rem] font-bold uppercase tracking-wide text-white/42">Логін</div>
          <div className="mt-1 text-lg font-extrabold text-[#ff5a1f]">{user.username}</div>
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

      <button type="button" onClick={onLogout} className="h-12 w-full rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 text-sm font-extrabold text-[#ff5a1f]">
        Вийти
      </button>
    </div>
  );
}

function FanLoginPanel({ onLogin }: { onLogin: (user: Season2User) => void }) {
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
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Кабінет вболівальника</div>
        <h2 className="mt-1 font-heading text-[2.1rem] leading-none text-white">Вхід</h2>
        <p className="mt-2 text-sm leading-6 text-white/56">Логін і пароль можна отримати в особистих повідомленнях.</p>
      </div>
      <label className="block">
        <span className="text-[0.66rem] font-extrabold uppercase tracking-wide text-white/42">Логін</span>
        <input value={username} onChange={event => setUsername(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-white/12 bg-[#111111] px-3 text-base font-bold text-white outline-none focus:border-[#bbf903]" autoComplete="username" />
      </label>
      <label className="block">
        <span className="text-[0.66rem] font-extrabold uppercase tracking-wide text-white/42">Пароль</span>
        <input type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-white/12 bg-[#111111] px-3 text-base font-bold text-white outline-none focus:border-[#bbf903]" autoComplete="current-password" />
      </label>
      <button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-md bg-[#bbf903] text-sm font-extrabold text-[#111111] disabled:opacity-60">
        {isSubmitting ? "Заходимо..." : "Увійти"}
      </button>
      {error && <div className="rounded-md border border-[#ff5a1f]/35 bg-[#ff5a1f]/10 p-3 text-sm font-bold text-[#ff5a1f]">{error}</div>}
    </form>
  );
}

function FanMatchCard({ match, schedule }: { match: Season2Match; schedule?: Season2MatchSchedule }) {
  const played = isSeason2Played(match);
  const badge = getScheduleBadge(schedule);

  return (
    <article className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">Тур {match.round} · {getSeason2LegLabel(match.leg)}</div>
          <div className="mt-1 text-xs text-white/45">{match.dayLabel}</div>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-1 text-[0.58rem] font-extrabold uppercase ${played ? "bg-white/12 text-white" : getFanScheduleStatusClass(schedule)}`}>
          {played ? "Зіграно" : badge ?? "Скоро"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <FanTeam player={match.home} />
        <div className="rounded-md bg-[#111111] px-3 py-2 text-center font-heading text-xl leading-none text-[#ff5a1f]">
          {played ? `${match.homeScore}:${match.awayScore}` : "VS"}
        </div>
        <FanTeam player={match.away} align="right" />
      </div>
    </article>
  );
}

function FanPredictionCard({ match, value, onChange, locked }: {
  match: Season2Match;
  value: Season2SavedPrediction;
  onChange: (side: keyof Season2SavedPrediction, value: string) => void;
  locked: boolean;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">Матч {match.id.split("-").at(-1)}</div>
        {locked && <span className="rounded-md border border-[#bbf903]/25 bg-[#bbf903]/10 px-2 py-1 text-[0.66rem] font-extrabold text-[#bbf903]">{value.points ?? 0} оч.</span>}
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <FanTeam player={match.home} />
        <div className="grid grid-cols-[44px_auto_44px] items-center gap-2">
          <PredictionInput value={value.homeScore} label={`${match.home.name} голи`} onChange={nextValue => onChange("homeScore", nextValue)} disabled={locked} />
          <span className="font-heading text-xl leading-none text-[#ff5a1f]">:</span>
          <PredictionInput value={value.awayScore} label={`${match.away.name} голи`} onChange={nextValue => onChange("awayScore", nextValue)} disabled={locked} />
        </div>
        <FanTeam player={match.away} align="right" />
      </div>
    </article>
  );
}

function FanPredictionHistory({ predictions, rounds, selectedRound, onSelectRound }: {
  predictions: Season2PredictionHistoryItem[];
  rounds: Array<{ round: number; items: Season2PredictionHistoryItem[] }>;
  selectedRound?: number;
  onSelectRound: (round: number) => void;
}) {
  return (
    <FanSection title="Минулі ставки" icon={ListChecks}>
      {rounds.length > 0 && selectedRound && (
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <div className="flex w-max gap-2">
            {rounds.map(round => (
              <button key={round.round} type="button" onClick={() => onSelectRound(round.round)} className={`h-9 rounded-md border px-3 text-[0.68rem] font-extrabold uppercase ${selectedRound === round.round ? "border-[#bbf903] bg-[#bbf903] text-[#111111]" : "border-white/10 bg-white/[0.04] text-white/52"}`}>
                Тур {round.round}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {predictions.length ? predictions.map(item => (
          <article key={item.match.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">Тур {item.match.round}</div>
                <div className="mt-1 text-xs text-white/42">{item.match.dayLabel}</div>
              </div>
              <span className={`rounded-md px-2 py-1 text-[0.66rem] font-extrabold ${item.prediction.points === 10 ? "bg-[#bbf903] text-[#111111]" : item.prediction.points === 5 ? "bg-[#ff5a1f] text-white" : "bg-white/10 text-white/55"}`}>
                {item.prediction.points ?? 0} оч.
              </span>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <FanTeam player={item.match.home} />
              <div className="rounded-md bg-[#111111] px-3 py-2 text-center">
                <div className="font-heading text-lg leading-none text-white">{item.match.homeScore}:{item.match.awayScore}</div>
                <div className="mt-1 text-[0.58rem] font-extrabold uppercase tracking-wide text-white/35">результат</div>
              </div>
              <FanTeam player={item.match.away} align="right" />
            </div>
            <div className="mt-3 rounded-md border border-white/10 bg-[#111111] px-3 py-2 text-sm font-bold text-white/68">
              Твій прогноз: <span className="text-[#bbf903]">{item.prediction.homeScore}:{item.prediction.awayScore}</span>
            </div>
          </article>
        )) : <EmptyState text="Після зіграних матчів тут буде видно, що зайшло, а що ні." />}
      </div>
    </FanSection>
  );
}

function FanTeam({ player, align = "left" }: { player: Season2Match["home"]; align?: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="truncate text-[0.98rem] font-extrabold leading-tight text-white">{player.name}</div>
      <div className="mt-0.5 truncate text-xs text-white/50">{player.club}</div>
    </div>
  );
}

function PredictionInput({ value, label, onChange, disabled }: {
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
      onChange={event => onChange(event.target.value.replace(/[^\d]/g, "").slice(0, 2))}
      className="h-11 w-11 rounded-md border border-white/12 bg-[#111111] text-center font-heading text-xl leading-none text-[#bbf903] outline-none focus:border-[#bbf903] disabled:opacity-55"
      placeholder="-"
    />
  );
}

type Season2PredictionHistoryItem = {
  match: Season2Match;
  prediction: Season2SavedPrediction;
};

function getSeason2PredictionHistory(predictions: Record<string, Season2SavedPrediction>): Season2PredictionHistoryItem[] {
  return season2Rounds
    .flatMap(round => round.matches)
    .filter(match => isSeason2Played(match) && predictions[match.id])
    .map(match => ({ match, prediction: predictions[match.id] }))
    .reverse();
}

function getPredictionHistoryRounds(predictions: Season2PredictionHistoryItem[]) {
  return season2Rounds
    .map(round => ({
      round: round.round,
      items: predictions.filter(item => item.match.round === round.round),
    }))
    .filter(round => round.items.length > 0)
    .reverse();
}

function getDefaultPredictionHistoryRound(predictions: Record<string, Season2SavedPrediction>) {
  return getPredictionHistoryRounds(getSeason2PredictionHistory(predictions))[0]?.round ?? 1;
}

function getSeason2PredictionWeekend() {
  const weekendIndex = getSeason2CabinetWeekendIndex();
  const calendarRounds = getSeason2WeekendRounds(weekendIndex).filter(round => round.matches.some(match => !isSeason2Played(match)));
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

  if (weekendIndex === -1) return Math.max(0, Math.floor(((season2Rounds.at(-1)?.round ?? 1) - 1) / 2));
  return Math.floor((season2Rounds[weekendIndex].round - 1) / 2);
}

function getKyivDateOnly(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getPredictionWeekendTitle(rounds: Season2Round[]) {
  if (!rounds.length) return "Новий вікенд";
  if (rounds.length === 1) return `Тур ${rounds[0].round}`;
  return `Тури ${rounds.map(round => round.round).join(" та ")}`;
}

function getFanScheduleStatusClass(schedule?: Season2MatchSchedule) {
  if (schedule?.status === "scheduled") return "bg-[#bbf903] text-[#111111]";
  if (schedule?.status === "negotiating") return "bg-[#fe008a] text-white";
  if (schedule?.status === "day_confirmed") return "bg-[#bbf903] text-[#111111]";
  if (schedule?.status === "postponed") return "bg-[#3050ff] text-white";
  return "bg-[#ff5a1f] text-white";
}

function FanSection({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-[1.55rem] leading-none">{title}</h2>
        <Icon className="h-5 w-5 text-[#bbf903]" />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="mt-3 rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-white/58">{text}</div>;
}

function FanTabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof House; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[0.66rem] font-extrabold ${active ? "bg-[#bbf903] text-[#111111]" : "text-white/58"}`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
