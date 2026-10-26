// The passcode lock's "unlocked" marker: an HttpOnly cookie holding
// base64url({ sub, exp }) + "." + HMAC-SHA256 signature. Bound to the signed-in
// user and short-lived (sliding expiry, refreshed by the proxy). Uses Web
// Crypto so it runs anywhere — proxy, Server Functions, Route Handlers.

export const UNLOCK_COOKIE = "ledger_unlock";
export const UNLOCK_TTL_SECONDS = 30 * 60;

type UnlockPayload = { sub: string; exp: number };

const encoder = new TextEncoder();
let keyPromise: Promise<CryptoKey> | undefined;

function getKey() {
  const secret = process.env.LOCK_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "LOCK_COOKIE_SECRET must be set to at least 32 characters (see .env.example).",
    );
  }
  keyPromise ??= crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return keyPromise;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

export async function createUnlockToken(userId: string) {
  const payload: UnlockPayload = { sub: userId, exp: nowSeconds() + UNLOCK_TTL_SECONDS };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the payload if the token is authentic, unexpired and belongs to `userId`. */
export async function readUnlockToken(
  token: string | undefined,
  userId: string,
): Promise<UnlockPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    // subtle.verify compares in constant time
    const valid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as UnlockPayload;
    if (payload.sub !== userId || payload.exp <= nowSeconds()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** True when less than half the TTL remains — the proxy re-issues the token then. */
export function shouldRefresh(payload: UnlockPayload) {
  return payload.exp - nowSeconds() < UNLOCK_TTL_SECONDS / 2;
}

export const unlockCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: UNLOCK_TTL_SECONDS,
};
