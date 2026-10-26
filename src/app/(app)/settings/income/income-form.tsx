"use client";

import { useActionState } from "react";
import { AmountInput, Field, PrimaryButton, useErrorToast } from "@/components/app/form";
import { updateIncome, type FormState } from "@/lib/data/actions";

const initial: FormState = {};

export function IncomeForm({ income }: { income: string }) {
  const [state, action, pending] = useActionState(updateIncome, initial);
  useErrorToast(state);

  return (
    <form action={action} noValidate>
      <Field label="Income">
        <AmountInput name="income" defaultValue={state.values?.income ?? income} />
      </Field>
      <PrimaryButton className="mt-1" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </PrimaryButton>
    </form>
  );
}
