import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/lib/auth/routes";
import { setUnlocked } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing route for email links (sign-up confirmation). Handles both the
 * token-hash template (`?token_hash=…&type=email`) and the PKCE code flow
 * (`?code=…`). A confirmed email counts as a fresh sign-in, so the app is
 * unlocked and the user continues to passcode setup.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  let userId: string | undefined;

  if (tokenHash && type) {
    const { data } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    userId = data.user?.id;
  } else if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    userId = data.user?.id;
  }

  const url = request.nextUrl.clone();
  url.search = "";

  if (!userId) {
    url.pathname = routes.login;
    url.searchParams.set("error", "link");
    return NextResponse.redirect(url);
  }

  await setUnlocked(userId);
  url.pathname = routes.passcodeSetup;
  return NextResponse.redirect(url);
}
