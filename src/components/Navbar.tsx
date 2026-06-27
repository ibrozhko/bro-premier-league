import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import { useLanguage } from "@/lib/i18n";

const navLinks = [
  { path: "/", labelKey: "nav.worldCup" },
  { path: "/fixtures", labelKey: "nav.fixtures" },
  { path: "/top-scorers", labelKey: "nav.topScorers" },
  { path: "/best-defense", labelKey: "nav.bestDefense" },
  { path: "/predict", labelKey: "nav.predict" },
] as const;

const worldCupPaths = ["/", "/world-cup-2026", "/fixtures", "/players", "/top-scorers", "/best-defense"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const isWorldCup = worldCupPaths.includes(location.pathname);

  return (
    <nav className={`sticky top-0 z-50 border-b ${isWorldCup ? "border-[#ff008c] bg-[#ff008c] text-white shadow-[0_10px_30px_rgba(255,0,140,0.16)]" : "border-white/20 bg-background"}`}>
      <div className="content-shell flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-1 brand-glow">
            <img src={logoFull} alt="BPL" className="h-[124%] w-[124%] max-w-none object-contain" />
          </span>
          <span className={`font-heading text-xl sm:text-2xl tracking-wider ${isWorldCup ? "text-white" : "text-foreground"}`}>BPL</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === l.path || (l.path !== "/" && location.pathname.startsWith(l.path))
                  ? isWorldCup ? "bg-[#bbf903] text-[#111111]" : "bg-accent text-accent-foreground"
                  : isWorldCup ? "text-white/85 hover:bg-white/15 hover:text-white" : "text-white/80 hover:text-foreground hover:bg-white/10 hover:shadow-[inset_0_-2px_0_hsl(var(--accent))]"
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}
          <button
            onClick={toggleLanguage}
            className={`ml-2 rounded-md border px-3 py-2 text-xs font-semibold ${
              isWorldCup
                ? "border-white/30 text-white hover:border-[#bbf903] hover:bg-[#bbf903] hover:text-[#111111]"
                : "border-white/30 text-white hover:border-accent hover:bg-accent hover:text-accent-foreground"
            }`}
            aria-label="Toggle language"
          >
            {language === "uk" ? "EN" : "UA"}
          </button>
        </div>

        <button className={`md:hidden ${isWorldCup ? "text-white" : "text-foreground"}`} onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className={`md:hidden border-t px-4 pb-4 ${isWorldCup ? "border-white/20 bg-[#ff008c]" : "border-white/20 bg-background"}`}>
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-border last:border-0 ${
                location.pathname === l.path || (l.path !== "/" && location.pathname.startsWith(l.path))
                  ? isWorldCup ? "text-[#bbf903]" : "text-accent"
                  : isWorldCup ? "text-white/85" : "text-white/80"
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}
          <button
            onClick={() => {
              toggleLanguage();
              setOpen(false);
            }}
            className={`mt-3 rounded-md border px-3 py-2 text-xs font-semibold ${
              isWorldCup ? "border-white/30 text-white" : "border-white/30 text-white"
            }`}
            aria-label="Toggle language"
          >
            {language === "uk" ? "English" : "Українська"}
          </button>
        </div>
      )}
    </nav>
  );
}
