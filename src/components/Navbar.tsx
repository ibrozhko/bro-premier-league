import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Crown } from "lucide-react";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/standings", label: "Standings" },
  { path: "/fixtures", label: "Fixtures" },
  { path: "/players", label: "Players" },
  { path: "/top-scorers", label: "Top Scorers" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Crown className="h-8 w-8 text-accent" />
          <span className="font-heading text-2xl tracking-wider text-foreground">BPL</span>
        </Link>

        {/* Desktop */}
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
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
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
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
