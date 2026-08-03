import { FormEvent, useEffect, useMemo, useState } from "react";
import { ClipboardList, LogOut, RotateCcw, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAdminSession, logoutAdmin, type AdminUser } from "@/lib/adminAuth";
import {
  applicationStatuses,
  deleteApplication,
  getApplications,
  updateApplicationStatus as saveApplicationStatus,
  type ApplicationStatus,
  type SeasonApplication,
} from "@/lib/applications";
import { isPlayed, worldCupMatches } from "@/data/worldCup2026Data";
import { isSeason2Played, season2Rounds } from "@/data/season2Data";

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

type AdminTab = "results" | "applications";
type ResultsTournament = "season2" | "worldCup";

type AdminMatchOption = {
  id: string;
  label: string;
  dateLabel: string;
  homeName: string;
  homeMeta: string;
  awayName: string;
  awayMeta: string;
  homeScore: number | null;
  awayScore: number | null;
};

const inputClass = "h-11 w-full rounded-md border border-[#ff5a1f]/25 bg-white px-3 text-base text-[#111111] outline-none placeholder:text-[#111111]/35 focus-visible:ring-2 focus-visible:ring-[#bbf903]";
const adminPanelClass = "rounded-md border border-[#111111]/12 bg-white p-4 shadow-sm sm:p-6";
const adminPrimaryButtonClass = "bg-[#ff5a1f] text-white hover:bg-[#e64d16] focus-visible:ring-[#bbf903]";
const adminSecondaryButtonClass = "border border-[#ff5a1f]/35 bg-white text-[#ff5a1f] hover:bg-[#ff5a1f] hover:text-white focus-visible:ring-[#bbf903]";
const activePillClass = "rounded-md bg-[#bbf903] px-4 py-2 text-sm font-extrabold text-[#111111]";
const inactivePillClass = "rounded-md border border-[#ff5a1f]/25 bg-white px-4 py-2 text-sm font-extrabold text-[#ff5a1f] hover:bg-[#fff3ee]";

const worldCupMatchOptions: AdminMatchOption[] = worldCupMatches.map(match => {
  const home = splitWorldCupTeam(match.home);
  const away = splitWorldCupTeam(match.away);

  return {
    id: match.id,
    label: match.group ? `ЧС 2026 · Група ${match.group} · ${match.round}` : `ЧС 2026 · ${match.stage}`,
    dateLabel: `${match.day} ${match.date}`,
    homeName: home.player,
    homeMeta: home.team,
    awayName: away.player,
    awayMeta: away.team,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  };
});

const season2MatchOptions: AdminMatchOption[] = season2Rounds.flatMap(round =>
  round.matches.map(match => ({
    id: match.id,
    label: `Season 2 · Тур ${round.round}`,
    dateLabel: round.dayLabel,
    homeName: match.home.name,
    homeMeta: match.home.club,
    awayName: match.away.name,
    awayMeta: match.away.club,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  })),
);

export default function Admin() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("results");
  const [resultsTournament, setResultsTournament] = useState<ResultsTournament>("season2");
  const [matchId, setMatchId] = useState(getDefaultMatchId("season2"));
  const matchOptions = resultsTournament === "season2" ? season2MatchOptions : worldCupMatchOptions;
  const selectedMatch = useMemo(
    () => matchOptions.find(match => match.id === matchId) ?? matchOptions[0],
    [matchId, matchOptions],
  );
  const [homeScore, setHomeScore] = useState(selectedMatch.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(selectedMatch.awayScore?.toString() ?? "");
  const [applications, setApplicationList] = useState<SeasonApplication[]>([]);
  const [applicationsStatus, setApplicationsStatus] = useState<Status>({ type: "idle", message: "" });
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAdminSession()
      .then(session => {
        if (!session.authenticated || !session.user) {
          navigate("/admin/login", { replace: true });
          return;
        }

        setAdminUser(session.user);
      })
      .catch(() => navigate("/admin/login", { replace: true }))
      .finally(() => setIsCheckingSession(false));
  }, [navigate]);

  useEffect(() => {
    setMatchId(getDefaultMatchId(resultsTournament));
    setStatus({ type: "idle", message: "" });
  }, [resultsTournament]);

  useEffect(() => {
    setHomeScore(selectedMatch.homeScore?.toString() ?? "");
    setAwayScore(selectedMatch.awayScore?.toString() ?? "");
  }, [selectedMatch]);

  useEffect(() => {
    if (activeTab !== "applications" || !adminUser) return;
    void loadApplications();
  }, [activeTab, adminUser]);

  async function sendAdminAction(body: Record<string, unknown>) {
    setIsSaving(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/update-result", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Не вдалося оновити дані");
      }

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
      action: resultsTournament === "season2" ? "updateSeason2Result" : "updateWorldCupResult",
      matchId: selectedMatch.id,
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

  async function loadApplications() {
    if (!adminUser) {
      setApplicationsStatus({ type: "error", message: "Увійди в адмінку, щоб побачити заявки." });
      return;
    }

    setIsLoadingApplications(true);
    setApplicationsStatus({ type: "idle", message: "" });

    try {
      setApplicationList(await getApplications());
    } catch (error) {
      setApplicationsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Не вдалося завантажити заявки.",
      });
    } finally {
      setIsLoadingApplications(false);
    }
  }

  async function updateApplicationStatus(applicationId: string, nextStatus: ApplicationStatus) {
    try {
      const updatedApplication = await saveApplicationStatus(applicationId, nextStatus);
      setApplicationList(current =>
        current.map(application =>
          application.id === applicationId ? updatedApplication : application,
        ),
      );
      setApplicationsStatus({ type: "success", message: "Статус заявки оновлено." });
    } catch (error) {
      setApplicationsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Не вдалося оновити статус.",
      });
    }
  }

  async function removeApplication(applicationId: string) {
    try {
      await deleteApplication(applicationId);
      setApplicationList(current => current.filter(application => application.id !== applicationId));
      setApplicationsStatus({ type: "success", message: "Заявку видалено." });
    } catch (error) {
      setApplicationsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Не вдалося видалити заявку.",
      });
    }
  }

  async function handleLogout() {
    await logoutAdmin();
    navigate("/admin/login", { replace: true });
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] py-12">
        <div className="content-shell">
          <div className={adminPanelClass}>
            <div className="h-card">Перевіряю доступ...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f2] py-10 text-[#111111] sm:py-12">
      <div className="content-shell">
        <div className="page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#ff5a1f]">Операційна панель</div>
            <h1 className="h-page">Адмінка</h1>
            <p className="t-body text-muted-foreground">Результати ЧС 2026, Season 2 і заявки на участь.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="t-meta">{adminUser.name ?? adminUser.username}</div>
            <div className="flex gap-2">
              <a className="inline-flex h-10 items-center rounded-md px-3 text-sm font-bold text-[#ff5a1f] hover:underline" href="/matches">
                До матчів
              </a>
              <Button className={adminSecondaryButtonClass} type="button" variant="secondary" onClick={handleLogout}>
                <LogOut />
                Вийти
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#111111]/12 bg-[#111111]/12">
          {[
            { value: "results", label: "Результати" },
            { value: "applications", label: `Заявки${applications.length ? ` · ${applications.length}` : ""}` },
          ].map(tab => (
            <button
              key={tab.value}
              className={`h-11 bg-white px-2 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bbf903] ${
                activeTab === tab.value ? "bg-[#111111] text-[#f7f7f2]" : "text-[#111111] hover:bg-[#fff3ee]"
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
            <section className={adminPanelClass}>
              <div className="mb-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={resultsTournament === "season2" ? activePillClass : inactivePillClass}
                  onClick={() => setResultsTournament("season2")}
                >
                  Season 2
                </button>
                <button
                  type="button"
                  className={resultsTournament === "worldCup" ? activePillClass : inactivePillClass}
                  onClick={() => setResultsTournament("worldCup")}
                >
                  ЧС 2026
                </button>
              </div>

              <div className="mb-5">
                <label className="t-label mb-2 block" htmlFor="admin-match">
                  Матч
                </label>
                <select
                  id="admin-match"
                  className={inputClass}
                  value={matchId}
                  onChange={event => setMatchId(event.target.value)}
                >
                  {matchOptions.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.dateLabel} · {match.label} · {match.homeName} - {match.awayName} · {scoreLabel(match)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md border border-[#ff5a1f]/20 bg-[#fff8f4] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-extrabold uppercase text-[#ff5a1f]">
                    {selectedMatch.label}
                  </span>
                  <span className="t-meta">{selectedMatch.dateLabel}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <TeamName name={selectedMatch.homeName} meta={selectedMatch.homeMeta} align="right" />
                  <div className="font-heading text-2xl text-[#ff5a1f]">VS</div>
                  <TeamName name={selectedMatch.awayName} meta={selectedMatch.awayMeta} align="left" />
                </div>

                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <input
                    className={`${inputClass} h-14 min-w-0 text-center font-heading text-3xl`}
                    inputMode="numeric"
                    min={0}
                    type="number"
                    value={homeScore}
                    onChange={event => setHomeScore(event.target.value)}
                  />
                  <span className="text-2xl text-muted-foreground">:</span>
                  <input
                    className={`${inputClass} h-14 min-w-0 text-center font-heading text-3xl`}
                    inputMode="numeric"
                    min={0}
                    type="number"
                    value={awayScore}
                    onChange={event => setAwayScore(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button className={`w-full sm:w-auto ${adminPrimaryButtonClass}`} type="submit" disabled={isSaving}>
                  <Save />
                  {isSaving ? "Оновлюю..." : "Оновити результат"}
                </Button>
                <Button
                  className={`w-full sm:w-auto ${adminSecondaryButtonClass}`}
                  type="button"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={() => updateResult(null, null)}
                >
                  <Trash2 />
                  Очистити результат
                </Button>
              </div>
            </section>
          </form>
        )}

        {activeTab === "applications" && (
          <ApplicationsPanel
            applications={applications}
            applicationsStatus={applicationsStatus}
            isLoadingApplications={isLoadingApplications}
            loadApplications={loadApplications}
            removeApplication={removeApplication}
            updateApplicationStatus={updateApplicationStatus}
          />
        )}

        {status.message && (
          <div
            className={`mt-6 rounded-md border p-4 t-body ${
              status.type === "success"
                ? "border-[#bbf903]/70 bg-white text-[#111111]"
                : "border-destructive/50 bg-white text-destructive"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationsPanel({
  applications,
  applicationsStatus,
  isLoadingApplications,
  loadApplications,
  removeApplication,
  updateApplicationStatus,
}: {
  applications: SeasonApplication[];
  applicationsStatus: Status;
  isLoadingApplications: boolean;
  loadApplications: () => void;
  removeApplication: (applicationId: string) => void;
  updateApplicationStatus: (applicationId: string, nextStatus: ApplicationStatus) => void;
}) {
  return (
    <section className={adminPanelClass}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="h-card flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#ff5a1f]" />
            Заявки на сезон
          </h2>
          <p className="t-body text-muted-foreground">
            Кандидати зберігаються в Supabase. Для перегляду потрібен вхід в адмінку.
          </p>
        </div>
        <Button
          className={`w-full sm:w-auto ${adminSecondaryButtonClass}`}
          type="button"
          variant="secondary"
          disabled={isLoadingApplications}
          onClick={loadApplications}
        >
          <RotateCcw />
          {isLoadingApplications ? "Оновлюю..." : "Оновити список"}
        </Button>
      </div>

      {applicationsStatus.message && (
        <div
          className={`mb-4 rounded-md border p-3 t-body ${
            applicationsStatus.type === "success"
              ? "border-[#bbf903]/70 bg-white text-[#111111]"
              : "border-destructive/50 bg-white text-destructive"
          }`}
        >
          {applicationsStatus.message}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-md border border-[#ff5a1f]/20 bg-[#fff8f4] p-5">
          <div className="h-card">{isLoadingApplications ? "Завантажую заявки..." : "Заявок поки немає"}</div>
          <p className="t-body mt-1 text-muted-foreground">Коли кандидат заповнить форму, заявка зʼявиться в цьому списку.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(application => (
            <article key={application.id} className="rounded-md border border-[#111111]/12 bg-white p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="h-card">{application.name}</div>
                      <div className="t-meta">
                        {application.platform} · {application.eaId} · {formatApplicationDate(application.createdAt)}
                      </div>
                    </div>
                    <span className="t-body font-medium text-[#ff5a1f]">
                      {application.contact}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ApplicationMeta label="Улюблений клуб" value={application.preferredClub || "Не вказано"} />
                    <ApplicationMeta label="Доступність" value={application.availability} />
                    <ApplicationMeta label="Досвід" value={application.experience} wide />
                    {application.comment && <ApplicationMeta label="Коментар" value={application.comment} wide />}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label>
                    <span className="t-label mb-2 block">Статус</span>
                    <select
                      className={inputClass}
                      value={application.status}
                      onChange={event => updateApplicationStatus(application.id, event.target.value as ApplicationStatus)}
                    >
                      {applicationStatuses.map(item => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </label>
                  <Button
                    className={adminSecondaryButtonClass}
                    type="button"
                    variant="secondary"
                    onClick={() => removeApplication(application.id)}
                  >
                    <Trash2 />
                    Видалити
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function TeamName({ name, meta, align }: { name: string; meta: string; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="h-card truncate">{name}</div>
      <div className="t-meta truncate">{meta}</div>
    </div>
  );
}

function ApplicationMeta({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="t-label mb-1">{label}</div>
      <div className="t-body whitespace-pre-wrap text-[#343434]">{value}</div>
    </div>
  );
}

function splitWorldCupTeam(value: string) {
  const [player, team] = value.split(" - ");
  return { player, team: team ?? value };
}

function getDefaultMatchId(tournament: ResultsTournament) {
  if (tournament === "season2") {
    return season2Rounds.flatMap(round => round.matches).find(match => !isSeason2Played(match))?.id ?? season2Rounds[0].matches[0].id;
  }

  return worldCupMatches.find(match => !isPlayed(match))?.id ?? worldCupMatches[0].id;
}

function scoreLabel(match: AdminMatchOption) {
  return match.homeScore !== null && match.awayScore !== null ? `${match.homeScore}-${match.awayScore}` : "не зіграно";
}

function formatApplicationDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
