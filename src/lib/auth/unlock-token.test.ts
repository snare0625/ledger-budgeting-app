import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  UNLOCK_TTL_SECONDS,
  createUnlockToken,
  readUnlockToken,
  shouldRefresh,
} from "./unlock-token";

const USER = "5e9a1f3c-7d2b-4c8e-9f10-1a2b3c4d5e6f";
const OTHER = "00000000-0000-0000-0000-00000000000b";

beforeAll(() => {
  process.env.LOCK_COOKIE_SECRET = "test-secret-that-is-at-least-32-chars-long";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("unlock token", () => {
  it("round-trips for the same user", async () => {
    const token = await createUnlockToken(USER);
    const payload = await readUnlockToken(token, USER);
    expect(payload?.sub).toBe(USER);
  });

  it("rejects a token issued to another user", async () => {
    const token = await createUnlockToken(OTHER);
    expect(await readUnlockToken(token, USER)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createUnlockToken(OTHER);
    const [, signature] = token.split(".");
    const forgedBody = Buffer.from(
      JSON.stringify({ sub: USER, exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString("base64url");
    expect(await readUnlockToken(`${forgedBody}.${signature}`, USER)).toBeNull();
  });

  it("rejects missing, malformed and garbage tokens", async () => {
    expect(await readUnlockToken(undefined, USER)).toBeNull();
    expect(await readUnlockToken("", USER)).toBeNull();
    expect(await readUnlockToken("no-dot", USER)).toBeNull();
    expect(await readUnlockToken("a.b", USER)).toBeNull();
    expect(await readUnlockToken("!!!.???", USER)).toBeNull();
  });

  it("expires after the TTL and asks for refresh past half-life", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T12:00:00Z"));
    const token = await createUnlockToken(USER);

    const fresh = await readUnlockToken(token, USER);
    expect(fresh && shouldRefresh(fresh)).toBe(false);

    vi.setSystemTime(new Date(Date.now() + (UNLOCK_TTL_SECONDS / 2 + 1) * 1000));
    const aging = await readUnlockToken(token, USER);
    expect(aging && shouldRefresh(aging)).toBe(true);

    vi.setSystemTime(new Date(Date.now() + UNLOCK_TTL_SECONDS * 1000));
    expect(await readUnlockToken(token, USER)).toBeNull();
  });
});
