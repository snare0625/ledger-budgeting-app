"use client";

import { PasscodePad } from "@/components/auth/passcode-pad";
import { forgotPasscode, verifyPasscode } from "@/lib/auth/actions";

export function UnlockPad({ next }: { next?: string }) {
  return (
    <PasscodePad
      subtitle="Enter your passcode"
      onComplete={(code) => verifyPasscode(code, next)}
      footer={
        <form action={forgotPasscode}>
          <button type="submit" className="hover:text-white/60">
            Forgot passcode? Sign in with email
          </button>
        </form>
      }
    />
  );
}
