import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { routes } from "@/lib/auth/routes";
import { isCurrency, type Currency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/lib/supabase/database.types";

// Data access for Server Components. Every read goes through the signed-in
// user's Supabase client, so RLS scopes rows to them; nothing here takes a
// user id from the caller. Wrapped in React cache() to dedupe per request.

export type CycleSummary = {
  id: string;
  name: string;
  income: number;
  closed: boolean;
  createdAt: string;
  planned: number;
  spent: number;
  saved: number;
};

export type Item = Pick<Tables<"items">, "id" | "name" | "category" | "amount" | "enabled">;
export type Activity = Pick<Tables<"activity">, "id" | "name" | "category" | "amount" | "occurred_at">;
export type Goal = Pick<Tables<"goals">, "id" | "name" | "target" | "saved" | "note">;

const uuid = z.uuid();

/** The request's Supabase client and verified user. Redirects to sign-in without a session. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims.sub) redirect(routes.login);
  return { supabase, userId: data.claims.sub, email: data.claims.email };
});

function fail(what: string, error: { message: string }): never {
  throw new Error(`Couldn't load ${what}: ${error.message}`);
}

export const getProfile = cache(async () => {
  const { supabase, userId, email } = await getSession();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, currency")
    .eq("id", userId)
    .maybeSingle();
  if (error) fail("your profile", error);

  const currency: Currency = isCurrency(data?.currency) ? data.currency : "USD";
  return { name: data?.display_name ?? "there", email: email ?? "", currency };
});

const SUMMARY_COLUMNS = "id, name, income, closed, created_at, planned, spent, saved";

// cycle_summaries is a view, so the generated types mark every column nullable.
type SummaryRow = Omit<Database["public"]["Views"]["cycle_summaries"]["Row"], "user_id">;

function toSummary(row: SummaryRow): CycleSummary {
  return {
    id: String(row.id),
    name: String(row.name),
    income: Number(row.income ?? 0),
    closed: Boolean(row.closed),
    createdAt: String(row.created_at),
    planned: Number(row.planned ?? 0),
    spent: Number(row.spent ?? 0),
    saved: Number(row.saved ?? 0),
  };
}

/** The current open cycle, or null for a new user. */
export const getOpenCycle = cache(async () => {
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("cycle_summaries")
    .select(SUMMARY_COLUMNS)
    .eq("closed", false)
    .maybeSingle();
  if (error) fail("the current cycle", error);
  return data ? toSummary(data) : null;
});

/** All cycles, newest first. */
export const getCycles = cache(async () => {
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("cycle_summaries")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) fail("your cycles", error);
  return data.map(toSummary);
});

export const getCycle = cache(async (id: string) => {
  if (!uuid.safeParse(id).success) return null;
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("cycle_summaries")
    .select(SUMMARY_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) fail("that cycle", error);
  return data ? toSummary(data) : null;
});

/** The most recently closed cycle, for "vs last cycle" comparisons. */
export const getPreviousCycle = cache(async () => {
  const cycles = await getCycles();
  return cycles.find((c) => c.closed) ?? null;
});

export const getItems = cache(async (cycleId: string) => {
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, category, amount, enabled")
    .eq("cycle_id", cycleId)
    .order("created_at");
  if (error) fail("line items", error);
  return data.map((i) => ({ ...i, amount: Number(i.amount) }));
});

/** A line item in the open cycle (closed cycles are read-only). */
export const getOpenItem = cache(async (id: string) => {
  if (!uuid.safeParse(id).success) return null;
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("items")
    .select("id, name, category, amount, enabled, cycles!inner(closed)")
    .eq("id", id)
    .eq("cycles.closed", false)
    .maybeSingle();
  if (error) fail("that line item", error);
  if (!data) return null;
  const { id: itemId, name, category, amount, enabled } = data;
  return { id: itemId, name, category, amount: Number(amount), enabled } satisfies Item;
});

export const getActivity = cache(async (cycleId: string, limit?: number) => {
  const { supabase } = await getSession();
  let query = supabase
    .from("activity")
    .select("id, name, category, amount, occurred_at")
    .eq("cycle_id", cycleId)
    .order("occurred_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) fail("activity", error);
  return data.map((a) => ({ ...a, amount: Number(a.amount) }));
});

export const getGoals = cache(async () => {
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("goals")
    .select("id, name, target, saved, note")
    .order("created_at");
  if (error) fail("goals", error);
  return data.map((g) => ({ ...g, target: Number(g.target), saved: Number(g.saved) }));
});

export const getGoal = cache(async (id: string) => {
  if (!uuid.safeParse(id).success) return null;
  const { supabase } = await getSession();
  const { data, error } = await supabase
    .from("goals")
    .select("id, name, target, saved, note")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("that goal", error);
  return data ? { ...data, target: Number(data.target), saved: Number(data.saved) } : null;
});
