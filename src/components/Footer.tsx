import { Twitch, Youtube } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="content-shell py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="BPL" className="h-10 w-10 rounded-full object-cover" />
              <span className="h-card">Bro Premier League</span>
            </div>
            <p className="t-meta leading-relaxed">
              {t("footer.about")}
            </p>
          </div>

          {/* Rules */}
          <div>
            <h3 className="h-card mb-3">{t("footer.rules")}</h3>
            <ul className="t-meta space-y-1.5">
              <li>{t("footer.ruleWin")}</li>
              <li>{t("footer.ruleDraw")}</li>
              <li>{t("footer.ruleLoss")}</li>
              <li>{t("footer.ruleTiebreak")}</li>
              <li>{t("footer.ruleRound")}</li>
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
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <Twitch className="h-5 w-5 text-purple-400" />
                <span>{t("footer.twitch")}</span>
              </a>
              <a
                href="https://www.youtube.com/@BroPremierLeague"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <Youtube className="h-5 w-5 text-red-500" />
                <span>{t("footer.youtube")}</span>
              </a>
              <a
                href="https://send.monobank.ua/jar/A3ngJfhe2x"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium"
              >
                <span className="text-lg">🏦</span>
                <span>{t("footer.support")}</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              {t("footer.live")}
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
