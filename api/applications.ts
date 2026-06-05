type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type ApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";
type Platform = "PS5" | "Xbox" | "PC";

type ApplicationRow = {
  id: string;
  created_at: string;
  name: string;
  contact: string;
  platform: Platform;
  ea_id: string;
  preferred_club: string | null;
  availability: string;
  experience: string;
  comment: string | null;
  status: ApplicationStatus;
};

type ApplicationPayload = {
  action?: "create" | "list" | "updateStatus" | "delete";
  password?: string;
  id?: string;
  name?: string;
  contact?: string;
  platform?: Platform;
  eaId?: string;
  preferredClub?: string;
  availability?: string;
  experience?: string;
  comment?: string;
  status?: ApplicationStatus;
  website?: string;
};

const allowedStatuses: ApplicationStatus[] = ["new", "reviewing", "accepted", "rejected"];
const allowedPlatforms: Platform[] = ["PS5", "Xbox", "PC"];

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    response.status(500).json({ error: "Supabase env змінні ще не налаштовані." });
    return;
  }

  const payload = parseBody(request.body);
  if (!payload) {
    response.status(400).json({ error: "Некоректний JSON запит." });
    return;
  }

  const action = payload.action ?? "create";

  try {
    if (action === "create") {
      if (payload.website) {
        response.status(200).json({ message: "Заявку прийнято" });
        return;
      }

      const validationError = validateCreatePayload(payload);
      if (validationError) {
        response.status(400).json({ error: validationError });
        return;
      }

      const [row] = await supabaseJson<ApplicationRow[]>("/rest/v1/applications?select=*", {
        method: "POST",
        body: JSON.stringify(toRow(payload)),
      });

      response.status(200).json({ application: fromRow(row), message: "Заявку прийнято" });
      return;
    }

    if (!isAdmin(payload.password)) {
      response.status(401).json({ error: "Неправильний пароль." });
      return;
    }

    if (action === "list") {
      const rows = await supabaseJson<ApplicationRow[]>("/rest/v1/applications?select=*&order=created_at.desc");
      response.status(200).json({ applications: rows.map(fromRow) });
      return;
    }

    if (action === "updateStatus") {
      if (!payload.id || !payload.status || !allowedStatuses.includes(payload.status)) {
        response.status(400).json({ error: "Некоректний статус заявки." });
        return;
      }

      const [row] = await supabaseJson<ApplicationRow[]>(`/rest/v1/applications?id=eq.${encodeURIComponent(payload.id)}&select=*`, {
        method: "PATCH",
        body: JSON.stringify({ status: payload.status }),
      });

      response.status(200).json({ application: fromRow(row), message: "Статус оновлено" });
      return;
    }

    if (action === "delete") {
      if (!payload.id) {
        response.status(400).json({ error: "Не вказано ID заявки." });
        return;
      }

      await supabaseJson(`/rest/v1/applications?id=eq.${encodeURIComponent(payload.id)}`, {
        method: "DELETE",
      });

      response.status(200).json({ message: "Заявку видалено" });
      return;
    }

    response.status(400).json({ error: "Невідома дія." });
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Не вдалося обробити заявку.",
    });
  }
}

function parseBody(body: unknown): ApplicationPayload | null {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as ApplicationPayload;
    } catch {
      return null;
    }
  }

  if (body && typeof body === "object") {
    return body as ApplicationPayload;
  }

  return null;
}

function validateCreatePayload(payload: ApplicationPayload) {
  if (!payload.name?.trim()) return "Вкажи імʼя.";
  if (!payload.contact?.trim()) return "Вкажи Telegram.";
  if (!payload.platform || !allowedPlatforms.includes(payload.platform)) return "Вибери платформу.";
  if (!payload.eaId?.trim()) return "Вкажи EA ID / PSN / Xbox ID.";
  if (!payload.availability?.trim()) return "Вкажи, коли можеш грати.";
  if (!payload.experience?.trim()) return "Опиши досвід у FC 26 / FIFA.";
  return "";
}

function toRow(payload: ApplicationPayload) {
  return {
    name: payload.name!.trim(),
    contact: payload.contact!.trim(),
    platform: payload.platform,
    ea_id: payload.eaId!.trim(),
    preferred_club: payload.preferredClub?.trim() || null,
    availability: payload.availability!.trim(),
    experience: payload.experience!.trim(),
    comment: payload.comment?.trim() || null,
  };
}

function fromRow(row: ApplicationRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    contact: row.contact,
    platform: row.platform,
    eaId: row.ea_id,
    preferredClub: row.preferred_club ?? "",
    availability: row.availability,
    experience: row.experience,
    comment: row.comment ?? "",
    status: row.status,
  };
}

async function supabaseJson<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const result = await fetch(`${process.env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.method === "POST" ? { "Prefer": "return=representation" } : {}),
      ...(init.method === "PATCH" ? { "Prefer": "return=representation" } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!result.ok) {
    const text = await result.text();
    throw new Error(text || "Supabase не прийняв запит.");
  }

  if (result.status === 204) {
    return null as T;
  }

  return await result.json() as T;
}

function isAdmin(password?: string) {
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}
