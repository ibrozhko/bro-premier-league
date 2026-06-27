import { useLocation } from "react-router-dom";
import { Twitch, Youtube } from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import { useLanguage } from "@/lib/i18n";

const worldCupPaths = ["/", "/world-cup-2026", "/fixtures", "/players", "/top-scorers", "/best-defense"];

export default function Footer() {
  const { t } = useLanguage();
  const location = useLocation();
  const isWorldCup = worldCupPaths.includes(location.pathname);
  const about = isWorldCup
    ? "BPL World Cup 2026 · 15 гравців · 3 групи по 5 · плей-оф на 8 учасників · фінал 19.07.2026."
    : t("footer.about");
  const rules = isWorldCup
    ? [
        "Група: кожен з кожним, одна гра",
        "Перемога — 3 очки",
        "Нічия — 1 очко",
        "Вихід: 1-2 місця + 2 найкращі треті",
        "Тайбрейк: очки → різниця → забиті",
      ]
    : [t("footer.ruleWin"), t("footer.ruleDraw"), t("footer.ruleLoss"), t("footer.ruleTiebreak"), t("footer.ruleRound")];

  return (
    <footer className={`border-t ${isWorldCup ? "border-[#ff008c] bg-[#ff008c] text-white" : "border-white/20 bg-background"}`}>
      <div className={`h-px ${isWorldCup ? "bg-[#bbf903]" : "bg-accent"}`} />
      <div className="content-shell py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white p-1 brand-glow">
                <img src={logoFull} alt="BPL" className="h-[124%] w-[124%] max-w-none object-contain" />
              </span>
              <span className="h-card">Bro Premier League</span>
            </div>
            <p className={isWorldCup ? "text-sm leading-relaxed text-white/80" : "t-meta leading-relaxed"}>
              {about}
            </p>
          </div>

          {/* Rules */}
          <div>
            <h3 className="h-card mb-3">{t("footer.rules")}</h3>
            <ul className={isWorldCup ? "space-y-1.5 text-sm text-white/80" : "t-meta space-y-1.5"}>
              {rules.map(rule => <li key={rule}>{rule}</li>)}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="h-card mb-3">{t("footer.follow")}</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.twitch.tv/bpl2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#bbf903] hover:bg-white/20"
              >
                <Twitch className="h-5 w-5 text-purple-400" />
                <span>{t("footer.twitch")}</span>
              </a>
              <a
                href="https://www.twitch.tv/bpl2027"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#bbf903] hover:bg-white/20"
              >
                <Twitch className="h-5 w-5 text-[#bbf903]" />
                <span>{t("footer.twitch2")}</span>
              </a>
              <a
                href="https://www.youtube.com/@BroPremierLeague"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#bbf903] hover:bg-white/20"
              >
                <Youtube className="h-5 w-5 text-red-500" />
                <span>{t("footer.youtube")}</span>
              </a>
              <a
                href="https://send.monobank.ua/jar/A3ngJfhe2x"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:border-[#bbf903] hover:bg-white/20"
              >
                <span className="text-lg">🏦</span>
                <span>{t("footer.support")}</span>
              </a>
            </div>
            <p className={isWorldCup ? "mt-4 text-xs text-white/70" : "text-xs text-muted-foreground mt-4"}>
              {t("footer.live")}
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-xs text-white/70">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
