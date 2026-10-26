import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthFallback } from "@/components/auth/auth-shell";
import { routes } from "@/lib/auth/routes";
import { getUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { UnlockPad } from "./unlock-pad";

export const metadata: Metadata = { title: "Unlock · Ledger" };

export default function UnlockPage({ searchParams }: PageProps<"/unlock">) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Unlock searchParams={searchParams} />
    </Suspense>
  );
}

async function Unlock({ searchParams }: Pick<PageProps<"/unlock">, "searchParams">) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect(routes.login);

  const { data: hasPasscode } = await supabase.rpc("has_passcode");
  if (!hasPasscode) redirect(routes.passcodeSetup);

  const { next } = await searchParams;
  return <UnlockPad next={typeof next === "string" ? next : undefined} />;
}
