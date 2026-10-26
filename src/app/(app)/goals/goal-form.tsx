"use client";

import { useActionState } from "react";
import {
  AmountInput,
  DangerButton,
  Field,
  PrimaryButton,
  TextArea,
  TextInput,
  useErrorToast,
} from "@/components/app/form";
import { deleteGoal, saveGoal, type FormState } from "@/lib/data/actions";
import type { Goal } from "@/lib/data/queries";

const initial: FormState = {};

/** Add / Edit goal. Edit mode adds Delete. */
export function GoalForm({ goal }: { goal?: Goal }) {
  const [saveState, save, saving] = useActionState(saveGoal, initial);
  const [deleteState, remove, deleting] = useActionState(deleteGoal, initial);
  useErrorToast(saveState);
  useErrorToast(deleteState);

  const values = saveState.values;
  const pending = saving || deleting;

  return (
    <form action={save} noValidate>
      {goal && <input type="hidden" name="id" value={goal.id} />}
      <Field label="Name">
        <TextInput
          name="name"
          placeholder="e.g. Kyoto trip"
          maxLength={80}
          autoComplete="off"
          defaultValue={values?.name ?? goal?.name}
        />
      </Field>
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <Field label="Target">
            <AmountInput name="target" defaultValue={values?.target ?? (goal ? String(goal.target) : "")} />
          </Field>
        </div>
        <div className="min-w-0 flex-1">
          <Field label="Saved">
            <AmountInput name="saved" defaultValue={values?.saved ?? (goal ? String(goal.saved) : "")} />
          </Field>
        </div>
      </div>
      <Field label="Note">
        <TextArea
          name="note"
          rows={3}
          maxLength={500}
          placeholder="Optional"
          defaultValue={values?.note ?? goal?.note ?? ""}
        />
      </Field>

      <PrimaryButton className="mt-1" disabled={pending}>
        {saving ? "Saving…" : goal ? "Save changes" : "Add goal"}
      </PrimaryButton>
      {goal && (
        <DangerButton formAction={remove} disabled={pending}>
          {deleting ? "Deleting…" : "Delete goal"}
        </DangerButton>
      )}
    </form>
  );
}
