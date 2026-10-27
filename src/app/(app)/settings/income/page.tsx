import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Streamed } from "@/components/app/motion";
import { FormSkeleton, SubScreen } from "@/components/app/chrome";
import { getOpenCycle } from "@/lib/data/queries";
import { IncomeForm } from "./income-form";

export const metadata: Metadata = { title: "Monthly income · Ledger" };

export default function IncomePage() {
  return (
    <SubScreen back="/settings" backLabel="Settings">
      <h1 className="mb-1.5 text-title-sm text-ink">Monthly income</h1>
      <Streamed fallback={<FormSkeleton fields={1} />}>
        <Income />
      </Streamed>
    </SubScreen>
  );
}

async function Income() {
  const cycle = await getOpenCycle();
  if (!cycle) redirect("/cycles/new");

  return (
    <>
      <p className="mb-[22px] text-[14.5px] leading-normal font-medium text-sub">
        Income for {cycle.name}. New cycles start with this amount.
      </p>
      <IncomeForm income={String(cycle.income)} />
    </>
  );
}
