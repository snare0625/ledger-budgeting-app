import { redirect } from "next/navigation";
import { Suspense } from "react";
import { lockApp, signOut } from "@/lib/auth/actions";
import { routes } from "@/lib/auth/routes";
import { getUserId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// Temporary signed-in landing page for reviewing the auth flow.
// Replaced by the Home screen in build step 5.
export default function HomePlaceholder() {
  return (
    <main className="flex flex-1 flex-col bg-hero-gradient px-gutter pt-16 pb-10">
      <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-white">
        <Suspense fallback="Hi 👋">
          <Greeting />
        </Suspense>
      </h1>
      <p className="mt-1 text-label font-medium text-dark-sub">
        Signed in and unlocked. The Home screen arrives in step 5.
      </p>

      <div className="mt-auto space-y-3">
        <form action={lockApp}>
          <button
            type="submit"
            className="w-full rounded-tile border border-dark-line bg-white/10 py-3 text-label font-bold text-white hover:bg-white/15"
          >
            Lock now
          </button>
        </form>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-field bg-tint-red py-4 text-body font-bold text-red hover:bg-tint-red/90"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

async function Greeting() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect(routes.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  return <>Hi, {profile?.display_name ?? "there"} 👋</>;
}
