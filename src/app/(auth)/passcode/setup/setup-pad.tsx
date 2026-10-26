"use client";

import { useState } from "react";
import { PasscodePad } from "@/components/auth/passcode-pad";
import { createPasscode, signOut } from "@/lib/auth/actions";

type Step = { kind: "create"; error?: string } | { kind: "confirm"; first: string };

export function SetupPad({ resetting }: { resetting: boolean }) {
  const [step, setStep] = useState<Step>({ kind: "create" });
  // Remount the pad per step so it starts empty.
  const [round, setRound] = useState(0);

  const advance = (next: Step) => {
    setStep(next);
    setRound((r) => r + 1);
  };

  const footer = (
    <form action={signOut}>
      <button type="submit" className="hover:text-white/60">
        Not you? Sign out
      </button>
    </form>
  );

  if (step.kind === "create") {
    return (
      <PasscodePad
        key={round}
        subtitle={resetting ? "Choose a new 4-digit passcode" : "Create a 4-digit passcode"}
        initialError={step.error}
        onComplete={async (code) => advance({ kind: "confirm", first: code })}
        footer={footer}
      />
    );
  }

  return (
    <PasscodePad
      key={round}
      subtitle="Enter it again to confirm"
      onComplete={async (code) => {
        if (code !== step.first) {
          advance({ kind: "create", error: "Passcodes didn't match — try again" });
          return;
        }
        return createPasscode(code);
      }}
      footer={footer}
    />
  );
}
