self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let data = {};

  try {
    data = event.data?.json?.() ?? {};
  } catch {
    data = {
      body: event.data?.text?.() || "Є оновлення у твоєму кабінеті.",
    };
  }

  const title = data.title || "BPL Season 2";
  const options = {
    body: data.body || "Є оновлення у твоєму кабінеті.",
    icon: "/apple-touch-icon.png",
    badge: "/favicon-season2.png",
    data: {
      url: data.url || "/cabinet",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/cabinet";

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existingClient = windowClients.find(client => new URL(client.url).pathname === url);

    if (existingClient) {
      existingClient.focus();
      return;
    }

    await self.clients.openWindow(url);
  })());
});
