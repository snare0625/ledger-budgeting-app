import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLockPath, isPublicPath, routes } from "@/lib/auth/routes";
import {
  UNLOCK_COOKIE,
  createUnlockToken,
  readUnlockToken,
  shouldRefresh,
  unlockCookieOptions,
} from "@/lib/auth/unlock-token";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * Runs on every request:
 * 1. Refreshes the Supabase auth session, writing updated cookies to both the
 *    request (for downstream Server Components) and the response.
 * 2. Gates routes: no session → /login; session but app locked → /unlock.
 * 3. Slides the unlock cookie's expiry while the user is active.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        cacheHeaders = headers;
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Don't put code between createServerClient and getClaims(): getClaims()
  // validates the JWT and triggers the token refresh that calls setAll().
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  const { pathname, search } = request.nextUrl;

  // Redirects must carry any refreshed auth cookies along with them.
  const redirectTo = (path: string, keepNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (keepNext && pathname !== routes.home) {
      url.searchParams.set("next", pathname + search);
    }
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    Object.entries(cacheHeaders).forEach(([key, value]) =>
      redirect.headers.set(key, value),
    );
    return redirect;
  };

  if (!userId) {
    return isPublicPath(pathname) ? response : redirectTo(routes.login, true);
  }

  const unlock = await readUnlockToken(request.cookies.get(UNLOCK_COOKIE)?.value, userId);

  if (pathname === routes.login) {
    return redirectTo(unlock ? routes.home : routes.unlock);
  }
  if (isPublicPath(pathname)) return response;
  if (isLockPath(pathname)) {
    return pathname === routes.unlock && unlock ? redirectTo(routes.home) : response;
  }
  if (!unlock) return redirectTo(routes.unlock, true);

  if (shouldRefresh(unlock)) {
    response.cookies.set(UNLOCK_COOKIE, await createUnlockToken(userId), unlockCookieOptions);
  }
  return response;
}
