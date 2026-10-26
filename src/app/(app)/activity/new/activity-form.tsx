"use client";

import { useActionState } from "react";
import {
  AmountInput,
  Field,
  PrimaryButton,
  SegmentedChoice,
  TextInput,
  useErrorToast,
} from "@/components/app/form";
import { ACTIVITY_CATEGORIES } from "@/lib/budget";
import { addActivity, type FormState } from "@/lib/data/actions";

const initial: FormState = {};

export function ActivityForm() {
  const [state, action, pending] = useActionState(addActivity, initial);
  useErrorToast(state);

  return (
    <form action={action} noValidate>
      <Field label="Name">
        <TextInput
          name="name"
          placeholder="e.g. Groceries"
          maxLength={80}
          autoComplete="off"
          defaultValue={state.values?.name}
        />
      </Field>
      <SegmentedChoice
        label="Category"
        name="category"
        options={ACTIVITY_CATEGORIES}
        defaultValue={state.values?.category || "Variable"}
      />
      <Field label="Amount">
        <AmountInput name="amount" defaultValue={state.values?.amount} />
      </Field>
      <PrimaryButton className="mt-1.5" disabled={pending}>
        {pending ? "Saving…" : "Add activity"}
      </PrimaryButton>
    </form>
  );
}
