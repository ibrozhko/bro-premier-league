import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSession, loginAdmin } from "@/lib/adminAuth";

const inputClass = "h-12 w-full border border-[#2937da]/20 bg-white px-3 text-base text-[#343434] outline-none placeholder:text-[#343434]/40 focus-visible:ring-2 focus-visible:ring-primary";

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
    <div className="coax-light min-h-screen py-12">
      <div className="content-shell">
        <form onSubmit={handleSubmit} className="light-panel mx-auto max-w-md rounded-md p-5 sm:p-7">
          <div className="mb-6">
            <div className="page-kicker">Операційна панель</div>
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

          <Button className="w-full" type="submit" disabled={isSubmitting || !username || !password}>
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
