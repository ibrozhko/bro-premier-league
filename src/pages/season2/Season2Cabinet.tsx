import { Bell, CalendarDays, House, ListChecks, LogOut, Table2, Trophy, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  calculateSeason2Standings,
  getSeason2LegLabel,
  isSeason2Played,
  season2Players,
  season2Rounds,
  type Season2Match,
  type Season2Player,
  type Season2Standing,
} from "@/data/season2Data";
import {
  getCurrentSeason2User,
  loginSeason2User,
  logoutSeason2User,
  saveSeason2RoundPredictions,
  type Season2SavedPrediction,
  type Season2User,
} from "@/lib/season2Predictions";

type CabinetTab = "home" | "matches" | "predictions" | "table" | "profile";

const storageKey = "bpl-season2-cabinet-player";

export default function Season2Cabinet() {
  const [activeTab, setActiveTab] = useState<CabinetTab>("home");
  const [authStatus, setAuthStatus] = useState<"loading" | "ready">("loading");
  const [user, setUser] = useState<Season2User | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(() => {
    if (typeof window === "undefined") return season2Players[0]?.id ?? "";
    return window.localStorage.getItem(storageKey) ?? season2Players[0]?.id ?? "";
  });

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
              {activeTab === "home" && <HomeTab player={selectedPlayer} data={playerData} />}
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

function HomeTab({ player, data }: { player: Season2Player; data: PlayerCabinetData }) {
  const primaryMatch = data.upcomingMatches[0] ?? data.recentMatches[0] ?? null;

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-white/10 bg-white/[0.06] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold leading-tight text-white">{player.name}</div>
            <p className="mt-1 truncate text-sm text-white/56">{player.club}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CompactMetric label="Місце" value={`#${data.rank}`} />
            <CompactMetric label="Очки" value={data.standing.points} accent />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Наступний фокус</div>
            <h2 className="mt-1 font-heading text-[1.65rem] leading-none">
              {primaryMatch && !isSeason2Played(primaryMatch) ? "Твій матч" : primaryMatch ? "Останній матч" : "Очікуємо календар"}
            </h2>
          </div>
          <CalendarDays className="h-5 w-5 text-[#ff5a1f]" />
        </div>
        {primaryMatch ? <MobileMatchCard match={primaryMatch} playerId={player.id} featured /> : (
          <p className="mt-4 text-sm leading-6 text-white/58">Матчі ще не знайдені.</p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <HeroMetric label="Зіграно" value={data.standing.played} />
        <HeroMetric label="Різниця" value={data.standing.goalDifference > 0 ? `+${data.standing.goalDifference}` : data.standing.goalDifference} />
        <HeroMetric label="Голи" value={data.standing.goalsFor} />
        <HeroMetric label="Пропущено" value={data.standing.goalsAgainst} />
      </section>

      <section className="rounded-md border border-white/10 bg-white/[0.06] p-4">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Форма</div>
        <div className="mt-4 flex gap-2">
          {getFormValues(data.standing.form).map((value, index) => (
            <span key={`${value}-${index}`} className={formClass(value)}>{value}</span>
          ))}
        </div>
      </section>
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
  const round = getSeason2PredictionRound();
  const [savedAt, setSavedAt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [predictions, setPredictions] = useState<Record<string, Season2SavedPrediction>>(() => user.predictions);

  useEffect(() => {
    setPredictions(user.predictions);
    setSavedAt("");
    setStatusMessage("");
  }, [user.predictions]);

  const updatePrediction = (matchId: string, side: keyof Season2SavedPrediction, value: string) => {
    if (isLocked) return;

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

  if (!round) {
    return (
      <MobileSection title="Прогнози" icon={Trophy}>
        <EmptyState text="Зараз немає відкритого туру для прогнозів." />
      </MobileSection>
    );
  }

  const availableMatches = round.matches.filter(match => !hasPlayer(match, player.id));
  const filledCount = availableMatches.filter(match =>
    predictions[match.id]?.homeScore !== undefined &&
    predictions[match.id]?.homeScore !== "" &&
    predictions[match.id]?.awayScore !== undefined &&
    predictions[match.id]?.awayScore !== "",
  ).length;
  const isComplete = filledCount === availableMatches.length;
  const isLocked = availableMatches.some(match => predictions[match.id]?.locked);

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
        round: round.round,
        predictions: availableMatches.map(match => ({
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
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#bbf903]">Season 2 Predict</div>
        <h2 className="mt-1 font-heading text-[1.75rem] leading-none text-white">Тур {round.round}</h2>
        <p className="mt-2 text-sm leading-6 text-white/58">
          Став рахунок тільки на матчі інших. Свій матч у прогнозах не показуємо.
        </p>
        <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.06] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wide text-white/42">Заповнено</span>
          <span className="font-heading text-xl leading-none text-[#ff5a1f]">{filledCount}/{availableMatches.length}</span>
        </div>
      </section>

      <MobileSection title="Матчі туру" icon={CalendarDays}>
        <div className="space-y-3">
          {availableMatches.length ? availableMatches.map(match => (
            <PredictionCard
              key={match.id}
              match={match}
              value={predictions[match.id] ?? { homeScore: "", awayScore: "" }}
              onChange={(side, value) => updatePrediction(match.id, side, value)}
              locked={isLocked}
            />
          )) : <EmptyState text="У цьому турі немає матчів для твого прогнозу." />}
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
    </div>
  );
}

function TableTab({ data }: { data: PlayerCabinetData }) {
  return (
    <div className="space-y-4">
      <MobileSection title="Я в таблиці" icon={Table2}>
        <div className="space-y-2">
          {data.neighborRows.map(row => (
            <div
              key={row.player.id}
              className={`grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border p-3 ${
                row.player.id === data.standing.player.id
                  ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
                  : "border-white/10 bg-white/[0.06] text-white"
              }`}
            >
              <div className="font-heading text-xl leading-none">#{row.rank}</div>
              <div className="min-w-0">
                <div className="truncate text-[0.95rem] font-extrabold leading-tight">{row.player.name}</div>
                <div className={row.player.id === data.standing.player.id ? "truncate text-xs text-[#111111]/58" : "truncate text-xs text-white/48"}>
                  {row.player.club}
                </div>
              </div>
              <div className="font-heading text-xl leading-none">{row.points}</div>
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
          Далі додамо пуші про твої матчі, результати і зміни у таблиці. Це буде головна фішка кабінету.
        </p>
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
  const neighborRows = getNeighborRows(standings, player.id);

  return {
    standing,
    rank: rank || 1,
    upcomingMatches: allMatches.filter(match => !isSeason2Played(match)).slice(0, 5),
    recentMatches: allMatches.filter(isSeason2Played).reverse().slice(0, 5),
    neighborRows,
  };
}

function getNeighborRows(standings: Season2Standing[], playerId: string) {
  const playerIndex = Math.max(0, standings.findIndex(row => row.player.id === playerId));
  const start = Math.max(0, Math.min(playerIndex - 2, standings.length - 5));

  return standings.slice(start, start + 5).map((row, index) => ({
    ...row,
    rank: start + index + 1,
  }));
}

function hasPlayer(match: Season2Match, playerId: string) {
  return match.home.id === playerId || match.away.id === playerId;
}

function getSeason2PredictionRound() {
  return season2Rounds.find(round => round.matches.some(match => !isSeason2Played(match))) ?? null;
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
        <div className="text-xs text-white/42">{match.dayLabel}</div>
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

function MobileMatchCard({ match, playerId, featured = false }: { match: Season2Match; playerId: string; featured?: boolean }) {
  const played = isSeason2Played(match);
  const opponent = match.home.id === playerId ? match.away : match.home;
  const selected = match.home.id === playerId ? match.home : match.away;

  return (
    <article className={`mt-3 rounded-md border ${featured ? "border-[#bbf903]/60 bg-[#bbf903]/10" : "border-white/10 bg-white/[0.04]"} p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-[#ff5a1f]">
            Тур {match.round} · {getSeason2LegLabel(match.leg)}
          </div>
          <div className="mt-1 text-xs text-white/45">{match.dayLabel}</div>
        </div>
        <span className={`rounded-md px-2 py-1 text-[0.65rem] font-extrabold uppercase ${played ? "bg-white/12 text-white" : "bg-[#bbf903] text-[#111111]"}`}>
          {played ? "Зіграно" : "Скоро"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamBlock player={selected} align="left" />
        <div className="rounded-md bg-[#ff5a1f]/16 px-3 py-2 text-center font-heading text-xl leading-none text-[#ff5a1f]">
          {played ? `${match.homeScore}:${match.awayScore}` : "VS"}
        </div>
        <TeamBlock player={opponent} align="right" />
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
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-white/42">{label}</div>
      <div className="mt-2 font-heading text-[1.75rem] leading-none text-[#ff5a1f]">{value}</div>
    </div>
  );
}

function MobileSection({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-[1.75rem] leading-none">{title}</h2>
        <Icon className="h-5 w-5 text-[#bbf903]" />
      </div>
      {children}
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
    ? "bg-[#bbf903] text-[#111111]"
    : value === "D"
      ? "bg-white/14 text-white"
      : value === "L"
        ? "bg-[#ff5a1f] text-white"
        : "bg-white/8 text-white/30";

  return `inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold ${color}`;
}
