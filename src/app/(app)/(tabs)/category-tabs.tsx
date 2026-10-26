"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { IconTile } from "@/components/app/chrome";
import { CATEGORIES, plannedTotal } from "@/lib/budget";
import type { Item } from "@/lib/data/queries";
import { formatMoney, type Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = ["Overview", ...CATEGORIES] as const;
type Tab = (typeof TABS)[number];

/** Home's segmented control: category totals, or one category's active items. */
export function CategoryTabs({
  items,
  currency,
  insight,
}: {
  items: Item[];
  currency: Currency;
  insight: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("Overview");

  const rows =
    tab === "Overview"
      ? CATEGORIES.map((category) => ({
          key: category,
          href: "/items",
          category,
          label: category,
          amount: plannedTotal(items, category),
        }))
      : items
          .filter((i) => i.category === tab)
          .map((i) => ({
            key: i.id,
            href: `/items/${i.id}`,
            category: i.category,
            label: i.name,
            amount: i.amount,
          }));

  return (
    <>
      <div role="tablist" aria-label="Budget view" className="mb-[18px] flex gap-1.5 rounded-full bg-soft p-[5px]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-full py-[9px] text-[13px] font-bold transition-colors",
              tab === t ? "bg-white text-ink shadow-pill" : "text-sub hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {insight}

      <div role="tabpanel" aria-label={tab}>
        {rows.length ? (
          rows.map((row, i) => (
            <Link
              key={row.key}
              href={row.href}
              className={cn("flex items-center gap-3.5 px-1 py-[13px]", i > 0 && "border-t border-line")}
            >
              <IconTile category={row.category} />
              <span className="min-w-0 flex-1 truncate text-row font-bold text-ink">{row.label}</span>
              <span className="text-row font-bold text-ink">{formatMoney(row.amount, currency)}</span>
              <ChevronRight className="size-[17px] text-sub" strokeWidth={2} />
            </Link>
          ))
        ) : (
          <p className="px-1 py-5 text-label font-medium text-sub">No active items in this category.</p>
        )}
      </div>
    </>
  );
}
