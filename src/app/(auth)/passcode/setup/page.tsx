import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthFallback } from "@/components/auth/auth-shell";
import { routes } from "@/lib/auth/routes";
import { getUserId, isUnlocked } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SetupPad } from "./setup-pad";

export const metadata: Metadata = { title: "Create passcode · Ledger" };

export default function PasscodeSetupPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Setup />
    </Suspense>
  );
}

async function Setup() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect(routes.login);

  // Replacing an existing passcode requires an unlocked app (i.e. a fresh
  // email sign-in via "Forgot passcode"); the DB re-checks sign-in recency.
  const { data: hasPasscode } = await supabase.rpc("has_passcode");
  if (hasPasscode && !(await isUnlocked(userId))) redirect(routes.unlock);

  return <SetupPad resetting={Boolean(hasPasscode)} />;
}
