import { ArrowRight, CalendarDays, Shield, Sparkles, Trophy, Users } from "lucide-react";
import logoSeason2 from "@/assets/logo-season2-orange.png";
import { season2Players, season2Rounds, season2Seed, season2Summary, type Season2Match } from "@/data/season2Data";

const openingWeekendMatches = season2Rounds.slice(0, 2).flatMap(round => round.matches);
const visibleCalendarRounds = season2Rounds.slice(0, 6);

export default function Season2Preview() {
  return (
    <main className="min-h-screen bg-[#111111] text-[#f7f7f2]">
      <header className="border-b border-white/10 bg-[#111111]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#f7f7f2] p-1 shadow-[0_0_0_2px_#ff5a1f]">
              <img src={logoSeason2} alt="BPL" className="h-[124%] w-[124%] max-w-none object-contain" />
            </span>
            <span className="font-heading text-2xl tracking-wider text-[#f7f7f2]">BPL</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {["Сезон 2", "Матчі", "Гравці", "Бомбардири", "Захист"].map((item, index) => (
              <span
                key={item}
                className={`rounded-md px-3 py-2 text-sm font-bold ${index === 0 ? "bg-[#bbf903] text-[#111111]" : "text-[#f7f7f2]/76"}`}
              >
                {item}
              </span>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full border-[22px] border-[#ff5a1f]/50" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#bbf903] to-transparent" />

        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff5a1f]/45 bg-[#ff5a1f]/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#ff5a1f]">
              <Sparkles className="h-4 w-4" />
              Season 2 concept
            </div>
            <h1 className="font-heading text-[3.5rem] leading-none text-[#f7f7f2] sm:text-[5rem] lg:text-[6.6rem]">
              Bro Premier <span className="text-[#f7f7f2]">League</span>
              <span className="block text-[#ff5a1f]">Season 2</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#f7f7f2]/72">
              Новий сезон без синього: темна арена, помаранчева айдентика, лаймові дії і чисті світлі таблиці для швидкого читання.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#season2-matches" className="inline-flex h-12 items-center rounded-md bg-[#bbf903] px-5 text-sm font-extrabold text-[#111111]">
                Дивитись матчі <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#season2-table" className="inline-flex h-12 items-center rounded-md border border-[#ff5a1f] px-5 text-sm font-extrabold text-[#ff5a1f]">
                Турнірна таблиця
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-md border border-white/12 bg-[#181818] text-[#f7f7f2] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="border-b border-white/10 bg-[#111111] px-5 py-4">
                <div className="text-xs font-bold uppercase tracking-wide text-[#ff5a1f]">Season status</div>
                <div className="mt-1 font-heading text-3xl leading-none text-[#f7f7f2]">Старт нового циклу</div>
              </div>
              <div className="mx-auto my-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#f7f7f2] p-3 shadow-[0_18px_38px_rgba(0,0,0,0.3)]">
                <img src={logoSeason2} alt="Bro Premier League Logo" className="h-[124%] w-[124%] max-w-none object-contain" />
              </div>
              <div className="mx-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10">
                <HeroStat label="Гравців" value={String(season2Summary.players)} />
                <HeroStat label="Турів" value={String(season2Summary.rounds)} />
                <HeroStat label="Матчів" value={String(season2Summary.matches)} />
                <HeroStat label="Старт" value="08.08" />
              </div>
              <div className="m-5 rounded-md border border-[#bbf903]/28 bg-[#bbf903]/10 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-[#bbf903]">Календар</div>
                <p className="mt-2 text-sm leading-6 text-[#f7f7f2]/72">
                  Рандом контрольований: seed <span className="font-bold text-[#f7f7f2]">{season2Seed}</span>. Якщо календар сподобається, зафіксуємо його.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f2] py-8 text-[#111111]">
        <div className="mx-auto grid max-w-7xl gap-3 px-5 md:grid-cols-3">
          <InfoCard icon={Trophy} label="Формат" value={`${season2Summary.rounds} турів · ${season2Summary.matches} матчів`} />
          <InfoCard icon={Users} label="Склад" value={`${season2Summary.players} гравців`} />
          <InfoCard icon={CalendarDays} label="Темп" value="субота + неділя" />
        </div>
      </section>

      <section id="season2-matches" className="bg-[#f7f7f2] py-12 text-[#111111]">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeader eyebrow="Match center" title="Матч-центр" text="Перший вікенд сезону: два тури, реальні клуби вже обрані, у кожному турі один гравець відпочиває." />
          <div className="mt-6 overflow-hidden rounded-md border border-[#111111]/12 bg-white">
            <div className="flex items-center justify-between bg-[#111111] px-5 py-4 text-[#f7f7f2]">
              <h3 className="font-heading text-2xl leading-none sm:text-3xl">Стартовий вікенд · 08-09.08</h3>
              <CalendarDays className="h-5 w-5 text-[#bbf903]" />
            </div>
            <div className="divide-y divide-[#111111]/10">
              {openingWeekendMatches.map(match => <MatchRow key={match.id} match={match} />)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f2] pb-14 text-[#111111]">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeader
            eyebrow="Calendar"
            title="Календар сезону"
            text={`Старт ${season2Summary.startDate}, фініш регулярки ${season2Summary.finishDate}. Нижче показані перші 6 турів, повний масив вже згенерований у даних.`}
          />
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {visibleCalendarRounds.map(round => (
              <details key={round.round} className="group overflow-hidden rounded-md border border-[#111111]/12 bg-white" open={round.round <= 2}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#111111] px-4 py-3 text-[#f7f7f2]">
                  <span className="font-heading text-2xl leading-none">
                    Тур {round.round} <span className="text-[#ff5a1f]">·</span> {round.dayLabel}
                  </span>
                  <span className="rounded-md bg-[#bbf903] px-2.5 py-1 text-xs font-extrabold uppercase text-[#111111]">
                    {round.leg === 1 ? "1 коло" : "2 коло"}
                  </span>
                </summary>
                <div className="divide-y divide-[#111111]/10">
                  {round.matches.map(match => (
                    <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
                      <Team name={match.home.name} club={match.home.club} align="right" compact />
                      <div className="rounded-md bg-[#ff5a1f]/12 px-3 py-1 text-center font-heading text-lg leading-none text-[#ff5a1f]">VS</div>
                      <Team name={match.away.name} club={match.away.club} compact />
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="season2-table" className="bg-[#f7f7f2] pb-14 text-[#111111]">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeader eyebrow="League table" title="Турнірна таблиця" text="Світла таблиця лишається максимально читабельною, а бренд сезону видно в акцентах." />
          <div className="mt-6 overflow-hidden rounded-md border border-[#111111]/12 bg-white">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#111111] text-[#f7f7f2]">
                <tr className="text-xs uppercase tracking-wide">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Гравець</th>
                  <th className="px-4 py-3">Клуб</th>
                  <th className="px-4 py-3">І</th>
                  <th className="px-4 py-3">О</th>
                  <th className="px-4 py-3">Голи</th>
                  <th className="px-4 py-3">Різн.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/10">
                {season2Players.map((player, index) => (
                  <tr key={player.name}>
                    <td className="px-4 py-4 font-heading text-2xl text-[#ff5a1f]">{index + 1}</td>
                    <td className="px-4 py-4 text-lg font-bold">{player.name}</td>
                    <td className="px-4 py-4 text-[#111111]/65">
                      {player.club}
                      {player.platform && <span className="ml-2 text-xs font-bold uppercase text-[#111111]/35">{player.platform}</span>}
                    </td>
                    <td className="px-4 py-4 font-semibold">0</td>
                    <td className="px-4 py-4 font-heading text-2xl text-[#ff5a1f]">0</td>
                    <td className="px-4 py-4 font-semibold">0</td>
                    <td className="px-4 py-4 font-semibold">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111111] py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#ff5a1f]">Season 2</div>
            <h2 className="mt-2 font-heading text-4xl leading-none text-[#f7f7f2] sm:text-5xl">Готово до старту</h2>
          </div>
          <a href="#season2-matches" className="inline-flex h-12 items-center rounded-md bg-[#bbf903] px-5 text-sm font-extrabold text-[#111111]">
            До матчів <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#181818] p-4">
      <div className="text-[0.7rem] font-bold uppercase tracking-wide text-[#f7f7f2]/48">{label}</div>
      <div className="mt-1 font-heading text-3xl leading-none text-[#ff5a1f]">{value}</div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-[#111111]/12 bg-white p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#ff5a1f] text-white">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-[#ff5a1f]">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text, dark = false }: { eyebrow: string; title: string; text: string; dark?: boolean }) {
  return (
    <div className="max-w-3xl">
      <div className={`text-xs font-bold uppercase tracking-wide ${dark ? "text-[#bbf903]" : "text-[#ff5a1f]"}`}>{eyebrow}</div>
      <h2 className={`mt-2 font-heading text-4xl leading-none sm:text-5xl ${dark ? "text-[#f7f7f2]" : "text-[#111111]"}`}>{title}</h2>
      <p className={`mt-3 text-sm leading-6 sm:text-base ${dark ? "text-[#f7f7f2]/68" : "text-[#111111]/68"}`}>{text}</p>
    </div>
  );
}

function MatchRow({ match }: { match: Season2Match }) {
  return (
    <article className="grid items-center gap-3 px-5 py-5 sm:grid-cols-[150px_1fr_auto_1fr_92px]">
      <div>
        <div className="font-heading text-2xl leading-none text-[#ff5a1f]">Тур {match.round}</div>
        <div className="text-xs font-bold uppercase tracking-wide text-[#111111]/45">{match.dayLabel}</div>
      </div>
      <Team name={match.home.name} club={match.home.club} align="right" />
      <div className="rounded-md bg-[#ff5a1f]/12 px-5 py-2 text-center font-heading text-2xl leading-none text-[#ff5a1f]">VS</div>
      <Team name={match.away.name} club={match.away.club} />
      <span className="justify-self-start rounded-md bg-[#bbf903] px-3 py-2 text-xs font-extrabold uppercase text-[#111111] sm:justify-self-end">Скоро</span>
    </article>
  );
}

function Team({ name, club, align = "left", compact = false }: { name: string; club: string; align?: "left" | "right"; compact?: boolean }) {
  return (
    <div className={align === "right" ? "text-left sm:text-right" : "text-left"}>
      <div className={`${compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"} font-extrabold text-[#111111]`}>{name}</div>
      <div className={`${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"} text-[#111111]/62`}>{club}</div>
    </div>
  );
}
