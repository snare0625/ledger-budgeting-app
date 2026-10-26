import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFallback, AuthSubtitle } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · Ledger" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { mode, next, reset, error } = await searchParams;
  const signup = mode === "signup";
  const resetting = reset === "1";

  return (
    <>
      <AuthSubtitle>
        {resetting
          ? "Sign in with email to set a new passcode"
          : signup
            ? "Create your account"
            : "Sign in to your budget"}
      </AuthSubtitle>
      <LoginForm
        key={signup ? "signup" : "signin"}
        mode={signup ? "signup" : "signin"}
        next={typeof next === "string" ? next : undefined}
        reset={resetting}
        linkError={error === "link"}
      />
    </>
  );
}
