"use client";

import { useEffect } from "react";

/** Registers public/sw.js (offline fallback screen). Renders nothing. */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.warn("Service worker registration failed", error));
  }, []);

  return null;
}
