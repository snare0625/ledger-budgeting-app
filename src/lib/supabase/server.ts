import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

/**
 * Supabase client for Server Components, Server Functions and Route Handlers.
 * Create a new one per request — never share it across requests.
 */
export async function createClient() {
  // Everything read through this client is per user and per request. The auth
  // client also reads the clock (token expiry), which Cache Components won't
  // allow while prerendering, so wait for the real request first.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the proxy refreshes the session on every request.
        }
      },
    },
  });
}
