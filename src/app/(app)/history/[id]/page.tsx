import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActivityList } from "@/components/app/activity-list";
import { CyclePill, Skeleton, SubScreen } from "@/components/app/chrome";
import { getActivity, getCycle, getProfile } from "@/lib/data/queries";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cycle · Ledger" };

export default function CyclePage({ params }: PageProps<"/history/[id]">) {
  return (
    <SubScreen back="/history" backLabel="History">
      <Suspense
        fallback={
          <>
            <Skeleton className="h-9 w-52 rounded-lg" />
            <Skeleton className="mt-2 mb-5 h-4 w-20 rounded-md" />
            <Skeleton className="h-[248px] rounded-panel" />
          </>
        }
      >
        <Cycle params={params} />
      </Suspense>
    </SubScreen>
  );
}

async function Cycle({ params }: Pick<PageProps<"/history/[id]">, "params">) {
  const { id } = await params;
  const [cycle, { currency }] = await Promise.all([getCycle(id), getProfile()]);
  if (!cycle) notFound();
  const activity = await getActivity(cycle.id);

  const net = cycle.income - cycle.spent;
  const rows = [
    { label: "Income", value: cycle.income, className: "text-ink" },
    { label: "Spent", value: cycle.spent, className: "text-red" },
    { label: "Saved", value: cycle.saved, className: "text-green" },
    { label: "Net", value: net, className: net >= 0 ? "text-green" : "text-red" },
  ];

  return (
    <>
      <div className="mb-[5px] flex items-center gap-3">
        <h1 className="min-w-0 text-title break-words text-ink">{cycle.name}</h1>
        <CyclePill closed={cycle.closed} />
      </div>
      <p className="mb-5 text-tab font-semibold text-sub">
        {cycle.closed ? "Read-only" : "Current cycle"}
      </p>

      <dl className="divide-y divide-line overflow-hidden rounded-panel bg-soft">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-[18px] py-[17px]">
            <dt className="text-body font-semibold text-sub">{row.label}</dt>
            <dd className={cn("text-lg font-extrabold tracking-[-0.01em]", row.className)}>
              {formatMoney(row.value, currency)}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-[22px] text-heading text-ink">Activity</h2>
      <ActivityList activity={activity} currency={currency} />
    </>
  );
}
