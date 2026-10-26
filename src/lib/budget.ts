// Derived budget values (BUILD_PLAN.md "Data model"): computed in the app, never stored.

import type { Enums } from "@/lib/supabase/database.types";

export type Category = Enums<"item_category">;
export type ActivityCategory = Enums<"activity_category">;

export const CATEGORIES = ["Fixed", "Variable", "Savings"] as const satisfies readonly Category[];
export const ACTIVITY_CATEGORIES = [
  ...CATEGORIES,
  "Income",
] as const satisfies readonly ActivityCategory[];

type ItemLike = { category: Category; amount: number; enabled: boolean };

/** Σ enabled amounts, optionally for one category. */
export function plannedTotal(items: readonly ItemLike[], category?: Category) {
  return items
    .filter((i) => i.enabled && (!category || i.category === category))
    .reduce((sum, i) => sum + i.amount, 0);
}

export function goalProgress(saved: number, target: number) {
  const done = saved >= target;
  return {
    pct: target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0,
    done,
    left: Math.max(0, target - saved),
  };
}

/** % change in spending vs the previous cycle, or null with nothing to compare. */
export function spendingChange(spent: number, previousSpent: number | null) {
  if (previousSpent === null || previousSpent <= 0) return null;
  return Math.round(((spent - previousSpent) / previousSpent) * 100);
}

export function spendingInsight(change: number | null) {
  if (change === null) return "Log spending to compare cycles";
  if (change === 0) return "Spending is level with last cycle";
  return `Spending is ${change < 0 ? "down" : "up"} ${Math.abs(change)}% from last cycle`;
}

const MAX_AMOUNT = 9_999_999_999.99; // numeric(12, 2)

/** Parses a user-typed amount ("1,850.5" → 1850.5). Null if empty or invalid. */
export function parseAmount(raw: FormDataEntryValue | null | undefined) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned || cleaned.split(".").length > 2) return null;
  const value = Math.round(Number(cleaned) * 100) / 100;
  return Number.isFinite(value) && value <= MAX_AMOUNT ? value : null;
}
