"use client";

import { usePathname } from "next/navigation";
import { createContext, Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { FLASH_COOKIE, FLASH_MESSAGES } from "@/lib/flash";

const DURATION_MS = 1900;

const ToastContext = createContext<(message: string) => void>(() => {});

/** Show a toast: the design's single global, auto-dismissing message. */
export function useToast() {
  return use(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext value={show}>
      {children}
      <Suspense fallback={null}>
        <FlashReader onFlash={show} />
      </Suspense>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-6 bottom-[110px] z-60 mx-auto max-w-[342px]"
      >
        {toast && (
          <div
            key={toast.id}
            className="animate-fade-up rounded-field bg-ink px-[18px] py-3.5 text-center text-label font-semibold text-white shadow-toast"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

/** Picks up a flash code a Server Action left in a cookie before redirecting. */
function FlashReader({ onFlash }: { onFlash: (message: string) => void }) {
  const pathname = usePathname();

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${FLASH_COOKIE}=([^;]*)`));
    if (!match) return;
    document.cookie = `${FLASH_COOKIE}=; Max-Age=0; path=/`;
    const code = match[1];
    if (Object.hasOwn(FLASH_MESSAGES, code)) {
      onFlash(FLASH_MESSAGES[code as keyof typeof FLASH_MESSAGES]);
    }
  }, [pathname, onFlash]);

  return null;
}
