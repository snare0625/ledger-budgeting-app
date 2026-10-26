"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { AmountInput, Field, PrimaryButton, TextInput, useErrorToast } from "@/components/app/form";
import { openCycle, type FormState } from "@/lib/data/actions";

const STAMP_MS = 1300;
const initial: FormState = {};

/** Cycle name + income. On success, shows the "Cycle opened" stamp, then goes Home. */
export function NewCycleForm({
  suggestedName,
  income,
  children,
}: {
  suggestedName: string;
  income: string;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(openCycle, initial);
  const router = useRouter();
  useErrorToast(state);

  useEffect(() => {
    if (!state.ok) return;
    const timer = setTimeout(() => router.push("/"), STAMP_MS);
    return () => clearTimeout(timer);
  }, [state, router]);

  const busy = pending || state.ok;

  return (
    <form action={action} noValidate>
      <Field label="Cycle name">
        <TextInput
          name="name"
          placeholder={suggestedName}
          maxLength={80}
          autoComplete="off"
          defaultValue={state.values?.name ?? suggestedName}
        />
      </Field>
      <Field label="Monthly income">
        <AmountInput name="income" defaultValue={state.values?.income ?? income} />
      </Field>

      {children}

      <PrimaryButton disabled={busy}>{busy ? "Opening…" : "Open cycle"}</PrimaryButton>

      {state.ok && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-[3px]"
        >
          <div className="flex size-24 animate-pop-in items-center justify-center rounded-full bg-green shadow-success">
            <svg
              width="46"
              height="46"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path
                d="M5 13l4 4L19 7"
                className="animate-draw-check [stroke-dasharray:24] [stroke-dashoffset:24]"
              />
            </svg>
          </div>
          <p className="mt-[18px] text-[19px] font-extrabold text-ink">Cycle opened</p>
        </div>
      )}
    </form>
  );
}
