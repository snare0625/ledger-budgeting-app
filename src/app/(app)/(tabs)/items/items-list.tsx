"use client";

import Link from "next/link";
import { startTransition, useOptimistic } from "react";
import { nav } from "@/components/app/motion";
import { Switch } from "@/components/app/switch";
import { useToast } from "@/components/app/toaster";
import { CATEGORIES, plannedTotal } from "@/lib/budget";
import { toggleItem } from "@/lib/data/actions";
import type { Item } from "@/lib/data/queries";
import { formatMoney, type Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Line items grouped by category. Toggling flips `enabled` optimistically. */
export function ItemsList({ items, currency }: { items: Item[]; currency: Currency }) {
  const toast = useToast();
  const [optimistic, setEnabled] = useOptimistic(
    items,
    (state, { id, enabled }: { id: string; enabled: boolean }) =>
      state.map((i) => (i.id === id ? { ...i, enabled } : i)),
  );

  const toggle = (item: Item) =>
    startTransition(async () => {
      setEnabled({ id: item.id, enabled: !item.enabled });
      const result = await toggleItem(item.id, !item.enabled);
      if (result.error) toast(result.error);
    });

  return (
    <div className="px-gutter pt-3">
      {CATEGORIES.map((category) => {
        const rows = optimistic.filter((i) => i.category === category);
        if (!rows.length) return null;
        const headingId = `group-${category}`;

        return (
          <section key={category} aria-labelledby={headingId} className="mt-[18px]">
            <div className="mb-2.5 flex items-baseline justify-between px-1">
              <h2 id={headingId} className="text-[13px] font-extrabold tracking-[0.04em] text-sub uppercase">
                {category}
              </h2>
              <span className="text-label font-bold text-ink">
                {formatMoney(plannedTotal(rows), currency)}
              </span>
            </div>
            <ul className="rounded-card bg-soft px-3.5 py-1">
              {rows.map((item, i) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 py-3 transition-opacity",
                    i > 0 && "border-t border-line",
                    !item.enabled && "opacity-50",
                  )}
                >
                  <Switch
                    checked={item.enabled}
                    onClick={() => toggle(item)}
                    aria-label={`Include ${item.name} in this cycle`}
                  />
                  <Link
                    href={`/items/${item.id}`}
                    transitionTypes={nav.forward}
                    className={cn(
                      "min-w-0 flex-1 truncate text-row font-bold text-ink hover:text-ink/75",
                      !item.enabled && "line-through",
                    )}
                  >
                    {item.name}
                  </Link>
                  <span className="text-row font-bold text-ink">{formatMoney(item.amount, currency)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
