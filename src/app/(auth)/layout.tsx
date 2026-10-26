import { Wallet } from "lucide-react";

// Static shell shared by login, unlock and passcode setup (design: Sign in).
// Prerendered; each page streams its session-dependent content inside.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center bg-signin-gradient px-10 pt-24 pb-[46px]">
      <div className="flex size-[66px] items-center justify-center rounded-[18px] border border-white/14 bg-white/7">
        <Wallet className="size-[30px] text-white" strokeWidth={2} />
      </div>
      <h1 className="mt-[18px] text-title-sm text-white">Ledger</h1>
      {children}
    </main>
  );
}
