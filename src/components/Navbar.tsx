import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useLanguage } from "@/lib/i18n";

const navLinks = [
  { path: "/", labelKey: "nav.home" },
  { path: "/fixtures", labelKey: "nav.fixtures" },
  { path: "/players", labelKey: "nav.players" },
  { path: "/top-scorers", labelKey: "nav.topScorers" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="BPL" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-heading text-xl sm:text-2xl tracking-wider text-foreground">BPL</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === l.path
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}
          <button
            onClick={toggleLanguage}
            className="ml-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Toggle language"
          >
            {language === "uk" ? "EN" : "UA"}
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium border-b border-border last:border-0 ${
                location.pathname === l.path ? "text-primary" : "text-muted-foreground"
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
            className="mt-3 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
            aria-label="Toggle language"
          >
            {language === "uk" ? "English" : "Українська"}
          </button>
        </div>
      )}
    </nav>
  );
}
