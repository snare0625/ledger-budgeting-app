import { cn } from "@/lib/utils";

/** 9px progress bar: blue in progress, green when funded. */
export function ProgressBar({ pct, done, label }: { pct: number; done: boolean; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-[9px] overflow-hidden rounded-[5px] bg-track"
    >
      <div
        className={cn(
          "h-full animate-fill-bar rounded-[5px] transition-[width] duration-600",
          done ? "bg-green" : "bg-blue",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const SIZE = 156;
const STROKE = 13;
const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

/** 156px progress ring with the percentage in the middle. */
export function ProgressRing({ pct, done }: { pct: number; done: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label="Saved toward target"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative mx-auto my-[22px] size-[156px]"
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" strokeWidth={STROKE} className="stroke-track" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
          // fill-ring animates in from an empty ring (offset = full circumference)
          style={{ "--ring-empty": CIRCUMFERENCE } as React.CSSProperties}
          className={cn(
            "animate-fill-ring transition-[stroke-dashoffset] duration-600",
            done ? "stroke-green" : "stroke-blue",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-extrabold tracking-[-0.02em] text-ink">{pct}%</span>
        <span
          className={cn(
            "text-xs font-bold tracking-[0.06em] uppercase",
            done ? "text-green" : "text-sub",
          )}
        >
          {done ? "Funded" : "saved"}
        </span>
      </div>
    </div>
  );
}
