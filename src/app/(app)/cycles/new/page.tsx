import type { Metadata } from "next";
import { Streamed } from "@/components/app/motion";
import { FormSkeleton, SubScreen } from "@/components/app/chrome";
import { getItems, getOpenCycle, getProfile, type CycleSummary } from "@/lib/data/queries";
import { formatMoney, monthName } from "@/lib/format";
import { NewCycleForm } from "./new-cycle-form";

export const metadata: Metadata = { title: "New cycle · Ledger" };

export default function NewCyclePage() {
  return (
    <SubScreen back="/" backLabel="Cancel">
      <h1 className="mb-1.5 text-title-sm text-ink">Open a new cycle</h1>
      <Streamed fallback={<FormSkeleton fields={2} />}>
        <NewCycle />
      </Streamed>
    </SubScreen>
  );
}

/** This month's name, or next month's if the open cycle already started this month. */
function suggestName(current: CycleSummary | null) {
  const now = new Date();
  const started = current && new Date(current.createdAt);
  const sameMonth =
    started && started.getFullYear() === now.getFullYear() && started.getMonth() === now.getMonth();
  return monthName(sameMonth ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : now);
}

async function NewCycle() {
  const [cycle, { currency }] = await Promise.all([getOpenCycle(), getProfile()]);
  const carry = cycle ? (await getItems(cycle.id)).filter((i) => i.enabled) : [];
  const more = carry.length - 3;

  return (
    <>
      <p className="mb-[22px] text-[14.5px] leading-normal font-medium text-sub">
        {cycle
          ? "Your current cycle will be closed and moved to history. Active line items carry over."
          : "Start your first budget cycle. You can add line items once it's open."}
      </p>
      <NewCycleForm
        suggestedName={suggestName(cycle)}
        income={cycle ? String(cycle.income) : ""}
      >
        {cycle && (
          <div className="mb-[22px] rounded-card bg-soft px-[18px] py-4">
            <p className="mb-2.5 text-overline text-sub uppercase">Carrying over</p>
            {carry.length ? (
              <>
                {carry.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-3 py-[5px] text-[14.5px] font-semibold text-ink"
                  >
                    <span className="truncate">{item.name}</span>
                    <span>{formatMoney(item.amount, currency)}</span>
                  </div>
                ))}
                {more > 0 && (
                  <p className="mt-1.5 text-tab font-semibold text-sub">
                    + {more} more {more === 1 ? "item" : "items"}
                  </p>
                )}
              </>
            ) : (
              <p className="text-label font-medium text-sub">No active line items to carry over.</p>
            )}
          </div>
        )}
      </NewCycleForm>
    </>
  );
}
