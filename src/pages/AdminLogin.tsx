import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSession, loginAdmin } from "@/lib/adminAuth";

const inputClass = "h-12 w-full rounded-md border border-[#ff5a1f]/25 bg-white px-3 text-base text-[#111111] outline-none placeholder:text-[#111111]/40 focus-visible:ring-2 focus-visible:ring-[#bbf903]";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAdminSession()
      .then(session => {
        if (session.authenticated) navigate("/admin", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await loginAdmin(username, password);
      navigate("/admin", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не вдалося увійти.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2] py-12 text-[#111111]">
      <div className="content-shell">
        <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-md border border-[#111111]/12 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#ff5a1f]">Операційна панель</div>
            <h1 className="h-page">Вхід в адмінку</h1>
            <p className="t-body mt-2 text-muted-foreground">
              Доступ тільки для організаторів ліги.
            </p>
          </div>

          <label className="mb-4 block">
            <span className="t-label mb-2 block">Логін</span>
            <input
              className={inputClass}
              autoComplete="username"
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
          </label>

          <label className="mb-5 block">
            <span className="t-label mb-2 block">Пароль</span>
            <input
              className={inputClass}
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </label>

          <Button className="w-full bg-[#ff5a1f] text-white hover:bg-[#e64d16] focus-visible:ring-[#bbf903]" type="submit" disabled={isSubmitting || !username || !password}>
            <LogIn />
            {isSubmitting ? "Входжу..." : "Увійти"}
          </Button>

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
