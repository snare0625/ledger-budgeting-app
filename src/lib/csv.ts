/**
 * One CSV cell. Quotes when needed, and defuses spreadsheet formulas in text
 * (a cell starting with = + - @ would otherwise run when opened in Excel/Sheets).
 */
export function csvCell(value: string | number | boolean | null | undefined, { text = false } = {}) {
  let s = value === null || value === undefined ? "" : String(value);
  if (text && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function csvRow(cells: string[]) {
  return cells.join(",");
}
