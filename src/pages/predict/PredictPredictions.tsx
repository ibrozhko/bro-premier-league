import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatKyivDate,
  isLocked,
  isVisibleForPrediction,
  predictMatches,
  stageLabels,
  type MatchPrediction,
  type PredictMatch,
  type PredictUser,
} from "@/data/predictData";
import { getCurrentPredictUser, saveMatchPrediction } from "@/lib/predictStore";

type Draft = Record<number, { home: string; away: string; advancing: "home" | "away" | "" }>;

function sortByKickoff(matches: PredictMatch[]) {
  return [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime() || a.id - b.id);
}

export default function PredictPredictions() {
  const [user, setUser] = useState<PredictUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    getCurrentPredictUser()
      .then(loadedUser => {
        setUser(loadedUser);
        if (loadedUser) {
          setDraft(Object.fromEntries(Object.values(loadedUser.predictions).map(prediction => [
            prediction.matchId,
            {
              home: prediction.predictedHomeScore.toString(),
              away: prediction.predictedAwayScore.toString(),
              advancing: prediction.predictedAdvancing ?? "",
            },
          ])));
        }
      })
      .catch(err => setMessage(err instanceof Error ? err.message : "Не вдалося завантажити користувача."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setDraft(current => ({
      ...Object.fromEntries(Object.values(user.predictions).map(prediction => [
      prediction.matchId,
      {
        home: prediction.predictedHomeScore.toString(),
        away: prediction.predictedAwayScore.toString(),
        advancing: prediction.predictedAdvancing ?? "",
      },
      ])),
      ...current,
    }));
  }, [user]);

  const visibleMatches = useMemo(() => {
    if (!user) return [];
    return sortByKickoff(predictMatches.filter(match => isVisibleForPrediction(match, user.predictions[match.id])));
  }, [user]);

  if (isLoading) {
    return (
      <main className="content-shell py-10">
        <div className="rounded-md border border-[#2937da]/15 bg-white p-6 text-[#343434]/75">Завантажуємо прогнози...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="content-shell py-10">
        <div className="rounded-md border border-[#2937da]/15 bg-white p-6">
          <h2 className="h-section text-[#343434]">Потрібен вхід</h2>
          <p className="t-meta mt-2">Увійди, щоб робити прогнози на матчі.</p>
          <Button asChild className="mt-4 rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
            <Link to="/predict/login">Увійти</Link>
          </Button>
        </div>
      </main>
    );
  }

  function update(matchId: number, patch: Partial<Draft[number]>) {
    setDraft(current => ({ ...current, [matchId]: { home: "", away: "", advancing: "", ...current[matchId], ...patch } }));
  }

  async function save(event: FormEvent<HTMLFormElement>, match: PredictMatch) {
    event.preventDefault();
    if (match.homeTeam === "TBD" || match.awayTeam === "TBD") {
      setMessage("Пара матчу ще не визначена.");
      return;
    }
    const current = draft[match.id];
    const predictedHomeScore = Number(current?.home);
    const predictedAwayScore = Number(current?.away);

    if (!Number.isInteger(predictedHomeScore) || !Number.isInteger(predictedAwayScore) || predictedHomeScore < 0 || predictedAwayScore < 0) {
      setMessage("Введи два невід'ємні цілі числа.");
      return;
    }
    if (match.stage !== "group" && current?.advancing !== "home" && current?.advancing !== "away") {
      setMessage("Для плей-офф обери команду, яка пройде далі.");
      return;
    }

    try {
      const nextUser = await saveMatchPrediction(match, {
        predictedHomeScore,
        predictedAwayScore,
        predictedAdvancing: match.stage === "group" ? undefined : current.advancing as "home" | "away",
      });
      setUser(nextUser);
      setMessage("Прогноз збережено.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Не вдалося зберегти прогноз.");
    }
  }

  return (
    <main className="content-shell py-10">
      <div className="page-header">
        <div className="page-kicker">Сьогодні та завтра</div>
        <h2 className="h-page">Зробити ставки</h2>
        <p className="t-meta mt-2">Дедлайн кожного прогнозу настає рівно у kickoff за київським часом.</p>
      </div>
      {message && <div className="mb-5 rounded-md border border-[#2937da]/20 bg-white px-4 py-3 text-sm text-[#343434]">{message}</div>}
      <div className="space-y-4">
        {visibleMatches.length === 0 && (
          <div className="rounded-md border border-[#2937da]/15 bg-white p-6 text-[#343434]/75">
            Немає доступних матчів у вікні ставок. Збережені майбутні прогнози з'являться тут автоматично.
          </div>
        )}
        {visibleMatches.map(match => (
          <PredictionCard
            key={match.id}
            match={match}
            saved={user.predictions[match.id]}
            draft={draft[match.id] ?? { home: "", away: "", advancing: "" }}
            onUpdate={patch => update(match.id, patch)}
            onSave={event => save(event, match)}
          />
        ))}
      </div>
    </main>
  );
}

function PredictionCard({ match, saved, draft, onUpdate, onSave }: {
  match: PredictMatch;
  saved?: MatchPrediction;
  draft: { home: string; away: string; advancing: "home" | "away" | "" };
  onUpdate: (patch: Partial<Draft[number]>) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const locked = isLocked(match) || Boolean(saved);
  const lockedLabel = saved ? "Збережено" : "Закрито";

  return (
    <form onSubmit={onSave} className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
      <div className="grid gap-3 border-b border-[#2937da]/10 bg-[#f3f3f6] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="t-label">{stageLabels[match.stage]}{match.groupName ? ` ${match.groupName}` : ""}</div>
          <div className="mt-1 font-semibold text-[#343434]">{formatKyivDate(match.matchDate)} Kyiv</div>
        </div>
        {locked && (
          <span className="inline-flex items-center gap-2 rounded-md bg-[#2937da]/10 px-3 py-2 text-sm font-semibold text-[#2937da]">
            <Lock className="h-4 w-4" /> {lockedLabel}
          </span>
        )}
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-center">
        <TeamPick code={match.homeCode} name={match.homeTeam} />
        <div className="grid grid-cols-[72px_auto_72px] items-center justify-center gap-2">
          <Input
            className="h-12 bg-white text-center text-lg font-bold text-[#343434]"
            inputMode="numeric"
            value={draft.home}
            disabled={locked}
            onChange={event => onUpdate({ home: event.target.value })}
          />
          <span className="font-heading text-2xl text-[#2937da]">:</span>
          <Input
            className="h-12 bg-white text-center text-lg font-bold text-[#343434]"
            inputMode="numeric"
            value={draft.away}
            disabled={locked}
            onChange={event => onUpdate({ away: event.target.value })}
          />
        </div>
        <TeamPick code={match.awayCode} name={match.awayTeam} align="right" />
        {!saved && (
          <Button disabled={locked} className="h-11 rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4] disabled:bg-[#2937da]/40 disabled:text-white">
            <Save className="mr-2 h-4 w-4" /> Зберегти
          </Button>
        )}
      </div>

      {match.stage !== "group" && (
        <div className="grid gap-2 border-t border-[#2937da]/10 p-4 sm:grid-cols-[160px_1fr_1fr] sm:items-center">
          <div className="t-label">Хто пройде далі</div>
          <Choice label={match.homeTeam} active={draft.advancing === "home"} disabled={locked} onClick={() => onUpdate({ advancing: "home" })} />
          <Choice label={match.awayTeam} active={draft.advancing === "away"} disabled={locked} onClick={() => onUpdate({ advancing: "away" })} />
        </div>
      )}

      {saved && (
        <div className="border-t border-[#2937da]/10 bg-[#f3f3f6] px-4 py-3 text-sm text-[#343434]/75">
          Прогноз: {saved.predictedHomeScore}:{saved.predictedAwayScore}. Очки: {saved.pointsOutcome + saved.pointsAdvancing}.
        </div>
      )}
    </form>
  );
}

function TeamPick({ code, name, align = "left" }: { code: string; name: string; align?: "left" | "right" }) {
  const isPlaceholder = name === "TBD";

  return (
    <div className={`min-w-0 ${align === "right" ? "lg:text-right" : ""}`}>
      <div className="t-label">{code}</div>
      <div className="truncate font-heading text-2xl text-[#343434]">{isPlaceholder ? "Буде визначено" : name}</div>
    </div>
  );
}

function Choice({ label, active, disabled, onClick }: { label: string; active: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-10 rounded-md border px-3 text-sm font-semibold transition-colors ${
        active ? "border-[#bbf903] bg-[#bbf903] text-[#111111]" : "border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
