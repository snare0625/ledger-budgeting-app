import { describe, expect, it } from "vitest";
import { goalProgress, parseAmount, plannedTotal, spendingChange, spendingInsight } from "./budget";

const items = [
  { category: "Fixed", amount: 1850, enabled: true },
  { category: "Fixed", amount: 180, enabled: true },
  { category: "Variable", amount: 520, enabled: true },
  { category: "Variable", amount: 95, enabled: false },
  { category: "Savings", amount: 400, enabled: true },
] as const;

describe("plannedTotal", () => {
  it("sums enabled items only", () => {
    expect(plannedTotal(items)).toBe(2950);
  });

  it("filters by category", () => {
    expect(plannedTotal(items, "Fixed")).toBe(2030);
    expect(plannedTotal(items, "Variable")).toBe(520);
    expect(plannedTotal([], "Savings")).toBe(0);
  });
});

describe("goalProgress", () => {
  it("rounds and caps at 100", () => {
    expect(goalProgress(8400, 12000)).toEqual({ pct: 70, done: false, left: 3600 });
    expect(goalProgress(3000, 2400)).toEqual({ pct: 100, done: true, left: 0 });
  });

  it("treats exactly reaching the target as funded", () => {
    expect(goalProgress(2400, 2400).done).toBe(true);
  });
});

describe("spendingChange", () => {
  it("compares against the previous cycle", () => {
    expect(spendingChange(3385, 3610)).toBe(-6);
    expect(spendingChange(4000, 3200)).toBe(25);
  });

  it("returns null without a usable baseline", () => {
    expect(spendingChange(100, null)).toBeNull();
    expect(spendingChange(100, 0)).toBeNull();
    expect(spendingChange(0, 3610)).toBeNull(); // nothing logged yet this cycle
  });

  it("phrases the insight", () => {
    expect(spendingInsight(-8)).toBe("Spending is down 8% from last cycle");
    expect(spendingInsight(12)).toBe("Spending is up 12% from last cycle");
    expect(spendingInsight(0)).toBe("Spending is level with last cycle");
    expect(spendingInsight(null)).toBe("Log spending to compare with last cycle");
  });
});

describe("parseAmount", () => {
  it.each([
    ["1850", 1850],
    ["1,850.50", 1850.5],
    ["$64.204", 64.2],
    ["0", 0],
    [".5", 0.5],
  ])("parses %s", (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each([[""], ["abc"], ["1.2.3"], [null], ["99999999999"]])("rejects %s", (input) => {
    expect(parseAmount(input)).toBeNull();
  });
});
