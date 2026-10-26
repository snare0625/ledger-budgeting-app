import type { Metadata } from "next";
import { SubScreen } from "@/components/app/chrome";
import { GoalForm } from "../goal-form";

export const metadata: Metadata = { title: "New goal · Ledger" };

export default function NewGoalPage() {
  return (
    <SubScreen back="/goals" backLabel="Goals">
      <h1 className="mb-[22px] text-title-sm text-ink">New goal</h1>
      <GoalForm />
    </SubScreen>
  );
}
