export const CURRENCIES = {
  USD: { label: "US dollar", symbol: "$" },
  ZAR: { label: "South African rand", symbol: "R" },
  EUR: { label: "Euro", symbol: "€" },
  GBP: { label: "British pound", symbol: "£" },
} as const;

export type Currency = keyof typeof CURRENCIES;

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && Object.hasOwn(CURRENCIES, value);
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: Currency, cents: boolean) {
  const key = `${currency}:${cents}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: 2,
    });
    formatters.set(key, f);
  }
  return f;
}

/**
 * Whole amounts drop the cents ("$1,850"), others keep two places ("$64.20"),
 * as in the design. `signed` adds a "+" to positive amounts (activity rows).
 */
export function formatMoney(amount: number, currency: Currency = "USD", { signed = false } = {}) {
  const abs = Math.round(Math.abs(amount) * 100) / 100;
  const sign = amount < 0 && abs > 0 ? "-" : signed && abs > 0 ? "+" : "";
  return sign + formatter(currency, !Number.isInteger(abs)).format(abs);
}

/** "Today", "Yesterday", or a short date like "Aug 1". */
export function formatDay(iso: string, now = new Date()) {
  const date = new Date(iso);
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((day(now) - day(date)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

/** "September 2026" */
export function monthName(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
