"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { routes, safeNext } from "@/lib/auth/routes";
import { setUnlocked } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  notice?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  values?: { name?: string; email?: string };
};

const email = z.email("Enter a valid email address.").trim().toLowerCase();

const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(60, "Keep it under 60 characters."),
  email,
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Use at most 72 characters."),
});

function fieldErrors(error: z.ZodError): AuthFormState["fieldErrors"] {
  const out: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof NonNullable<AuthFormState["fieldErrors"]>;
    out[key] ??= issue.message;
  }
  return out;
}

/**
 * A fresh email sign-in proves identity, so it also unlocks the app. Users
 * without a passcode yet — or resetting a forgotten one — go to set one up.
 */
async function finishSignIn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
): Promise<never> {
  await setUnlocked(userId);
  const { data: hasPasscode } = await supabase.rpc("has_passcode");
  if (!hasPasscode || formData.get("reset") === "1") redirect(routes.passcodeSetup);
  redirect(safeNext(formData.get("next")?.toString()));
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = { email: formData.get("email")?.toString() ?? "" };
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return { error: "Confirm your email first — check your inbox for the link.", values };
    }
    if (error?.code === "invalid_credentials") {
      return { error: "Email or password is incorrect.", values };
    }
    return { error: "Couldn't sign in right now. Please try again.", values };
  }

  return finishSignIn(supabase, data.user.id, formData);
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
  };
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const origin =
    (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: `${origin}${routes.authConfirm}`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "An account with this email already exists. Sign in instead.", values };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: error.message }, values };
    }
    return { error: "Couldn't create your account right now. Please try again.", values };
  }

  // Email confirmation enabled: no session until the link is clicked.
  if (!data.session || !data.user) {
    return {
      notice: "Check your inbox — we sent a link to confirm your email.",
      values,
    };
  }

  return finishSignIn(supabase, data.user.id, formData);
}
