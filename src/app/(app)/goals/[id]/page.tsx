import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton, SubScreen } from "@/components/app/chrome";
import { ProgressRing } from "@/components/app/progress";
import { goalProgress } from "@/lib/budget";
import { getGoal, getProfile } from "@/lib/data/queries";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Goal · Ledger" };

export default function GoalPage({ params }: PageProps<"/goals/[id]">) {
  return (
    <SubScreen back="/goals" backLabel="Goals">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="mx-auto my-[22px] size-[156px] rounded-full" />
            <Skeleton className="h-[66px] rounded-field" />
          </>
        }
      >
        <Goal params={params} />
      </Suspense>
    </SubScreen>
  );
}

async function Goal({ params }: Pick<PageProps<"/goals/[id]">, "params">) {
  const { id } = await params;
  const [goal, { currency }] = await Promise.all([getGoal(id), getProfile()]);
  if (!goal) notFound();

  const { pct, done, left } = goalProgress(goal.saved, goal.target);
  const stats = [
    { label: "Saved", value: goal.saved, className: "text-green" },
    { label: "Target", value: goal.target, className: "text-ink" },
    { label: "Left", value: left, className: "text-blue" },
  ];

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h1 className="max-w-[230px] text-title break-words text-ink">{goal.name}</h1>
        <Link
          href={`/goals/${goal.id}/edit`}
          className="mt-1.5 shrink-0 rounded-full bg-soft px-4 py-[9px] text-label font-bold text-ink transition-colors hover:bg-line"
        >
          Edit
        </Link>
      </div>

      <ProgressRing pct={pct} done={done} />

      <dl className="mb-[18px] flex gap-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 flex-1 rounded-field bg-soft px-3.5 py-[13px]">
            <dt className="mb-1 text-xs font-bold text-sub">{stat.label}</dt>
            <dd className={cn("truncate text-base font-extrabold tracking-[-0.01em]", stat.className)}>
              {formatMoney(stat.value, currency)}
            </dd>
          </div>
        ))}
      </dl>

      {goal.note && (
        <p className="rounded-2xl bg-tint-blue p-4 text-body leading-normal font-semibold whitespace-pre-line text-ink">
          {goal.note}
        </p>
      )}
    </>
  );
}
