"use client";

import { useEffect } from "react";
import type { FormState } from "@/lib/data/actions";
import { cn } from "@/lib/utils";
import { useToast } from "./toaster";

// Light-theme form controls from the design's Add/Edit screens.

const inputClass =
  "w-full rounded-field border-[1.5px] border-line bg-soft px-4 py-[15px] text-base font-semibold text-ink outline-none transition-colors placeholder:text-sub/70 focus:border-ink/25";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-[18px] block">
      <span className="mb-2 block text-[13px] font-bold text-sub">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

/** Decimal input that strips anything but digits and a point as you type. */
export function AmountInput(props: Omit<React.ComponentProps<"input">, "type" | "inputMode">) {
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={props.placeholder ?? "0"}
      onChange={(e) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.]/g, "");
      }}
      className={cn(inputClass, props.className)}
    />
  );
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "resize-none", props.className)} />;
}

/** Segmented single choice (radio group styled as buttons). */
export function SegmentedChoice({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: readonly string[];
  defaultValue: string;
}) {
  return (
    <fieldset className="mb-[18px]">
      <legend className="mb-2 block text-[13px] font-bold text-sub">{label}</legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex-1 cursor-pointer rounded-tile border-[1.5px] border-line bg-soft py-3 text-center text-tab font-bold text-ink transition active:scale-[0.96] has-checked:border-ink has-checked:bg-ink has-checked:text-white has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={option === defaultValue}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PrimaryButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="submit"
      {...props}
      className={cn(
        "w-full rounded-field bg-ink py-4 text-base font-bold text-white transition hover:bg-ink/85 not-disabled:active:scale-[0.98] disabled:opacity-60",
        className,
      )}
    />
  );
}

export function DangerButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="submit"
      {...props}
      className={cn(
        "mt-1.5 w-full py-3.5 text-label font-bold text-red transition-opacity hover:opacity-80 disabled:opacity-50",
        className,
      )}
    />
  );
}

/** Surfaces a Server Action's error as a toast, as the design does for validation. */
export function useErrorToast(state: FormState) {
  const toast = useToast();
  // Each submit returns a new state object, so a repeated error toasts again.
  useEffect(() => {
    if (state.error) toast(state.error);
  }, [state, toast]);
}
