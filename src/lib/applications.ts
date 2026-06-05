export type ApplicationStatus = "new" | "reviewing" | "accepted" | "rejected";

export interface SeasonApplication {
  id: string;
  createdAt: string;
  name: string;
  contact: string;
  platform: "PS5" | "Xbox" | "PC";
  eaId: string;
  preferredClub: string;
  availability: string;
  experience: string;
  comment: string;
  status: ApplicationStatus;
}

export type NewSeasonApplication = Omit<SeasonApplication, "id" | "createdAt" | "status">;

export const applicationStatuses: { value: ApplicationStatus; label: string }[] = [
  { value: "new", label: "Нова" },
  { value: "reviewing", label: "На розгляді" },
  { value: "accepted", label: "Прийнято" },
  { value: "rejected", label: "Відхилено" },
];

type ApiResponse<T> = {
  application?: T;
  applications?: T[];
  message?: string;
  error?: string;
};

export async function submitApplication(application: NewSeasonApplication, website = ""): Promise<SeasonApplication> {
  const payload = await applicationRequest<SeasonApplication>({
    action: "create",
    website,
    ...application,
  });

  if (!payload.application) {
    throw new Error("Заявку прийнято, але сервер не повернув деталі.");
  }

  return payload.application;
}

export async function getApplications(): Promise<SeasonApplication[]> {
  const payload = await applicationRequest<SeasonApplication>({ action: "list" });
  return payload.applications ?? [];
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<SeasonApplication> {
  const payload = await applicationRequest<SeasonApplication>({
    action: "updateStatus",
    id,
    status,
  });

  if (!payload.application) {
    throw new Error("Статус оновлено, але сервер не повернув заявку.");
  }

  return payload.application;
}

export async function deleteApplication(id: string): Promise<void> {
  await applicationRequest<SeasonApplication>({
    action: "delete",
    id,
  });
}

async function applicationRequest<T>(body: Record<string, unknown>): Promise<ApiResponse<T>> {
  const response = await fetch("/api/applications", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error ?? "Не вдалося виконати запит.");
  }

  return payload;
}
