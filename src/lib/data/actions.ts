"use server";

import { refresh, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { routes } from "@/lib/auth/routes";
import { isUnlocked } from "@/lib/auth/session";
import { ACTIVITY_CATEGORIES, CATEGORIES, parseAmount } from "@/lib/budget";
import { FLASH_COOKIE, type FlashCode } from "@/lib/flash";
import { isCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

// Mutations for the budgeting screens. Each action re-checks the session and
// the passcode lock itself (Server Actions are reachable by direct POST), and
// writes through the user's own client so RLS and the closed-cycle trigger apply.

export type FormState = { error?: string; ok?: boolean; values?: Record<string, string> };

const uuid = z.uuid();
const isUuid = (value: unknown): value is string => uuid.safeParse(value).success;
const name = z.string().trim().min(1).max(80);
const note = z.string().trim().max(500, "Keep the note under 500 characters.");

async function authorize() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) redirect(routes.login);
  if (!(await isUnlocked(userId))) redirect(routes.unlock);
  return { supabase, userId };
}

type Client = Awaited<ReturnType<typeof authorize>>["supabase"];

async function flash(code: FlashCode) {
  (await cookies()).set(FLASH_COOKIE, code, { path: "/", maxAge: 60, sameSite: "lax" });
}

/** Echo submitted fields back so the form keeps them after a failed submit. */
function echo(formData: FormData, ...keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, formData.get(k)?.toString() ?? ""]));
}

function writeError(error: { code?: string }) {
  return error.code === "P0001"
    ? "This cycle is closed and read-only."
    : "Couldn't save your changes. Try again.";
}

async function openCycleId(supabase: Client) {
  const { data, error } = await supabase.from("cycles").select("id").eq("closed", false).maybeSingle();
  if (error) throw new Error(`Couldn't load the current cycle: ${error.message}`);
  return data?.id ?? null;
}

// ---------------------------------------------------------------------------
// Line items
// ---------------------------------------------------------------------------

export async function saveItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const values = echo(formData, "name", "category", "amount");

  const itemName = name.safeParse(formData.get("name"));
  const amount = parseAmount(formData.get("amount"));
  if (!itemName.success || amount === null) {
    return { error: "Name and amount are required.", values };
  }
  const category = z.enum(CATEGORIES).safeParse(formData.get("category"));
  if (!category.success) return { error: "Pick a category.", values };

  const fields = { name: itemName.data, category: category.data, amount };
  const id = formData.get("id");

  if (id) {
    if (!isUuid(id)) return { error: "That line item no longer exists." };
    const { data, error } = await supabase.from("items").update(fields).eq("id", id).select("id");
    if (error) return { error: writeError(error), values };
    if (!data.length) return { error: "That line item no longer exists.", values };
    await flash("item-updated");
  } else {
    const cycleId = await openCycleId(supabase);
    if (!cycleId) return { error: "Open a cycle before adding line items.", values };
    const { error } = await supabase.from("items").insert({ ...fields, cycle_id: cycleId });
    if (error) return { error: writeError(error), values };
    await flash("item-added");
  }

  redirect("/items");
}

export async function deleteItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { error: "That line item no longer exists." };

  const { error } = await supabase.from("items").delete().eq("id", id.data);
  if (error) return { error: writeError(error) };

  await flash("item-deleted");
  redirect("/items");
}

export async function toggleItem(id: string, enabled: boolean): Promise<FormState> {
  const { supabase } = await authorize();
  if (!isUuid(id) || typeof enabled !== "boolean") {
    return { error: "That line item no longer exists." };
  }

  const { error } = await supabase.from("items").update({ enabled }).eq("id", id);
  if (error) return { error: writeError(error) };

  refresh();
  return {};
}

// ---------------------------------------------------------------------------
// Cycles
// ---------------------------------------------------------------------------

/** Closes the current cycle and opens a new one (carrying over enabled items). */
export async function openCycle(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const values = echo(formData, "name", "income");

  const cycleName = name.safeParse(formData.get("name"));
  if (!cycleName.success) return { error: "Give the cycle a name.", values };

  // Blank income keeps the previous cycle's income.
  const rawIncome = values.income.trim();
  const income = rawIncome ? parseAmount(rawIncome) : null;
  if (rawIncome && income === null) return { error: "Enter a valid income.", values };

  const { error } = await supabase.rpc("open_new_cycle", {
    p_name: cycleName.data,
    ...(income !== null && { p_income: income }),
  });
  if (error) return { error: "Couldn't open the cycle. Try again.", values };

  await flash("cycle-opened");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateIncome(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const values = echo(formData, "income");

  const income = parseAmount(formData.get("income"));
  if (income === null) return { error: "Enter your monthly income.", values };

  const { data, error } = await supabase
    .from("cycles")
    .update({ income })
    .eq("closed", false)
    .select("id");
  if (error) return { error: writeError(error), values };
  if (!data.length) return { error: "Open a cycle first.", values };

  await flash("income-updated");
  redirect("/settings");
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

/** Logs a transaction in the open cycle. Income is money in; everything else is money out. */
export async function addActivity(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const values = echo(formData, "name", "category", "amount");

  const activityName = name.safeParse(formData.get("name"));
  const amount = parseAmount(formData.get("amount"));
  if (!activityName.success || amount === null) {
    return { error: "Name and amount are required.", values };
  }
  if (amount === 0) return { error: "Amount must be more than zero.", values };
  const category = z.enum(ACTIVITY_CATEGORIES).safeParse(formData.get("category"));
  if (!category.success) return { error: "Pick a category.", values };

  const cycleId = await openCycleId(supabase);
  if (!cycleId) return { error: "Open a cycle before logging activity.", values };

  const { error } = await supabase.from("activity").insert({
    cycle_id: cycleId,
    name: activityName.data,
    category: category.data,
    amount: category.data === "Income" ? amount : -amount,
  });
  if (error) return { error: writeError(error), values };

  await flash("activity-added");
  redirect("/");
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export async function saveGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const values = echo(formData, "name", "target", "saved", "note");

  const goalName = name.safeParse(formData.get("name"));
  const target = parseAmount(formData.get("target"));
  if (!goalName.success || target === null) {
    return { error: "Name and target are required.", values };
  }
  if (target <= 0) return { error: "Target must be more than zero.", values };

  const saved = values.saved.trim() ? parseAmount(values.saved) : 0;
  if (saved === null) return { error: "Enter a valid saved amount.", values };

  const goalNote = note.safeParse(values.note);
  if (!goalNote.success) return { error: goalNote.error.issues[0].message, values };

  const fields = { name: goalName.data, target, saved, note: goalNote.data || null };
  const id = formData.get("id");

  if (id) {
    if (!isUuid(id)) return { error: "That goal no longer exists." };
    const { data, error } = await supabase.from("goals").update(fields).eq("id", id).select("id");
    if (error) return { error: writeError(error), values };
    if (!data.length) return { error: "That goal no longer exists.", values };
    await flash("goal-updated");
    redirect(`/goals/${id}`);
  }

  const { error } = await supabase.from("goals").insert(fields);
  if (error) return { error: writeError(error), values };
  await flash("goal-added");
  redirect("/goals");
}

export async function deleteGoal(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await authorize();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { error: "That goal no longer exists." };

  const { error } = await supabase.from("goals").delete().eq("id", id.data);
  if (error) return { error: writeError(error) };

  await flash("goal-deleted");
  redirect("/goals");
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function updateCurrency(formData: FormData) {
  const { supabase, userId } = await authorize();
  const currency = formData.get("currency");
  if (!isCurrency(currency)) return;

  const { error } = await supabase.from("profiles").update({ currency }).eq("id", userId);
  if (error) throw new Error(`Couldn't update currency: ${error.message}`);

  await flash("currency-updated");
  redirect("/settings");
}
