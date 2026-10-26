"use client";

import { useActionState } from "react";
import {
  AmountInput,
  DangerButton,
  Field,
  PrimaryButton,
  SegmentedChoice,
  TextInput,
  useErrorToast,
} from "@/components/app/form";
import { CATEGORIES } from "@/lib/budget";
import { deleteItem, saveItem, type FormState } from "@/lib/data/actions";
import type { Item } from "@/lib/data/queries";

const initial: FormState = {};

/** Add / Edit line item. Edit mode adds Delete. */
export function ItemForm({ item }: { item?: Item }) {
  const [saveState, save, saving] = useActionState(saveItem, initial);
  const [deleteState, remove, deleting] = useActionState(deleteItem, initial);
  useErrorToast(saveState);
  useErrorToast(deleteState);

  const values = saveState.values;
  const pending = saving || deleting;

  return (
    <form action={save} noValidate>
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Name">
        <TextInput
          name="name"
          placeholder="e.g. Rent"
          maxLength={80}
          autoComplete="off"
          defaultValue={values?.name ?? item?.name}
        />
      </Field>
      <SegmentedChoice
        label="Category"
        name="category"
        options={CATEGORIES}
        defaultValue={values?.category || item?.category || "Fixed"}
      />
      <Field label="Amount">
        <AmountInput name="amount" defaultValue={values?.amount ?? (item ? String(item.amount) : "")} />
      </Field>

      <PrimaryButton className="mt-1.5" disabled={pending}>
        {saving ? "Saving…" : item ? "Save changes" : "Add item"}
      </PrimaryButton>
      {item && (
        <DangerButton formAction={remove} disabled={pending}>
          {deleting ? "Deleting…" : "Delete item"}
        </DangerButton>
      )}
    </form>
  );
}
