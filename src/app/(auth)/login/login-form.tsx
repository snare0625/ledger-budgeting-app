"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { signIn, signUp, type AuthFormState } from "./actions";

type Props = {
  mode: "signin" | "signup";
  next?: string;
  reset: boolean;
  linkError: boolean;
};

const inputClass =
  "w-full rounded-field border-[1.5px] border-white/13 bg-white/5 px-4 py-[15px] text-base font-semibold text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/45 aria-invalid:border-red";

function Field({
  label,
  error,
  ...input
}: React.ComponentProps<"input"> & { label: string; error?: string }) {
  const errorId = `${input.name}-error`;
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-bold text-dark-sub">{label}</span>
      <input
        {...input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass}
      />
      {error && (
        <span id={errorId} className="mt-1.5 block text-[13px] font-semibold text-red">
          {error}
        </span>
      )}
    </label>
  );
}

export function LoginForm({ mode, next, reset, linkError }: Props) {
  const signup = mode === "signup";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup ? signUp : signIn,
    linkError ? { error: "That link is invalid or has expired. Sign in instead." } : {},
  );

  const toggleHref = signup ? "/login" : "/login?mode=signup";

  return (
    <form action={action} className="flex w-full flex-1 flex-col" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {reset && <input type="hidden" name="reset" value="1" />}

      <div className="space-y-4">
        {signup && (
          <Field
            label="Name"
            name="name"
            autoComplete="given-name"
            placeholder="Morgan"
            defaultValue={state.values?.name}
            error={state.fieldErrors?.name}
          />
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          placeholder={signup ? "At least 8 characters" : "••••••••"}
          error={state.fieldErrors?.password}
        />
      </div>

      <p
        role={state.error ? "alert" : "status"}
        className={cn(
          "mt-4 min-h-5 text-[13px] font-semibold",
          state.error ? "text-red" : "text-green",
        )}
      >
        {state.error ?? state.notice}
      </p>

      <div className="mt-auto pt-6">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-field bg-white py-4 text-base font-bold text-ink transition-opacity hover:bg-white/90 disabled:opacity-60"
        >
          {pending ? (signup ? "Creating account…" : "Signing in…") : signup ? "Create account" : "Sign in"}
        </button>
        {!reset && (
          <p className="mt-[22px] text-center text-[13px] font-semibold text-dark-sub">
            {signup ? "Already have an account? " : "New to Ledger? "}
            <Link href={toggleHref} className="font-bold text-white hover:text-white/80">
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
