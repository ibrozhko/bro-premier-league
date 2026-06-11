import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CalendarDays, Menu, Shield, Trophy, UserRound, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getCurrentPredictUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="coax-light min-h-screen">
      <div className="border-b border-[#2937da]/15 bg-white">
        <div className="content-shell flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <NavLink
              to="/"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-[#2937da]/20 bg-white px-3 text-sm font-semibold text-[#2937da] transition-colors hover:bg-[#2937da] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              До BPL
            </NavLink>
            <div>
              <div className="page-kicker">Fantasy World Cup 2026</div>
              <h1 className="h-section text-[#2937da]">BPL Predict</h1>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#2937da]/20 bg-white px-3 text-sm font-semibold text-[#2937da] transition-colors hover:bg-[#2937da] hover:text-white lg:hidden"
            onClick={() => setMenuOpen(current => !current)}
            aria-expanded={menuOpen}
            aria-controls="predict-mobile-nav"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Меню
          </button>
          <PredictNav user={user} onNavigate={() => setMenuOpen(false)} className="hidden lg:flex lg:justify-end" />
        </div>
        {menuOpen && (
          <PredictNav
            user={user}
            onNavigate={() => setMenuOpen(false)}
            id="predict-mobile-nav"
            className="grid gap-2 border-t border-[#2937da]/10 pb-4 pt-3 lg:hidden"
          />
        )}
      </div>
      <Outlet />
    </div>
  );
}

function PredictNav({
  user,
  onNavigate,
  className,
  id,
}: {
  user: PredictUser | null;
  onNavigate: () => void;
  className?: string;
  id?: string;
}) {
  return (
    <nav id={id} className={`gap-2 ${className ?? ""}`}>
      {links.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/predict"}
            onClick={onNavigate}
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
          onClick={onNavigate}
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
