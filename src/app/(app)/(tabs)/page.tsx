import { Lock } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ActivityList } from "@/components/app/activity-list";
import { Skeleton, StatusPill } from "@/components/app/chrome";
import { Greeting } from "@/components/app/greeting";
import { lockApp } from "@/lib/auth/actions";
import { plannedTotal, spendingChange, spendingInsight } from "@/lib/budget";
import {
  getActivity,
  getItems,
  getOpenCycle,
  getPreviousCycle,
  getProfile,
} from "@/lib/data/queries";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CategoryTabs } from "./category-tabs";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-sheet">
      <Suspense fallback={<HomeSkeleton />}>
        <Home />
      </Suspense>
    </main>
  );
}

async function Home() {
  const [profile, cycle] = await Promise.all([getProfile(), getOpenCycle()]);
  const { currency } = profile;

  if (!cycle) {
    return (
      <>
        <Hero name={profile.name} subline="Let's set up your first budget">
          <div className="mt-5 rounded-hero border border-dark-line bg-dark-card px-5 pt-5 pb-[18px]">
            <p className="text-tab font-semibold text-white/60">No open cycle</p>
            <p className="mt-2 text-heading text-white">
              Start a cycle, add your income, then plan where every bit of it goes.
            </p>
            <OpenCycleLink>Open your first cycle</OpenCycleLink>
          </div>
        </Hero>
        <Sheet />
      </>
    );
  }

  const [items, activity, previous] = await Promise.all([
    getItems(cycle.id),
    getActivity(cycle.id, 4),
    getPreviousCycle(),
  ]);
  const planned = plannedTotal(items);
  const left = cycle.income - planned;
  const change = spendingChange(cycle.spent, previous?.spent ?? null);

  return (
    <>
      <Hero
        name={profile.name}
        subline={left >= 0 ? "You're on track this cycle" : "You've planned more than your income"}
      >
        <div className="mt-5 rounded-hero border border-dark-line bg-dark-card px-5 pt-5 pb-[18px]">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-tab font-semibold text-white/60">
              Left to allocate · {cycle.name}
            </span>
            <StatusPill tone="green">Open</StatusPill>
          </div>
          <p className={cn("mt-2 text-display", left < 0 ? "text-red" : "text-white")}>
            {formatMoney(left, currency)}
          </p>
          <p className="mt-1 text-label font-bold text-green">
            {formatMoney(cycle.income, currency)} income · {formatMoney(planned, currency)} planned
          </p>
          <OpenCycleLink>+ Open new cycle</OpenCycleLink>
        </div>
      </Hero>

      <Sheet>
        <CategoryTabs
          items={items.filter((i) => i.enabled)}
          currency={currency}
          insight={
            <div className="mb-[18px] rounded-card bg-tint-blue p-[18px]">
              <div className="mb-2 flex items-center gap-[7px]">
                <span className="size-[7px] rounded-full bg-blue" />
                <span className="text-overline text-blue">Insight</span>
              </div>
              <p className="text-heading text-ink">
                You&apos;re set to save {formatMoney(plannedTotal(items, "Savings"), currency)} this
                cycle
              </p>
              <p className="mt-1 text-label font-medium text-sub">{spendingInsight(change)}</p>
              <Link
                href="/goals"
                className="mt-2.5 inline-block text-label font-bold text-blue hover:text-blue-hover"
              >
                View goals →
              </Link>
            </div>
          }
        />

        <div className="mt-[22px] flex items-center justify-between">
          <h2 className="text-heading text-ink">Recent activity</h2>
          <div className="flex gap-4 text-label font-bold text-blue">
            <Link href="/activity/new" className="hover:text-blue-hover">
              + Log
            </Link>
            <Link href={`/history/${cycle.id}`} className="hover:text-blue-hover">
              View all
            </Link>
          </div>
        </div>
        <ActivityList activity={activity} currency={currency} />
      </Sheet>
    </>
  );
}

function Hero({
  name,
  subline,
  children,
}: {
  name: string;
  subline: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-hero-gradient px-gutter pt-[62px] pb-[26px]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-white">
            <Greeting name={name} />
          </h1>
          <p className="mt-[3px] text-label font-medium text-dark-sub">{subline}</p>
        </div>
        <form action={lockApp}>
          <button
            type="submit"
            aria-label="Lock Ledger"
            title="Lock"
            className="flex size-[42px] items-center justify-center rounded-full border border-dark-line bg-white/7 text-white transition-colors hover:bg-white/12"
          >
            <Lock className="size-[19px]" strokeWidth={1.8} />
          </button>
        </form>
      </div>
      {children}
    </section>
  );
}

function Sheet({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative -mt-3.5 flex-1 rounded-t-sheet bg-sheet px-gutter pt-[18px] pb-nav-clearance">
      {children}
    </section>
  );
}

function OpenCycleLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/cycles/new"
      className="mt-4 block w-full rounded-tile border border-dark-line bg-white/10 p-3 text-center text-label font-bold text-white transition-colors hover:bg-white/15"
    >
      {children}
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <>
      <section className="bg-hero-gradient px-gutter pt-[62px] pb-[26px]">
        <div className="h-[52px]" />
        <div className="mt-5 h-[196px] animate-pulse rounded-hero border border-dark-line bg-dark-card" />
      </section>
      <Sheet>
        <Skeleton className="h-11 rounded-full" />
        <Skeleton className="mt-[18px] h-[132px]" />
        <Skeleton className="mt-[18px] h-40" />
      </Sheet>
    </>
  );
}
