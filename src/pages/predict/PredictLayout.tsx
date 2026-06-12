import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CalendarDays, Shield, Trophy, UserRound } from "lucide-react";
import { getCurrentPredictUser } from "@/lib/predictStore";
import type { PredictUser } from "@/data/predictData";

const links = [
  { to: "/predict", label: "Огляд", icon: Trophy },
  { to: "/predict/predictions", label: "Прогнози", icon: Shield },
  { to: "/predict/leaderboard", label: "Лідери", icon: BarChart3 },
  { to: "/predict/matches", label: "Матчі", icon: CalendarDays },
  { to: "/predict/profile", label: "Профіль", icon: UserRound },
];

export default function PredictLayout() {
  const [user, setUser] = useState<PredictUser | null>(null);

  useEffect(() => {
    getCurrentPredictUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="coax-light min-h-screen">
      <div className="sticky top-0 z-40 border-b border-[#2937da]/15 bg-white/95 backdrop-blur">
        <div className="content-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-4">
          <div className="flex items-center justify-between gap-3">
            <NavLink
              to="/"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-[#2937da]/20 bg-white px-3 text-sm font-semibold text-[#2937da] transition-colors hover:bg-[#2937da] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              До BPL
            </NavLink>
            <div className="min-w-0 text-right sm:text-left">
              <div className="page-kicker">Fantasy World Cup 2026</div>
              <h1 className="h-section text-[#2937da]">BPL Predict</h1>
            </div>
          </div>
          <PredictNav user={user} className="hidden lg:flex lg:justify-end" />
        </div>
        <div className="content-shell pb-3 lg:hidden">
          <PredictMobileNav user={user} />
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function PredictNav({
  user,
  className,
}: {
  user: PredictUser | null;
  className?: string;
}) {
  return (
    <nav className={`gap-2 ${className ?? ""}`}>
      {links.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/predict"}
            className={({ isActive }) =>
              `inline-flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
                  : "border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
      {user?.isAdmin && (
        <NavLink
          to="/predict/admin"
          className={({ isActive }) =>
            `inline-flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
              isActive
                ? "border-[#bbf903] bg-[#bbf903] text-[#111111]"
                : "border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white"
            }`
          }
        >
          Admin
        </NavLink>
      )}
    </nav>
  );
}

function PredictMobileNav({ user }: { user: PredictUser | null }) {
  const items = user?.isAdmin ? [...links.slice(0, 4), { to: "/predict/admin", label: "Адмін", icon: Shield }] : links;

  return (
    <nav className="grid grid-cols-5 overflow-hidden rounded-md border border-[#2937da]/15 bg-white p-1 shadow-[0_12px_28px_rgba(41,55,218,0.16)]">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/predict"}
            className={({ isActive }) =>
              `flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[6px] px-1 text-[0.64rem] font-bold leading-none transition-colors ${
                isActive ? "bg-[#2937da] text-white" : "text-[#2937da]"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
