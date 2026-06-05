export type AdminUser = {
  username: string;
  name?: string;
};

type AuthResponse = {
  authenticated?: boolean;
  user?: AdminUser | null;
  error?: string;
};

export async function getAdminSession() {
  return authRequest({ action: "session" });
}

export async function loginAdmin(username: string, password: string) {
  return authRequest({ action: "login", username, password });
}

export async function logoutAdmin() {
  return authRequest({ action: "logout" });
}

async function authRequest(body: Record<string, unknown>): Promise<AuthResponse> {
  const response = await fetch("/api/admin-auth", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as AuthResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Не вдалося авторизуватися.");
  }

  return payload;
}
