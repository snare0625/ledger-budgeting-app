"use client";

import { Delete } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { PasscodeResult } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { AuthSubtitle } from "./auth-shell";

const LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

type Props = {
  subtitle: string;
  /** Called with the full code. Return an error to reset the pad; redirect on success. */
  onComplete: (code: string) => Promise<PasscodeResult | void>;
  /** Error to show on mount, e.g. after a failed confirm step. */
  initialError?: string;
  footer?: React.ReactNode;
};

function formatRemaining(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function PasscodePad({ subtitle, onComplete, initialError, footer }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [shakeKey, setShakeKey] = useState(initialError ? 1 : 0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pending, startTransition] = useTransition();

  const locked = lockedUntil !== null && lockedUntil > now;

  useEffect(() => {
    if (lockedUntil === null) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockedUntil) {
        setLockedUntil(null);
        setError("");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const submit = useCallback(
    (full: string) => {
      // Brief beat so the 4th dot is seen filling before the check (per design).
      setTimeout(() => {
        startTransition(async () => {
          const result = await onComplete(full);
          if (result?.error) {
            setCode("");
            setError(result.error);
            setShakeKey((k) => k + 1);
            if (result.lockedUntil) {
              setLockedUntil(new Date(result.lockedUntil).getTime());
              setNow(Date.now());
            }
          }
        });
      }, 140);
    },
    [onComplete],
  );

  const press = useCallback(
    (key: string) => {
      if (pending || locked || (code.length === LENGTH && key !== "del")) return;
      if (error) setError("");
      if (key === "del") {
        setCode((c) => c.slice(0, -1));
        return;
      }
      const next = code + key;
      setCode(next);
      if (next.length === LENGTH) submit(next);
    },
    [code, error, locked, pending, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const message =
    locked && lockedUntil !== null
      ? `Too many attempts — try again in ${formatRemaining(lockedUntil - now)}`
      : error;
  const showError = Boolean(message);

  return (
    <>
      <AuthSubtitle>{subtitle}</AuthSubtitle>
      <div
        key={shakeKey}
        role="img"
        aria-label={`${code.length} of ${LENGTH} digits entered`}
        className={cn("mb-2.5 flex gap-[18px]", shakeKey > 0 && "animate-shake")}
      >
        {Array.from({ length: LENGTH }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-[13px] rounded-full border-2 transition-colors duration-150",
              showError ? "border-red" : "border-white/50",
              i < code.length && (showError ? "bg-red" : "bg-white"),
            )}
          />
        ))}
      </div>

      <p role="alert" className="mb-4 h-5 text-center text-[13px] font-semibold text-red">
        {message}
      </p>

      <div className="mt-auto grid grid-cols-[repeat(3,70px)] gap-4">
        {KEYS.map((key, i) =>
          key === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              disabled={pending || locked}
              aria-label={key === "del" ? "Delete digit" : key}
              className="flex size-[70px] items-center justify-center rounded-full border border-white/13 bg-white/5 text-[26px] font-semibold text-white transition-colors hover:bg-white/10 active:bg-white/15 disabled:opacity-40"
            >
              {key === "del" ? <Delete className="size-6" strokeWidth={2} /> : key}
            </button>
          ),
        )}
      </div>

      <div className="mt-[22px] min-h-[18px] text-xs font-semibold text-white/35">{footer}</div>
    </>
  );
}
