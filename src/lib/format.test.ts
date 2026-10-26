import { describe, expect, it } from "vitest";
import { formatDay, formatMoney, isCurrency } from "./format";

describe("formatMoney", () => {
  it("drops cents on whole amounts and keeps two places otherwise", () => {
    expect(formatMoney(1850)).toBe("$1,850");
    expect(formatMoney(64.2)).toBe("$64.20");
  });

  it("signs negatives and, when asked, positives", () => {
    expect(formatMoney(-64.2)).toBe("-$64.20");
    expect(formatMoney(5200, "USD", { signed: true })).toBe("+$5,200");
    expect(formatMoney(0, "USD", { signed: true })).toBe("$0");
    expect(formatMoney(-0.001)).toBe("$0");
  });

  it("uses the display currency's symbol", () => {
    // ICU spaces letter symbols off from the number (a no-break space)
    expect(formatMoney(1850, "ZAR")).toMatch(/^R\s1,850$/);
    expect(formatMoney(12.5, "EUR")).toBe("€12.50");
    expect(formatMoney(-3, "GBP")).toBe("-£3");
  });
});

describe("isCurrency", () => {
  it("accepts supported codes only", () => {
    expect(isCurrency("ZAR")).toBe(true);
    expect(isCurrency("JPY")).toBe(false);
    expect(isCurrency("toString")).toBe(false);
  });
});

describe("formatDay", () => {
  const now = new Date(2026, 7, 20, 15, 0);

  it("names today and yesterday", () => {
    expect(formatDay(new Date(2026, 7, 20, 1, 0).toISOString(), now)).toBe("Today");
    expect(formatDay(new Date(2026, 7, 19, 23, 0).toISOString(), now)).toBe("Yesterday");
  });

  it("shows a short date otherwise, with the year only when it differs", () => {
    expect(formatDay(new Date(2026, 7, 1).toISOString(), now)).toBe("Aug 1");
    expect(formatDay(new Date(2025, 11, 31).toISOString(), now)).toBe("Dec 31, 2025");
  });
});
