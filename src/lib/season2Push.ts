export type Season2PushStatus = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  enabled: boolean;
  message: string;
};

const vapidPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY ?? "";

export function getSeason2PushSupportMessage() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "Цей браузер не підтримує push. На iPhone відкрий кабінет з Home Screen.";
  }

  if (!vapidPublicKey) {
    return "Push майже готовий. Потрібно додати VAPID public key у Vercel.";
  }

  return "";
}

export async function getSeason2PushStatus(): Promise<Season2PushStatus> {
  const supportMessage = getSeason2PushSupportMessage();
  if (supportMessage) {
    return {
      supported: false,
      permission: "unsupported",
      enabled: false,
      message: supportMessage,
    };
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const serverStatus = await apiFetch<{ enabled: boolean; updatedAt: string | null }>("/api/season2?resource=push-subscription");

  return {
    supported: true,
    permission: Notification.permission,
    enabled: Boolean(subscription && serverStatus.enabled),
    message: subscription && serverStatus.enabled ? "Push увімкнено для цього пристрою." : "Push ще не увімкнено.",
  };
}

export async function enableSeason2Push() {
  const supportMessage = getSeason2PushSupportMessage();
  if (supportMessage) throw new Error(supportMessage);

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Дозвіл на push не надано.");
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  await apiFetch("/api/season2?resource=push-subscription", {
    method: "POST",
    body: JSON.stringify({
      subscription,
      userAgent: navigator.userAgent,
    }),
  });

  return getSeason2PushStatus();
}

export async function sendSeason2TestPush() {
  await apiFetch("/api/season2?resource=test-push", {
    method: "POST",
    body: JSON.stringify({
      title: "BPL Season 2",
      body: "Тестовий push прийшов. Тепер можна будити лігу красиво.",
    }),
  });
}

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Season 2 push API error.");
  }
  return payload as T;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
