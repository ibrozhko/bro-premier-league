import { FormEvent, useState, type ReactNode } from "react";
import { CheckCircle2, Send, ShieldCheck, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { submitApplication, type NewSeasonApplication } from "@/lib/applications";

const inputClass = "h-12 w-full border border-[#2937da]/20 bg-white px-3 text-base text-[#343434] outline-none placeholder:text-[#343434]/40 focus-visible:ring-2 focus-visible:ring-primary";
const textareaClass = "min-h-28 w-full border border-[#2937da]/20 bg-white px-3 py-3 text-base text-[#343434] outline-none placeholder:text-[#343434]/40 focus-visible:ring-2 focus-visible:ring-primary";

const initialForm: NewSeasonApplication = {
  name: "",
  contact: "",
  platform: "PS5",
  eaId: "",
  preferredClub: "",
  availability: "",
  experience: "",
  comment: "",
};

export default function Apply() {
  const [form, setForm] = useState(initialForm);
  const [submittedName, setSubmittedName] = useState("");
  const [website, setWebsite] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof NewSeasonApplication>(key: Key, value: NewSeasonApplication[Key]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const saved = await submitApplication(form, website);
      setSubmittedName(saved.name);
      setForm(initialForm);
      setWebsite("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не вдалося відправити заявку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedName) {
    return (
      <div className="coax-light min-h-screen py-12">
        <div className="content-shell">
          <div className="light-panel mx-auto max-w-2xl rounded-md p-6 text-center sm:p-10">
            <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-primary" />
            <div className="page-kicker">Сезон 2</div>
            <h1 className="h-page">Заявку прийнято</h1>
            <p className="t-body mx-auto mt-3 max-w-xl text-muted-foreground">
              {submittedName}, заявка вже в адмінці. Ми переглянемо кандидатів і звʼяжемось ближче до старту сезону.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/">На головну</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/admin">В адмінку</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <div className="page-header grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="page-kicker">Bro Premier League · Season 2</div>
            <h1 className="h-page">Заявка на участь</h1>
            <p className="t-body mt-3 max-w-3xl text-muted-foreground">
              Заповни анкету для участі в другому сезоні. Ми дивимось не тільки на скіл, а й на регулярність, звʼязок і готовність грати матчі вчасно.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px border border-[#2937da]/20 bg-[#2937da]/20 text-left">
            {[
              { icon: Users, label: "Кандидати", value: "Season 2" },
              { icon: Trophy, label: "Формат", value: "Ліга" },
              { icon: ShieldCheck, label: "Статус", value: "Набір" },
            ].map(item => (
              <div key={item.label} className="bg-white p-3 sm:p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <div className="t-label">{item.label}</div>
                <div className="h-card text-primary">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="light-panel rounded-md p-4 sm:p-6">
          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={event => setWebsite(event.target.value)}
            name="website"
            aria-hidden="true"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ApplyField label="Імʼя">
              <input
                className={inputClass}
                required
                value={form.name}
                onChange={event => updateField("name", event.target.value)}
                placeholder="Наприклад, Ігор"
              />
            </ApplyField>

            <ApplyField label="Telegram">
              <input
                className={inputClass}
                required
                value={form.contact}
                onChange={event => updateField("contact", event.target.value)}
                placeholder="@username"
              />
            </ApplyField>

            <ApplyField label="Платформа">
              <select
                className={inputClass}
                value={form.platform}
                onChange={event => updateField("platform", event.target.value as NewSeasonApplication["platform"])}
              >
                <option value="PS5">PS5</option>
                <option value="Xbox">Xbox</option>
                <option value="PC">PC</option>
              </select>
            </ApplyField>

            <ApplyField label="EA ID / PSN / Xbox ID">
              <input
                className={inputClass}
                required
                value={form.eaId}
                onChange={event => updateField("eaId", event.target.value)}
                placeholder="Твій ігровий ID"
              />
            </ApplyField>

            <ApplyField label="Улюблений клуб">
              <input
                className={inputClass}
                value={form.preferredClub}
                onChange={event => updateField("preferredClub", event.target.value)}
                placeholder="Можна залишити пустим"
              />
            </ApplyField>

            <ApplyField label="Коли зазвичай можеш грати?">
              <input
                className={inputClass}
                required
                value={form.availability}
                onChange={event => updateField("availability", event.target.value)}
                placeholder="Наприклад: вечори після 21:00"
              />
            </ApplyField>

            <ApplyField label="Досвід у FC 26 / FIFA" wide>
              <textarea
                className={textareaClass}
                required
                value={form.experience}
                onChange={event => updateField("experience", event.target.value)}
                placeholder="Коротко про рівень, режими, турніри або просто як давно граєш"
              />
            </ApplyField>

            <ApplyField label="Коментар" wide>
              <textarea
                className={textareaClass}
                value={form.comment}
                onChange={event => updateField("comment", event.target.value)}
                placeholder="Все, що важливо знати організаторам"
              />
            </ApplyField>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#2937da]/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="t-meta max-w-xl">
              Після заявки організатори переглянуть анкету і звʼяжуться з тобою перед стартом сезону.
            </p>
            <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
              <Send />
              {isSubmitting ? "Відправляю..." : "Подати заявку"}
            </Button>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-white p-3 t-body text-destructive">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function ApplyField({ children, label, wide = false }: { children: ReactNode; label: string; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="t-label mb-2 block">{label}</span>
      {children}
    </label>
  );
}
