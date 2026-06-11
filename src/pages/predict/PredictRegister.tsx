import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { popularScorers, wcTeams, type TournamentPrediction } from "@/data/predictData";
import { registerPredictUser } from "@/lib/predictStore";

export default function PredictRegister() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [prediction, setPrediction] = useState<TournamentPrediction>({
    champion: "Argentina",
    finalist: "Brazil",
    topScorer: "Kylian Mbappe",
    darkHorse: "Ukraine",
    favoriteTeam: "Ukraine",
    pointsChampion: 0,
    pointsFinalist: 0,
    pointsTopScorer: 0,
    pointsDarkHorse: 0,
  });
  const [error, setError] = useState("");

  function update<K extends keyof TournamentPrediction>(key: K, value: TournamentPrediction[K]) {
    setPrediction(current => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      registerPredictUser({ username, password, inviteCode, tournamentPrediction: prediction });
      navigate("/predict/predictions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося зареєструватись.");
    }
  }

  return (
    <main className="content-shell max-w-3xl py-10">
      <form onSubmit={submit} className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
        <div className="brand-stripe h-1" />
        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <div className="page-kicker">Invite only</div>
            <h2 className="h-section text-[#343434]">Реєстрація з кодом</h2>
            <p className="t-meta mt-2">Турнірні прогнози зберігаються один раз і не редагуються після створення акаунта.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Нікнейм" value={username} onChange={setUsername} />
            <Field label="Пароль" value={password} onChange={setPassword} type="password" />
            <Field label="Інвайт-код" value={inviteCode} onChange={setInviteCode} placeholder="BPL-A7K2" />
          </div>

          <div className="border-t border-[#2937da]/10 pt-5">
            <h3 className="h-card text-[#343434]">Прогнози на турнір</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SelectField label="Чемпіон" value={prediction.champion} onChange={value => update("champion", value)} />
              <SelectField label="Фіналіст" value={prediction.finalist} onChange={value => update("finalist", value)} />
              <div className="space-y-2">
                <Label htmlFor="topScorer">Найкращий бомбардир</Label>
                <Input id="topScorer" list="popular-scorers" value={prediction.topScorer} onChange={event => update("topScorer", event.target.value)} className="bg-white text-[#343434]" />
                <datalist id="popular-scorers">
                  {popularScorers.map(player => <option key={player} value={player} />)}
                </datalist>
              </div>
              <SelectField label="Темна конячка" value={prediction.darkHorse} onChange={value => update("darkHorse", value)} />
              <SelectField label="Улюблена команда" value={prediction.favoriteTeam} onChange={value => update("favoriteTeam", value)} />
            </div>
          </div>

          {error && <div className="rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <Button className="h-11 rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
            <UserPlus className="mr-2 h-4 w-4" /> Створити акаунт
          </Button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={event => onChange(event.target.value)} type={type} placeholder={placeholder} className="bg-white text-[#343434]" />
    </div>
  );
}

function SelectField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-[#343434] ring-offset-background"
      >
        {wcTeams.map(team => <option key={team} value={team}>{team}</option>)}
      </select>
    </div>
  );
}
