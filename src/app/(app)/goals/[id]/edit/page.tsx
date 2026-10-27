import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Streamed } from "@/components/app/motion";
import { FormSkeleton, SubScreen } from "@/components/app/chrome";
import { getGoal } from "@/lib/data/queries";
import { GoalForm } from "../../goal-form";

export const metadata: Metadata = { title: "Edit goal · Ledger" };

export default function EditGoalPage({ params }: PageProps<"/goals/[id]/edit">) {
  return (
    <SubScreen back="/goals" backLabel="Goals">
      <h1 className="mb-[22px] text-title-sm text-ink">Edit goal</h1>
      <Streamed fallback={<FormSkeleton fields={3} />}>
        <EditGoal params={params} />
      </Streamed>
    </SubScreen>
  );
}

async function EditGoal({ params }: Pick<PageProps<"/goals/[id]/edit">, "params">) {
  const { id } = await params;
  const goal = await getGoal(id);
  if (!goal) notFound();
  return <GoalForm goal={goal} />;
}
