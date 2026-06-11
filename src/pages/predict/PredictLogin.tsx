import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginPredictUser } from "@/lib/predictStore";

export default function PredictLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loginPredictUser(username, password);
      navigate("/predict/predictions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося увійти.");
    }
  }

  return (
    <main className="content-shell max-w-xl py-10">
      <div className="overflow-hidden rounded-md border border-[#2937da]/15 bg-white">
        <div className="brand-stripe h-1" />
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <div>
            <div className="page-kicker">Predict auth</div>
            <h2 className="h-section text-[#343434]">Увійти в Predict</h2>
            <p className="t-meta mt-2">Вхід за нікнеймом і паролем. Реєстрація доступна тільки з інвайт-кодом.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Нікнейм</Label>
            <Input id="username" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" className="bg-white text-[#343434]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" className="bg-white text-[#343434]" />
          </div>
          {error && <div className="rounded-md border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <Button className="h-11 w-full rounded-md bg-[#2937da] text-white hover:bg-[#1f2ab4]">
            <LogIn className="mr-2 h-4 w-4" /> Увійти
          </Button>
          <p className="text-center text-sm text-[#343434]/70">
            Немає акаунта? <Link to="/predict/register" className="font-semibold text-[#2937da]">Зареєструватись з кодом</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
