import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CalendarDays, Shield, Trophy, UserRound, UsersRound } from "lucide-react";
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

  useEffect(() => {
    getCurrentPredictUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="coax-light flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 border-b border-white/15 bg-[#2937da]/95 backdrop-blur">
        <div className="content-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-4">
          <div className="flex items-center justify-between gap-3">
            <NavLink
              to="/"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-white/20 bg-transparent px-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              До BPL
            </NavLink>
            <NavLink to="/predict" className="flex min-w-0 items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 brand-glow">
                <img src={logoFull} alt="BPL Predict" className="h-[124%] w-[124%] max-w-none object-contain" />
              </span>
              <div className="min-w-0 text-right sm:text-left">
                <div className="page-kicker text-[#bbf903]">Fantasy World Cup 2026</div>
                <h1 className="whitespace-nowrap font-heading text-2xl leading-none text-white sm:text-3xl">
                  BPL Predict
                </h1>
              </div>
            </NavLink>
          </div>
          <PredictNav user={user} className="hidden lg:flex lg:justify-end" />
        </div>
        <div className="content-shell pb-3 lg:hidden">
          <PredictMobileNav user={user} />
        </div>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
      <PredictFooter />
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
  const inactiveClass = "border-transparent bg-transparent text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white";

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

function PredictMobileNav({ user }: { user: PredictUser | null }) {
  const items = user?.isAdmin ? [...links.slice(0, 4), { to: "/predict/admin", label: "Адмін", icon: Shield }] : links;

  return (
    <nav className="grid grid-cols-5 overflow-hidden rounded-md border border-white/20 bg-[#3441dd] p-1 shadow-[0_12px_28px_rgba(41,55,218,0.16)]">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/predict"}
            className={({ isActive }) =>
              `flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[6px] px-1 text-[0.64rem] font-bold leading-none transition-colors ${
                isActive ? "bg-[#bbf903] text-[#111111]" : "text-white"
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

function PredictFooter() {
  return (
    <footer className="mt-12 border-t border-white/20 bg-[#2937da] text-white">
      <div className="h-px bg-[#bbf903]" />
      <div className="content-shell py-8 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-1 brand-glow">
                <img src={logoFull} alt="BPL Predict" className="h-[124%] w-[124%] max-w-none object-contain" />
              </span>
              <div>
                <div className="page-kicker text-[#bbf903]">Fantasy World Cup 2026</div>
                <div className="font-heading text-2xl leading-none">BPL Predict</div>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/70">
              Окрема гра прогнозів для друзів BPL: ставиш рахунок, ловиш точні результати і підіймаєшся в таблиці після синку матчів.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-heading text-xl leading-none">Правила очок</h3>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>Напрям матчу — 5 балів</li>
              <li>Точний рахунок — 10 балів</li>
              <li>Плей-офф — +5 за команду, що проходить далі</li>
              <li>Турнірні прогнози зберігаються при реєстрації</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-heading text-xl leading-none">Швидко перейти</h3>
            <div className="grid gap-2">
              <FooterLink to="/predict/predictions" icon={Shield} label="Мої прогнози" />
              <FooterLink to="/predict/leaderboard" icon={BarChart3} label="Таблиця лідерів" />
              <FooterLink to="/predict/matches" icon={CalendarDays} label="Матчі та результати" />
              <FooterLink to="/predict/profile" icon={UsersRound} label="Профіль та інвайти" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 text-center text-xs text-white/60">
          BPL Predict · Чемпіонат прогнозів для Bro Premier League
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, icon: Icon, label }: { to: string; icon: typeof Shield; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-[#bbf903] hover:bg-white/15 hover:text-white"
    >
      <Icon className="h-4 w-4 text-[#bbf903]" />
      {label}
    </Link>
  );
}
