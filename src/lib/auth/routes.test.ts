import { describe, expect, it } from "vitest";
import { isLockPath, isPublicPath, safeNext } from "./routes";

describe("safeNext", () => {
  it("keeps same-origin app paths", () => {
    expect(safeNext("/goals")).toBe("/goals");
    expect(safeNext("/history?cycle=jul")).toBe("/history?cycle=jul");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["absolute URL", "https://evil.example"],
    ["protocol-relative", "//evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["relative path", "goals"],
    ["auth page", "/login"],
    ["lock page", "/unlock"],
  ])("falls back for %s", (_, input) => {
    expect(safeNext(input)).toBe("/");
  });
});

describe("route classes", () => {
  it("treats login and auth callbacks as public", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/auth/confirm")).toBe(true);
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/loginx")).toBe(false);
  });

  it("treats unlock and passcode setup as lock paths", () => {
    expect(isLockPath("/unlock")).toBe(true);
    expect(isLockPath("/passcode/setup")).toBe(true);
    expect(isLockPath("/passcode")).toBe(false);
  });
});
