import { Twitch, Youtube } from "lucide-react";
import logo from "@/assets/logo.svg";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="BPL" className="h-10 w-10 rounded-full object-cover" />
              <span className="h-card">Bro Premier League</span>
            </div>
            <p className="t-meta leading-relaxed">
              Приватна ліга FC 26 · Сезон 1 · 9 гравців · 18 турів · 72 матчі.
              Подвійне коло · Квітень – Червень 2026.
            </p>
          </div>

          {/* Rules */}
          <div>
            <h3 className="h-card mb-3">Правила</h3>
            <ul className="t-meta space-y-1.5">
              <li>Перемога — 3 очки</li>
              <li>Нічия — 1 очко</li>
              <li>Поразка — 0 очок</li>
              <li>Тайбрейк: очки → різниця голів → голи забиті</li>
              <li>Кожен тур — 4 матчі + 1 відпочиває</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="h-card mb-3">Стежити за лігою</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.twitch.tv/bpl2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <Twitch className="h-5 w-5 text-purple-400" />
                <span>BPL на Twitch</span>
              </a>
              <a
                href="https://www.youtube.com/@BroPremierLeague"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <Youtube className="h-5 w-5 text-red-500" />
                <span>BPL на YouTube</span>
              </a>
              <a
                href="https://send.monobank.ua/jar/A3ngJfhe2x"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <span className="text-lg">🏦</span>
                <span>На розвиток ліги</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Трансляції матчів та турнірів у прямому ефірі.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2026 Bro Premier League. Всі права захищені.
        </div>
      </div>
    </footer>
  );
}
