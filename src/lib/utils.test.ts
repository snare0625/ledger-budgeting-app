import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps custom font sizes alongside text colors", () => {
    expect(cn("mt-2 text-display", "text-white")).toBe("mt-2 text-display text-white");
    expect(cn("text-overline text-blue")).toBe("text-overline text-blue");
  });

  it("still resolves real conflicts", () => {
    expect(cn("text-body", "text-label")).toBe("text-label");
    expect(cn("text-ink", "text-white")).toBe("text-white");
    expect(cn("shadow-nav", "shadow-pill")).toBe("shadow-pill");
  });
});
