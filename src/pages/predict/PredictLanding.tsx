import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LockKeyhole, Medal, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentPredictUser, getPredictUsers } from "@/lib/predictStore";
import { predictMatches, type PredictUser } from "@/data/predictData";

export default function PredictLanding() {
  const [user, setUser] = useState<PredictUser | null>(null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    getCurrentPredictUser().then(setUser).catch(() => setUser(null));
    getPredictUsers().then(users => setUserCount(users.filter(item => !item.isAdmin).length)).catch(() => setUserCount(0));
  }, []);

  const stats = [
    { label: "Команд", value: "48" },
    { label: "Матчі", value: predictMatches.length },
    { label: "Гравців", value: userCount },
    { label: "Фінал", value: "19.07" },
  ];

  return (
    <main className="content-shell py-6 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-md border border-[#2937da]/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2937da] shadow-sm">
            11 червня - 19 липня 2026
          </div>
          <h2 className="max-w-3xl font-heading text-[3.2rem] leading-[0.9] tracking-normal text-[#343434] sm:text-6xl">Прогнозуй чемпіонат світу з друзями</h2>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-[#343434]/75 sm:text-base">
            BPL Predict додає до Bro Premier League окрему гру прогнозів: обираєш рахунок,
            збираєш очки за точність і борешся за перше місце в лідерборді.
          </p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-row">
            <Button asChild className="h-[52px] rounded-md bg-[#2937da] px-5 text-base font-bold text-white shadow-[0_16px_34px_rgba(41,55,218,0.22)] hover:bg-[#1f2ab4] sm:h-12">
              <Link to={user ? "/predict/predictions" : "/predict/login"}>
                {user ? "Мої прогнози" : "Увійти"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" className="h-12 rounded-md border-[#2937da]/25 bg-white px-5 text-[#2937da] hover:bg-[#2937da] hover:text-white">
                <Link to="/predict/register">Зареєструватись з кодом</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white shadow-[0_18px_48px_rgba(41,55,218,0.08)]">
          <div className="brand-stripe h-1" />
          <div className="grid grid-cols-4 gap-px bg-[#2937da]/10 sm:grid-cols-2">
            {stats.map(item => (
              <div key={item.label} className="bg-white px-3 py-4 sm:p-5">
                <div className="h-stat text-[#2937da]">{item.value}</div>
                <div className="mt-1 text-[0.62rem] font-semibold uppercase tracking-wide text-[#343434]/60 sm:text-xs">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
            {[
              { icon: ShieldCheck, title: "Ставки на матчі", text: "Вгадай переможця або нічию — 5 балів. Точний рахунок — 10." },
              { icon: Trophy, title: "Турнірні прогнози", text: "Чемпіон, фіналіст, бомбардир і темна конячка зберігаються при реєстрації." },
              { icon: LockKeyhole, title: "Інвайти", text: "Кожен гравець має власний код і три запрошення." },
              { icon: Medal, title: "Плей-офф", text: "Окремі 5 балів за команду, яка пройде далі." },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="grid grid-cols-[44px_1fr] gap-3 rounded-md bg-[#f7f7fb] p-3 sm:bg-transparent sm:p-0">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#2937da] text-white shadow-[0_10px_24px_rgba(41,55,218,0.22)] sm:h-10 sm:w-10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-2xl leading-none tracking-normal text-[#343434] sm:text-xl">{item.title}</h3>
                    <p className="t-meta mt-1">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
