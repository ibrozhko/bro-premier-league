import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatKyivDate, predictMatches, stageLabels, type MatchStage } from "@/data/predictData";

type StageFilter = MatchStage | "all" | "knockout";

export default function PredictMatches() {
  const [stage, setStage] = useState<StageFilter>("all");
  const matches = useMemo(() => {
    if (stage === "all") return predictMatches;
    if (stage === "knockout") return predictMatches.filter(match => match.stage !== "group");
    return predictMatches.filter(match => match.stage === stage);
  }, [stage]);

  const filters: StageFilter[] = ["all", "group", "knockout", "round_of_32", "round_of_16", "quarterfinal", "semifinal", "final"];

  return (
    <main className="content-shell py-10">
      <div className="page-header">
        <div className="page-kicker">104 матчі</div>
        <h2 className="h-page">Матчі та результати</h2>
      </div>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
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
          <div key={match.id} className="grid gap-3 rounded-md border border-[#2937da]/15 bg-white p-4 sm:grid-cols-[120px_1fr_92px] sm:items-center">
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
              <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${
                match.status === "finished" ? "bg-green-100 text-green-700" : match.status === "live" ? "bg-red-100 text-red-700" : "bg-[#2937da]/10 text-[#2937da]"
              }`}>
                {match.status}
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
      <div className="font-semibold text-[#343434] truncate">{name}</div>
      <div className="t-meta">{code}</div>
    </div>
  );
}
