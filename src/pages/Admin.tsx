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
import { isPlayed, worldCupMatches, type WorldCupMatch } from "@/data/worldCup2026Data";

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

type AdminTab = "results" | "applications";

const inputClass = "h-11 w-full border border-[#ff008c]/20 bg-white px-3 text-base text-[#343434] outline-none placeholder:text-[#343434]/40 focus-visible:ring-2 focus-visible:ring-[#ff008c]";
const adminPanelClass = "light-panel rounded-md p-4 sm:p-6";
const adminPrimaryButtonClass = "bg-[#ff008c] text-white hover:bg-[#df007b] focus-visible:ring-[#ff008c]";
const adminSecondaryButtonClass = "border border-[#ff008c]/25 bg-white text-[#ff008c] hover:bg-[#ff008c] hover:text-white focus-visible:ring-[#ff008c]";

export default function Admin() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("results");
  const [matchId, setMatchId] = useState(worldCupMatches.find(match => !isPlayed(match))?.id ?? worldCupMatches[0].id);
  const selectedMatch = useMemo(
    () => worldCupMatches.find(match => match.id === matchId) ?? worldCupMatches[0],
    [matchId],
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
      action: "updateWorldCupResult",
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
      <div className="coax-light min-h-screen py-12">
        <div className="content-shell">
          <div className="light-panel rounded-md p-6">
            <div className="h-card">Перевіряю доступ...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className="coax-light min-h-screen py-10 sm:py-12">
      <div className="content-shell">
        <div className="page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#ff008c]">Операційна панель</div>
            <h1 className="h-page">Адмінка</h1>
            <p className="t-body text-muted-foreground">BPL World Cup 2026: результати матчів і заявки.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="t-meta">{adminUser.name ?? adminUser.username}</div>
            <div className="flex gap-2">
              <a className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-[#ff008c] hover:underline" href="/fixtures">
                До матчів
              </a>
              <Button className={adminSecondaryButtonClass} type="button" variant="secondary" onClick={handleLogout}>
                <LogOut />
                Вийти
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-px border border-[#ff008c]/20 bg-[#ff008c]/20">
          {[
            { value: "results", label: "Результати ЧС" },
            { value: "applications", label: `Заявки${applications.length ? ` · ${applications.length}` : ""}` },
          ].map(tab => (
            <button
              key={tab.value}
              className={`h-10 bg-white px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff008c] ${
                activeTab === tab.value ? "bg-[#bbf903] text-[#111111]" : "text-[#ff008c] hover:bg-[#f3f3f6]"
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
              <div className="mb-5">
                <label className="t-label mb-2 block" htmlFor="wc-match">
                  Матч
                </label>
                <select
                  id="wc-match"
                  className={inputClass}
                  value={matchId}
                  onChange={event => setMatchId(event.target.value)}
                >
                  {worldCupMatches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.date} · {matchLabel(match)} · {match.home} - {match.away} · {scoreLabel(match)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-[#ff008c]/15 bg-[#f3f3f6] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold uppercase text-[#ff008c]">
                    {matchLabel(selectedMatch)}
                  </span>
                  <span className="t-meta">{selectedMatch.day} {selectedMatch.date}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <TeamName value={selectedMatch.home} align="right" />
                  <div className="font-heading text-2xl text-[#ff008c]">VS</div>
                  <TeamName value={selectedMatch.away} align="left" />
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
                ? "border-[#ff008c]/30 bg-white text-[#ff008c]"
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
            <ClipboardList className="h-5 w-5 text-[#ff008c]" />
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
              ? "border-[#ff008c]/30 bg-white text-[#ff008c]"
              : "border-destructive/50 bg-white text-destructive"
          }`}
        >
          {applicationsStatus.message}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="border border-[#ff008c]/15 bg-[#f3f3f6] p-5">
          <div className="h-card">{isLoadingApplications ? "Завантажую заявки..." : "Заявок поки немає"}</div>
          <p className="t-body mt-1 text-muted-foreground">Коли кандидат заповнить форму, заявка зʼявиться в цьому списку.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(application => (
            <article key={application.id} className="border border-[#ff008c]/15 bg-white p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="h-card">{application.name}</div>
                      <div className="t-meta">
                        {application.platform} · {application.eaId} · {formatApplicationDate(application.createdAt)}
                      </div>
                    </div>
                    <span className="t-body font-medium text-[#ff008c]">
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
                      {applicationStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
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

function TeamName({ value, align }: { value: string; align: "left" | "right" }) {
  const [player, team] = value.split(" - ");

  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="h-card truncate">{player}</div>
      <div className="t-meta truncate">{team ?? value}</div>
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

function matchLabel(match: WorldCupMatch) {
  return match.group ? `Група ${match.group}` : match.stage;
}

function scoreLabel(match: WorldCupMatch) {
  return isPlayed(match) ? `${match.homeScore}-${match.awayScore}` : "не зіграно";
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
