import type { Metadata } from "next";
import { SubScreen } from "@/components/app/chrome";
import { ActivityForm } from "./activity-form";

export const metadata: Metadata = { title: "Log activity · Ledger" };

export default function NewActivityPage() {
  return (
    <SubScreen back="/" backLabel="Home">
      <h1 className="mb-1.5 text-title-sm text-ink">Log activity</h1>
      <p className="mb-[22px] text-[14.5px] leading-normal font-medium text-sub">
        Record money in or out of the current cycle. Spending and savings count as money out.
      </p>
      <ActivityForm />
    </SubScreen>
  );
}
