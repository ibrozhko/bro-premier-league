export function registerBplServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The cabinet still works without service worker; push UI will show unsupported state.
    });
  });
}
