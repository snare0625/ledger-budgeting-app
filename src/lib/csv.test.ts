import { describe, expect, it } from "vitest";
import { csvCell } from "./csv";

describe("csvCell", () => {
  it("passes plain values through", () => {
    expect(csvCell("Rent")).toBe("Rent");
    expect(csvCell(-64.2)).toBe("-64.2");
    expect(csvCell(null)).toBe("");
  });

  it("quotes commas, quotes and newlines", () => {
    expect(csvCell("Rent, August")).toBe('"Rent, August"');
    expect(csvCell('The "big" one')).toBe('"The ""big"" one"');
    expect(csvCell("a\nb")).toBe('"a\nb"');
  });

  it("defuses formulas in text cells only", () => {
    expect(csvCell("=HYPERLINK(1)", { text: true })).toBe("'=HYPERLINK(1)");
    expect(csvCell("@SUM(A1)", { text: true })).toBe("'@SUM(A1)");
    expect(csvCell(-500)).toBe("-500");
  });
});
