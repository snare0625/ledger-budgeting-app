import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton, SubScreen } from "@/components/app/chrome";
import { updateCurrency } from "@/lib/data/actions";
import { getProfile } from "@/lib/data/queries";
import { CURRENCIES, type Currency } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Currency · Ledger" };

export default function CurrencyPage() {
  return (
    <SubScreen back="/settings" backLabel="Settings">
      <h1 className="mb-1.5 text-title-sm text-ink">Currency</h1>
      <p className="mb-[22px] text-[14.5px] leading-normal font-medium text-sub">
        Changes how amounts are shown. Amounts aren&apos;t converted.
      </p>
      <Suspense fallback={<Skeleton className="h-[228px] rounded-panel" />}>
        <CurrencyPicker />
      </Suspense>
    </SubScreen>
  );
}

async function CurrencyPicker() {
  const { currency: current } = await getProfile();

  return (
    <form action={updateCurrency} className="divide-y divide-line overflow-hidden rounded-panel bg-soft">
      {(Object.keys(CURRENCIES) as Currency[]).map((code) => {
        const selected = code === current;
        return (
          <button
            key={code}
            type="submit"
            name="currency"
            value={code}
            aria-pressed={selected}
            className="flex w-full items-center justify-between gap-3 px-[18px] py-4 text-left transition-colors hover:bg-line/60"
          >
            <span>
              <span className="block text-body font-semibold text-ink">{CURRENCIES[code].label}</span>
              <span className="text-tab font-medium text-sub">
                {code} {CURRENCIES[code].symbol}
              </span>
            </span>
            <Check className={cn("size-5 text-green", !selected && "invisible")} strokeWidth={2.4} />
          </button>
        );
      })}
    </form>
  );
}
