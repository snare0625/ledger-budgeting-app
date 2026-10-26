import { csvCell, csvRow } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";

// Settings → Export ledger: every cycle with its income, line items and
// activity as one CSV. Gated by the proxy like any app route; RLS scopes rows.
export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims.sub) return new Response("Unauthorized", { status: 401 });

  const { data: cycles, error } = await supabase
    .from("cycles")
    .select(
      "name, income, closed, created_at, items(name, category, amount, enabled), activity(name, category, amount, occurred_at)",
    )
    .order("created_at")
    .order("created_at", { referencedTable: "items" })
    .order("occurred_at", { referencedTable: "activity" });
  if (error) return new Response("Couldn't export your ledger.", { status: 500 });

  const lines = [csvRow(["cycle", "status", "type", "name", "category", "amount", "included", "date"])];
  for (const cycle of cycles) {
    const base = [csvCell(cycle.name, { text: true }), cycle.closed ? "closed" : "open"];
    lines.push(
      csvRow([...base, "income", "Cycle income", "Income", csvCell(cycle.income), "", cycle.created_at.slice(0, 10)]),
    );
    for (const item of cycle.items) {
      lines.push(
        csvRow([
          ...base,
          "line_item",
          csvCell(item.name, { text: true }),
          item.category,
          csvCell(item.amount),
          item.enabled ? "yes" : "no",
          "",
        ]),
      );
    }
    for (const entry of cycle.activity) {
      lines.push(
        csvRow([
          ...base,
          "activity",
          csvCell(entry.name, { text: true }),
          entry.category,
          csvCell(entry.amount),
          "",
          entry.occurred_at.slice(0, 10),
        ]),
      );
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ledger-${today}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
