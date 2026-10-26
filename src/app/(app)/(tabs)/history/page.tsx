import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CardsSkeleton, CyclePill, EmptyState, PageHeader } from "@/components/app/chrome";
import { getCycles, getProfile } from "@/lib/data/queries";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "History · Ledger" };

export default function HistoryPage() {
  return (
    <main className="flex-1 bg-sheet pb-nav-clearance">
      <PageHeader title="History" subtitle="Past cycles" />
      <Suspense fallback={<CardsSkeleton count={4} height="h-[86px]" />}>
        <Cycles />
      </Suspense>
    </main>
  );
}

async function Cycles() {
  const [cycles, { currency }] = await Promise.all([getCycles(), getProfile()]);

  if (!cycles.length) {
    return (
      <EmptyState icon={<Clock className="size-[46px]" strokeWidth={1.6} />}>
        No cycles yet. Closed cycles land here when you open a new one.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-3 px-gutter pt-3.5">
      {cycles.map((cycle) => (
        <li key={cycle.id}>
          <Link
            href={`/history/${cycle.id}`}
            className="flex items-center justify-between gap-3 rounded-panel bg-soft p-[18px] transition-colors hover:bg-line/70"
          >
            <div className="min-w-0">
              <h2 className="truncate text-heading text-ink">{cycle.name}</h2>
              <p className="mt-1 text-label font-semibold text-sub">
                Spent {formatMoney(cycle.spent, currency)} · Saved {formatMoney(cycle.saved, currency)}
              </p>
            </div>
            <CyclePill closed={cycle.closed} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
