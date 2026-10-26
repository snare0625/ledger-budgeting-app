import { Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AddLink, CardsSkeleton, EmptyState, PageHeader, StatusPill } from "@/components/app/chrome";
import { ProgressBar } from "@/components/app/progress";
import { goalProgress } from "@/lib/budget";
import { getGoals, getProfile } from "@/lib/data/queries";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Goals · Ledger" };

export default function GoalsPage() {
  return (
    <main className="flex-1 bg-sheet pb-nav-clearance">
      <PageHeader title="Goals" subtitle="Saving toward" action={<AddLink href="/goals/new" />} />
      <Suspense fallback={<CardsSkeleton />}>
        <Goals />
      </Suspense>
    </main>
  );
}

async function Goals() {
  const [goals, { currency }] = await Promise.all([getGoals(), getProfile()]);

  if (!goals.length) {
    return (
      <EmptyState icon={<Target className="size-[46px]" strokeWidth={1.6} />}>
        No goals yet. Add one to start saving toward it.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-[13px] px-gutter pt-3.5">
      {goals.map((goal) => {
        const { pct, done } = goalProgress(goal.saved, goal.target);
        return (
          <li key={goal.id}>
            <Link
              href={`/goals/${goal.id}`}
              className="block rounded-panel bg-soft p-[18px] transition-colors hover:bg-line/70"
            >
              <div className="mb-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-heading text-ink">{goal.name}</h2>
                  <p className="mt-[3px] text-label font-semibold text-sub">
                    {formatMoney(goal.saved, currency)} of {formatMoney(goal.target, currency)}
                  </p>
                </div>
                {done ? (
                  <StatusPill tone="green">Funded</StatusPill>
                ) : (
                  <span className="text-xl font-extrabold text-blue">{pct}%</span>
                )}
              </div>
              <ProgressBar pct={pct} done={done} label={`${goal.name} progress`} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
