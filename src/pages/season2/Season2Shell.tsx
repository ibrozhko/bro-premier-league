import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Twitch, X, Youtube } from "lucide-react";
import logoSeason2 from "@/assets/logo-season2-orange.png";
import { season2Summary } from "@/data/season2Data";

const season2BasePath = "";
const season2Path = (path = "") => `${season2BasePath}${path}` || "/";

const links = [
  { path: season2Path(), label: "Сезон 2", highlight: true },
  { path: season2Path("/matches"), label: "Матчі", highlight: false },
  { path: season2Path("/players"), label: "Гравці", highlight: false },
  { path: season2Path("/top-scorers"), label: "Бомбардири", highlight: false },
  { path: season2Path("/best-defense"), label: "Захист", highlight: false },
  { path: "/world-cup-2026", label: "ЧС 2026", highlight: false },
] as const;

const mobileLinks = [
  ...links,
  { path: season2Path("/cabinet"), label: "Кабінет", highlight: false },
] as const;

const channels = [
  { href: "https://www.twitch.tv/bpl2026", label: "Twitch 1", icon: Twitch },
  { href: "https://www.twitch.tv/bpl2027", label: "Twitch 2", icon: Twitch },
  { href: "https://www.youtube.com/@BroPremierLeague", label: "YouTube", icon: Youtube },
] as const;

const twitchChannels = channels.filter(channel => channel.icon === Twitch);
const youtubeChannel = channels.find(channel => channel.icon === Youtube);

export default function Season2Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Bro Premier League Season 2 — FC 26";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = `Bro Premier League Season 2: приватна FC 26 ліга, ${season2Summary.players} гравців, ${season2Summary.rounds} турів, ${season2Summary.matches} матчів, старт 08.08.2026.`;
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#111111]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111111] text-[#f7f7f2] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:h-16 sm:px-5">
          <Link to={season2Path()} className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#f7f7f2] p-0.5 shadow-[0_0_0_2px_#bbf903] sm:h-10 sm:w-10 sm:p-1">
              <img src={logoSeason2} alt="BPL" className="h-[124%] w-[124%] max-w-none object-contain" />
            </span>
            <span className="font-heading text-xl tracking-wider sm:text-2xl">BPL</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(link => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                    active || link.highlight ? "bg-[#bbf903] text-[#111111]" : "text-[#f7f7f2]/78 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <div className="group relative">
              <button
                type="button"
                aria-label="Twitch channels"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#bbf903] text-[#111111] transition-colors hover:bg-[#ff5a1f] hover:text-white"
              >
                <Twitch className="h-4 w-4" />
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-44 translate-y-2 rounded-md border border-white/10 bg-[#111111] p-1 opacity-0 shadow-[0_18px_44px_rgba(0,0,0,0.35)] transition-all group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                {twitchChannels.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md px-3 py-2 text-sm font-bold text-[#f7f7f2]/82 transition-colors hover:bg-[#bbf903] hover:text-[#111111]"
                  >
                    {link.label === "Twitch 1" ? "BPL Twitch" : "BPL Twitch 2"}
                  </a>
                ))}
              </div>
            </div>
            {youtubeChannel && (
              <a
                href={youtubeChannel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={youtubeChannel.label}
                title={youtubeChannel.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#bbf903] text-[#111111] transition-colors hover:bg-[#ff5a1f] hover:text-white"
              >
                <Youtube className="h-4 w-4" />
              </a>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(open => !open)}
            className="inline-flex h-9 w-9 items-center justify-center text-[#f7f7f2] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/20 bg-[#111111] px-4 pb-4 lg:hidden">
            <div className="mx-auto max-w-5xl">
              <nav>
                {mobileLinks.map(link => {
                  const active = location.pathname === link.path;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block border-b border-white/10 py-3 text-sm font-bold last:border-0 ${
                        active || link.highlight ? "text-[#bbf903]" : "text-[#f7f7f2]/82"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {channels.map(link => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#bbf903] px-2 py-2 text-xs font-bold text-[#111111]"
                      aria-label={link.label}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {children}

      <footer className="bg-[#111111] py-10 text-[#f7f7f2]">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr_1.05fr]">
            <div>
              <Link to={season2Path()} className="inline-flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#f7f7f2] p-1.5">
                  <img src={logoSeason2} alt="BPL" className="h-[124%] w-[124%] max-w-none object-contain" />
                </span>
                <span className="font-heading text-3xl leading-none">Bro Premier League</span>
              </Link>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#f7f7f2]/68">
                Season 2 · {season2Summary.players} гравців · {season2Summary.rounds} турів · {season2Summary.matches} матчів.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-4xl leading-none text-white">Правила</h2>
              <div className="mt-4 space-y-2 text-base leading-6 text-[#f7f7f2]/72">
                <p>Формат: кожен з кожним у два кола</p>
                <p>Перемога — 3 очки</p>
                <p>Нічия — 1 очко</p>
                <p>Темп: тур у суботу + тур у неділю</p>
                <p>У кожному турі один гравець відпочиває</p>
                <p>Тайбрейк: очки → різниця → забиті</p>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-4xl leading-none text-white">Стежити за лігою</h2>
              <div className="mt-4 space-y-3">
                {channels.map(link => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 items-center gap-3 rounded-md border border-white/18 bg-white/[0.04] px-4 text-base font-bold text-white transition-colors hover:border-[#bbf903] hover:text-[#bbf903]"
                    >
                      <Icon className={link.label === "Twitch 2" ? "h-5 w-5 text-[#bbf903]" : "h-5 w-5 text-[#ff5a1f]"} />
                      {link.label === "Twitch 1" ? "BPL на Twitch" : link.label === "Twitch 2" ? "BPL на Twitch 2" : "BPL на YouTube"}
                    </a>
                  );
                })}
              </div>
              <p className="mt-4 text-sm leading-6 text-[#f7f7f2]/58">Трансляції матчів і турнірів у прямому ефірі.</p>
            </div>
          </div>

          <div className="mt-10 border-t border-white/14 pt-6 text-center text-sm text-[#f7f7f2]/58">
            © 2026 Bro Premier League. Всі права захищені.
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Season2PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-5 pt-7 sm:px-5 sm:pb-6 sm:pt-12">
      <div className="text-xs font-extrabold uppercase tracking-wide text-[#ff5a1f]">{eyebrow}</div>
      <h1 className="mt-2 font-heading text-4xl leading-none sm:text-7xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#111111]/68 sm:text-lg sm:leading-7">{text}</p>
    </div>
  );
}
