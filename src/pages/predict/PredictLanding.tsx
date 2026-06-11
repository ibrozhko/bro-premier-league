import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Medal, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentPredictUser, getPredictUsers } from "@/lib/predictStore";
import { predictMatches } from "@/data/predictData";

export default function PredictLanding() {
  const navigate = useNavigate();
  const users = getPredictUsers();

  useEffect(() => {
    if (getCurrentPredictUser()) {
      navigate("/predict/predictions", { replace: true });
    }
  }, [navigate]);

  const stats = [
    { label: "Команд", value: "48" },
    { label: "Матчі", value: predictMatches.length },
    { label: "Гравців", value: users.length },
    { label: "Фінал", value: "19.07" },
  ];

  return (
    <main className="content-shell py-10">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-md border border-[#2937da]/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2937da]">
            11 червня - 19 липня 2026
          </div>
          <h2 className="h-page max-w-3xl">Прогнозуй чемпіонат світу з друзями</h2>
          <p className="t-body mt-4 max-w-2xl text-[#343434]/75">
            BPL Predict додає до Bro Premier League окрему гру прогнозів: обираєш рахунок,
            збираєш очки за точність і борешся за перше місце в лідерборді.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-md bg-[#2937da] px-5 text-white hover:bg-[#1f2ab4]">
              <Link to="/predict/login">
                Увійти <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-md border-[#2937da]/25 bg-white px-5 text-[#2937da] hover:bg-[#2937da] hover:text-white">
              <Link to="/predict/register">Зареєструватись з кодом</Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
          <div className="brand-stripe h-1" />
          <div className="grid grid-cols-2 gap-px bg-[#2937da]/10">
            {stats.map(item => (
              <div key={item.label} className="bg-white p-5">
                <div className="h-stat text-[#2937da]">{item.value}</div>
                <div className="t-label mt-1">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-4 p-5">
            {[
              { icon: ShieldCheck, title: "Ставки на матчі", text: "Вгадай переможця або нічию — 5 балів. Точний рахунок — 10." },
              { icon: Trophy, title: "Турнірні прогнози", text: "Чемпіон, фіналіст, бомбардир і темна конячка зберігаються при реєстрації." },
              { icon: LockKeyhole, title: "Інвайти", text: "Кожен гравець має власний код і три запрошення." },
              { icon: Medal, title: "Плей-офф", text: "Окремі 5 балів за команду, яка пройде далі." },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="grid grid-cols-[40px_1fr] gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#2937da] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-xl leading-tight text-[#343434]">{item.title}</h3>
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
