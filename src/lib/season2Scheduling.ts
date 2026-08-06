import type { Season2Match } from "@/data/season2Data";
import { apiFetch } from "./season2Predictions";

export type Season2ScheduleDayStatus = "pending" | "available" | "reschedule";
export type Season2ScheduleStatus = "pending" | "day_confirmed" | "negotiating" | "scheduled" | "postponed";

export type Season2MatchSchedule = {
  matchId: string;
  round: number;
  homePlayerId: string;
  awayPlayerId: string;
  homeDayStatus: Season2ScheduleDayStatus;
  awayDayStatus: Season2ScheduleDayStatus;
  homeProposedTime: string | null;
  awayProposedTime: string | null;
  agreedTime: string | null;
  status: Season2ScheduleStatus;
  updatedByPlayerId: string | null;
  updatedAt: string;
};

type DbMatchSchedule = {
  match_id: string;
  round: number;
  home_player_id: string;
  away_player_id: string;
  home_day_status: Season2ScheduleDayStatus;
  away_day_status: Season2ScheduleDayStatus;
  home_proposed_time: string | null;
  away_proposed_time: string | null;
  agreed_time: string | null;
  status: Season2ScheduleStatus;
  updated_by_player_id: string | null;
  updated_at: string;
};

type SaveSchedulePayload = {
  match: Season2Match;
  action: "day-status" | "propose-time" | "accept-time";
  dayStatus?: Season2ScheduleDayStatus;
  time?: string;
};

export async function loadSeason2MatchSchedules() {
  try {
    const payload = await apiFetch<{ schedules: DbMatchSchedule[] }>("/api/season2?resource=match-scheduling");
    return Object.fromEntries(payload.schedules.map(row => [row.match_id, toClientSchedule(row)]));
  } catch {
    return {} as Record<string, Season2MatchSchedule>;
  }
}

export async function saveSeason2MatchSchedule(payload: SaveSchedulePayload) {
  const response = await apiFetch<{ schedule: DbMatchSchedule }>("/api/season2?resource=match-scheduling", {
    method: "POST",
    body: JSON.stringify({
      matchId: payload.match.id,
      round: payload.match.round,
      homePlayerId: payload.match.home.id,
      awayPlayerId: payload.match.away.id,
      action: payload.action,
      dayStatus: payload.dayStatus,
      time: payload.time,
      matchLabel: `${payload.match.home.name} - ${payload.match.away.name}`,
      dayLabel: payload.match.dayLabel,
    }),
  });

  return toClientSchedule(response.schedule);
}

export function getScheduleBadge(schedule: Season2MatchSchedule | undefined) {
  if (!schedule) return null;
  if (schedule.status === "scheduled" && schedule.agreedTime) return `О ${schedule.agreedTime}`;
  if (schedule.status === "postponed") return "Перенесено";
  if (schedule.status === "negotiating") return "Домовляються";
  if (schedule.status === "day_confirmed") return "День ок";
  return null;
}

function toClientSchedule(row: DbMatchSchedule): Season2MatchSchedule {
  return {
    matchId: row.match_id,
    round: row.round,
    homePlayerId: row.home_player_id,
    awayPlayerId: row.away_player_id,
    homeDayStatus: row.home_day_status,
    awayDayStatus: row.away_day_status,
    homeProposedTime: row.home_proposed_time,
    awayProposedTime: row.away_proposed_time,
    agreedTime: row.agreed_time,
    status: row.status,
    updatedByPlayerId: row.updated_by_player_id,
    updatedAt: row.updated_at,
  };
}
