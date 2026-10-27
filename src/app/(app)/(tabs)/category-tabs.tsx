"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { IconTile } from "@/components/app/chrome";
import { nav } from "@/components/app/motion";
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
      <div
        role="tablist"
        aria-label="Budget view"
        className="relative mb-[18px] flex gap-1.5 rounded-full bg-soft p-[5px]"
      >
        {/* One white pill that slides under the active tab (4 tabs, 6px gaps). */}
        <span
          aria-hidden
          className="absolute inset-y-[5px] left-[5px] w-[calc((100%-28px)/4)] rounded-full bg-white shadow-pill transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ transform: `translateX(calc(${TABS.indexOf(tab)} * (100% + 6px)))` }}
        />
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "relative flex-1 rounded-full py-[9px] text-[13px] font-bold transition-colors duration-300",
              tab === t ? "text-ink" : "text-sub hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {insight}

      {/* Keyed so the list fades in fresh on each tab change. */}
      <div key={tab} role="tabpanel" aria-label={tab} className="animate-fade-in">
        {rows.length ? (
          rows.map((row, i) => (
            <Link
              key={row.key}
              href={row.href}
              transitionTypes={tab === "Overview" ? nav.tab : nav.forward}
              className={cn(
                "flex items-center gap-3.5 rounded-tile px-1 py-[13px] transition-colors active:bg-soft",
                i > 0 && "border-t border-line",
              )}
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
