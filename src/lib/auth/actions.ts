"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { routes, safeNext } from "./routes";
import { clearUnlocked, getUserId, setUnlocked } from "./session";

const passcode = z.string().regex(/^\d{4}$/);

export type PasscodeResult = { error?: string; lockedUntil?: string };

type VerifyResponse = { ok: boolean; attempts_left: number; locked_until: string | null };

export async function verifyPasscode(code: string, next?: string): Promise<PasscodeResult> {
  if (!passcode.safeParse(code).success) return { error: "Incorrect passcode — try again" };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect(routes.login);

  const { data, error } = await supabase.rpc("verify_passcode", { p_code: code });
  if (error) {
    if (error.code === "P0002") redirect(routes.passcodeSetup);
    return { error: "Couldn't check your passcode. Try again." };
  }

  const result = data as unknown as VerifyResponse;
  if (result.locked_until) {
    return { error: "Too many attempts", lockedUntil: result.locked_until };
  }
  if (!result.ok) {
    return {
      error:
        result.attempts_left <= 2
          ? `Incorrect passcode — ${result.attempts_left} ${result.attempts_left === 1 ? "try" : "tries"} left`
          : "Incorrect passcode — try again",
    };
  }

  await setUnlocked(userId);
  redirect(safeNext(next));
}

export async function createPasscode(code: string): Promise<PasscodeResult> {
  if (!passcode.safeParse(code).success) return { error: "Passcode must be 4 digits" };

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect(routes.login);

  const { error } = await supabase.rpc("set_passcode", { p_new: code });
  if (error) {
    // 28000: passcode already exists and the sign-in isn't recent enough to reset it
    if (error.code === "28000") {
      return { error: "For security, sign in with email again to reset your passcode." };
    }
    return { error: "Couldn't save your passcode. Try again." };
  }

  await setUnlocked(userId);
  redirect(routes.home);
}

/** Forgot passcode: sign out, then a fresh email sign-in leads to passcode setup. */
export async function forgotPasscode() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearUnlocked();
  redirect(`${routes.login}?reset=1`);
}

export async function lockApp() {
  await clearUnlocked();
  redirect(routes.unlock);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearUnlocked();
  redirect(routes.login);
}
