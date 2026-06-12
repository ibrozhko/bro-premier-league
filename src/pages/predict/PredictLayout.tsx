import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CalendarDays, Shield, Trophy, UserRound } from "lucide-react";
import { getCurrentPredictUser } from "@/lib/predictStore";
import type { PredictUser } from "@/data/predictData";
import logoFull from "@/assets/logo-full.png";

const links = [
  { to: "/predict", label: "Огляд", icon: Trophy },
  { to: "/predict/predictions", label: "Прогнози", icon: Shield },
  { to: "/predict/leaderboard", label: "Лідери", icon: BarChart3 },
  { to: "/predict/matches", label: "Матчі", icon: CalendarDays },
  { to: "/predict/profile", label: "Профіль", icon: UserRound },
];

export default function PredictLayout() {
  const [user, setUser] = useState<PredictUser | null>(null);
  const location = useLocation();
  const isOverview = location.pathname === "/predict";

  useEffect(() => {
    getCurrentPredictUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="coax-light min-h-screen">
      <div
        className={`sticky top-0 z-40 border-b backdrop-blur ${
          isOverview ? "border-white/15 bg-[#2937da]/95" : "border-[#2937da]/15 bg-white/95"
        }`}
      >
        <div className="content-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-4">
          <div className="flex items-center justify-between gap-3">
            <NavLink
              to="/"
              className={`inline-flex h-10 w-fit items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
                isOverview
                  ? "border-white/20 bg-transparent text-white/90 hover:bg-white/10 hover:text-white"
                  : "border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              До BPL
            </NavLink>
            <NavLink to="/predict" className="flex min-w-0 items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 brand-glow">
                <img src={logoFull} alt="BPL Predict" className="h-[124%] w-[124%] max-w-none object-contain" />
              </span>
              <div className="min-w-0 text-right sm:text-left">
                <div className={`page-kicker ${isOverview ? "text-[#bbf903]" : ""}`}>Fantasy World Cup 2026</div>
                <h1 className={`whitespace-nowrap font-heading text-2xl leading-none sm:text-3xl ${isOverview ? "text-white" : "text-[#2937da]"}`}>
                  BPL Predict
                </h1>
              </div>
            </NavLink>
          </div>
          <PredictNav user={user} className="hidden lg:flex lg:justify-end" variant={isOverview ? "dark" : "light"} />
        </div>
        <div className="content-shell pb-3 lg:hidden">
          <PredictMobileNav user={user} variant={isOverview ? "dark" : "light"} />
        </div>
      </div>
      <Outlet />
    </div>
  );
}

function PredictNav({
  user,
  className,
  variant = "light",
}: {
  user: PredictUser | null;
  className?: string;
  variant?: "light" | "dark";
}) {
  const inactiveClass =
    variant === "dark"
      ? "border-transparent bg-transparent text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
      : "border-[#2937da]/20 bg-white text-[#2937da] hover:bg-[#2937da] hover:text-white";

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
                  : inactiveClass
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
                : inactiveClass
            }`
          }
        >
          Admin
        </NavLink>
      )}
    </nav>
  );
}

function PredictMobileNav({ user, variant = "light" }: { user: PredictUser | null; variant?: "light" | "dark" }) {
  const items = user?.isAdmin ? [...links.slice(0, 4), { to: "/predict/admin", label: "Адмін", icon: Shield }] : links;

  return (
    <nav
      className={`grid grid-cols-5 overflow-hidden rounded-md border p-1 shadow-[0_12px_28px_rgba(41,55,218,0.16)] ${
        variant === "dark" ? "border-white/20 bg-[#3441dd]" : "border-[#2937da]/15 bg-white"
      }`}
    >
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/predict"}
            className={({ isActive }) =>
              `flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[6px] px-1 text-[0.64rem] font-bold leading-none transition-colors ${
                isActive
                  ? variant === "dark"
                    ? "bg-[#bbf903] text-[#111111]"
                    : "bg-[#2937da] text-white"
                  : variant === "dark"
                    ? "text-white"
                    : "text-[#2937da]"
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
