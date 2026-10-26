import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  UNLOCK_COOKIE,
  createUnlockToken,
  readUnlockToken,
  unlockCookieOptions,
} from "./unlock-token";

/** The verified signed-in user's id, or null. */
export async function getUserId(supabase?: Awaited<ReturnType<typeof createClient>>) {
  const client = supabase ?? (await createClient());
  const { data } = await client.auth.getClaims();
  return data?.claims.sub ?? null;
}

export async function isUnlocked(userId: string) {
  const cookieStore = await cookies();
  return (await readUnlockToken(cookieStore.get(UNLOCK_COOKIE)?.value, userId)) !== null;
}

/** Server Functions / Route Handlers only — cookies are read-only while rendering. */
export async function setUnlocked(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(UNLOCK_COOKIE, await createUnlockToken(userId), unlockCookieOptions);
}

export async function clearUnlocked() {
  const cookieStore = await cookies();
  cookieStore.delete(UNLOCK_COOKIE);
}
