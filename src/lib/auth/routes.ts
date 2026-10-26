export const routes = {
  login: "/login",
  unlock: "/unlock",
  passcodeSetup: "/passcode/setup",
  authConfirm: "/auth/confirm",
  home: "/",
} as const;

/** Reachable without a session. */
export function isPublicPath(pathname: string) {
  return pathname === routes.login || pathname.startsWith("/auth/");
}

/** Reachable with a session while the app is still locked. */
export function isLockPath(pathname: string) {
  return pathname === routes.unlock || pathname === routes.passcodeSetup;
}

/** Only allow same-origin relative redirects (blocks `//evil.com`, `/\evil.com`). */
export function safeNext(next: string | null | undefined, fallback: string = routes.home) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  if (isPublicPath(next) || isLockPath(next)) return fallback;
  return next;
}
