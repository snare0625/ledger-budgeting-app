import { ArrowUpRight, ChevronLeft, House, Target, Wallet } from "lucide-react";
import Link from "next/link";
import type { ActivityCategory } from "@/lib/budget";
import { cn } from "@/lib/utils";
import { nav, Screen } from "./motion";

// Shared screen chrome from the design: page headers, back pill, status pills,
// category icon tiles, list cards.

/** Main-screen header: title, subline, optional action pill on the right. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-gutter pt-16 pb-2">
      <div className="min-w-0">
        <h1 className="text-title text-ink">{title}</h1>
        {subtitle && <p className="mt-[3px] text-label font-medium text-sub">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/** Dark "+ Add" pill in a page header. */
export function AddLink({ href, label = "Add" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      transitionTypes={nav.forward}
      className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-[11px] text-label font-bold text-white transition hover:bg-ink/85 active:scale-[0.96]"
    >
      + {label}
    </Link>
  );
}

/** Sub-screen layout: back pill instead of the bottom nav. */
export function SubScreen({
  back,
  backLabel,
  children,
  className,
}: {
  back: string;
  backLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Screen>
      <main className={cn("relative flex flex-1 flex-col bg-sheet", className)}>
        <div className="px-gutter pt-[62px] pb-1.5">
          <Link
            href={back}
            transitionTypes={nav.back}
            className="inline-flex items-center gap-1.5 rounded-full bg-soft py-[9px] pr-[15px] pl-[11px] text-label font-bold text-ink transition hover:bg-line active:scale-[0.96]"
          >
            <ChevronLeft className="size-[17px]" strokeWidth={2} />
            {backLabel}
          </Link>
        </div>
        <div className="flex flex-1 flex-col px-gutter pt-2.5 pb-[calc(24px+var(--spacing-safe-bottom))]">{children}</div>
      </main>
    </Screen>
  );
}

const PILL_TONES = {
  green: "bg-green/12 text-green",
  gray: "bg-sub/14 text-sub",
  blue: "bg-blue/12 text-blue",
} as const;

export function StatusPill({
  tone,
  children,
}: {
  tone: keyof typeof PILL_TONES;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("shrink-0 rounded-full px-[11px] py-[5px] text-xs font-bold", PILL_TONES[tone])}>
      {children}
    </span>
  );
}

export function CyclePill({ closed }: { closed: boolean }) {
  return closed ? <StatusPill tone="gray">Closed</StatusPill> : <StatusPill tone="green">Open</StatusPill>;
}

const TILES = {
  Fixed: { icon: House, className: "bg-cat-fixed/12 text-cat-fixed" },
  Variable: { icon: Wallet, className: "bg-cat-variable/12 text-cat-variable" },
  Savings: { icon: Target, className: "bg-cat-savings/12 text-cat-savings" },
  Income: { icon: ArrowUpRight, className: "bg-cat-income/12 text-cat-income" },
} satisfies Record<ActivityCategory, { icon: typeof House; className: string }>;

/** Category icon tile: accent glyph on a ~12% accent background. */
export function IconTile({ category, small = false }: { category: ActivityCategory; small?: boolean }) {
  const { icon: Icon, className } = TILES[category];
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-tile",
        small ? "size-9" : "size-[38px]",
        className,
      )}
    >
      <Icon className={small ? "size-[18px]" : "size-[19px]"} strokeWidth={2} />
    </span>
  );
}

/** Centered empty state with a faded icon. */
export function EmptyState({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-10 py-[70px] text-center">
      <div className="mb-3.5 flex justify-center text-sub opacity-35">{icon}</div>
      <div className="text-body font-medium text-sub">{children}</div>
    </div>
  );
}

/** Grey placeholder block for Suspense fallbacks. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-card bg-soft", className)} />;
}

/** Placeholder for a form while its record loads. */
export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div aria-hidden>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="mb-[18px]">
          <Skeleton className="mb-2 h-4 w-20 rounded-md" />
          <Skeleton className="h-[54px] rounded-field" />
        </div>
      ))}
      <Skeleton className="mt-1.5 h-14 rounded-field" />
    </div>
  );
}

/** Placeholder for a stack of soft cards (Goals, History). */
export function CardsSkeleton({ count = 3, height = "h-[104px]" }: { count?: number; height?: string }) {
  return (
    <div aria-hidden className="flex flex-col gap-[13px] px-gutter pt-3.5">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={cn("rounded-panel", height)} />
      ))}
    </div>
  );
}
