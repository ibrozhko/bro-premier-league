import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatKyivDate, getTeamLabel, predictMatches, stageLabels, statusLabels, type MatchStage, type PredictMatch } from "@/data/predictData";
import { getPredictMatches } from "@/lib/predictStore";

type StageFilter = MatchStage | "all" | "knockout";

function sortByKickoff(matches: PredictMatch[]) {
  return [...matches].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime() || a.id - b.id);
}

export default function PredictMatches() {
  const [stage, setStage] = useState<StageFilter>("all");
  const [matchList, setMatchList] = useState<PredictMatch[]>(predictMatches);

  useEffect(() => {
    getPredictMatches().then(setMatchList).catch(() => setMatchList(predictMatches));
  }, []);

  const matches = useMemo(() => {
    const filtered =
      stage === "all"
        ? matchList
        : stage === "knockout"
          ? matchList.filter(match => match.stage !== "group")
          : matchList.filter(match => match.stage === stage);

    return sortByKickoff(filtered);
  }, [matchList, stage]);

  const filters: StageFilter[] = ["all", "group", "knockout", "round_of_32", "round_of_16", "quarterfinal", "semifinal", "final"];

  return (
    <main className="content-shell py-10">
      <div className="page-header">
        <div className="page-kicker">104 матчі</div>
        <h2 className="h-page">Матчі та результати</h2>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setStage(filter)}
            className={stage === filter ? "filter-chip-active" : "filter-chip"}
          >
            {stageLabels[filter]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {matches.map(match => (
          <div key={match.id} className="grid gap-3 rounded-md border border-[#2937da]/15 bg-white p-4 sm:grid-cols-[120px_minmax(0,1fr)_124px] sm:items-center">
            <div>
              <div className="t-label">{stageLabels[match.stage]}{match.groupName ? ` ${match.groupName}` : ""}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-[#343434]/70">
                <CalendarDays className="h-3.5 w-3.5" /> {formatKyivDate(match.matchDate)}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <Team code={match.homeCode} name={match.homeTeam} align="right" />
              <div className="min-w-[64px] text-center font-heading text-2xl text-[#2937da]">
                {match.homeScore === null ? "VS" : `${match.homeScore}-${match.awayScore}`}
              </div>
              <Team code={match.awayCode} name={match.awayTeam} align="left" />
            </div>
            <div className="text-left sm:text-right">
              <span className={`inline-flex w-fit justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-bold uppercase sm:w-full ${
                match.status === "finished" ? "bg-green-100 text-green-700" : match.status === "live" ? "bg-red-100 text-red-700" : "bg-[#2937da]/10 text-[#2937da]"
              }`}>
                {statusLabels[match.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Team({ code, name, align }: { code: string; name: string; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      <div className="font-semibold text-[#343434] truncate">{getTeamLabel(name)}</div>
      <div className="t-meta">{code}</div>
    </div>
  );
}
