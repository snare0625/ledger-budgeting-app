import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AddLink, EmptyState, PageHeader, Skeleton } from "@/components/app/chrome";
import { getItems, getOpenCycle, getProfile } from "@/lib/data/queries";
import { ItemsList } from "./items-list";

export const metadata: Metadata = { title: "Line items · Ledger" };

export default function ItemsPage() {
  return (
    <main className="flex-1 bg-sheet pb-nav-clearance">
      <Suspense
        fallback={
          <>
            <PageHeader title="Line items" subtitle={" "} />
            <div className="space-y-[18px] px-gutter pt-[30px]">
              <Skeleton className="h-[150px]" />
              <Skeleton className="h-[150px]" />
            </div>
          </>
        }
      >
        <Items />
      </Suspense>
    </main>
  );
}

const inbox = <Inbox className="size-[46px]" strokeWidth={1.6} />;

async function Items() {
  const [cycle, { currency }] = await Promise.all([getOpenCycle(), getProfile()]);

  if (!cycle) {
    return (
      <>
        <PageHeader title="Line items" />
        <EmptyState icon={inbox}>
          No open cycle yet.{" "}
          <Link href="/cycles/new" className="font-bold text-blue hover:text-blue-hover">
            Open your first cycle
          </Link>{" "}
          to start the ledger.
        </EmptyState>
      </>
    );
  }

  const items = await getItems(cycle.id);

  return (
    <>
      <PageHeader title="Line items" subtitle={cycle.name} action={<AddLink href="/items/new" />} />
      {items.length ? (
        <ItemsList items={items} currency={currency} />
      ) : (
        <EmptyState icon={inbox}>No line items yet. Add your first expense to start the ledger.</EmptyState>
      )}
    </>
  );
}
