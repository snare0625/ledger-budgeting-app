import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/app/chrome";
import { lockApp, signOut } from "@/lib/auth/actions";
import { getOpenCycle, getProfile } from "@/lib/data/queries";
import { CURRENCIES, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Settings · Ledger" };

const HELP_URL = "https://github.com/snare0625/ledger-budgeting-app/issues";

export default function SettingsPage() {
  return (
    <main className="flex-1 bg-sheet pb-nav-clearance">
      <PageHeader title="Settings" subtitle="Account" />
      <div className="px-gutter pt-3.5">
        <Suspense
          fallback={
            <>
              <Skeleton className="mb-4 h-[84px] rounded-panel" />
              <Skeleton className="mb-4 h-[114px] rounded-panel" />
            </>
          }
        >
          <Account />
        </Suspense>

        <div className="divide-y divide-line overflow-hidden rounded-panel bg-soft">
          <Row href="/export" label="Export ledger" value="CSV" download />
          <Row href={HELP_URL} label="Help & support" external />
        </div>

        <form action={lockApp} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-field bg-soft py-4 text-body font-bold text-ink transition-colors hover:bg-line"
          >
            Lock now
          </button>
        </form>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-field bg-tint-red py-4 text-body font-bold text-red transition-colors hover:bg-tint-red/80"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

async function Account() {
  const [profile, cycle] = await Promise.all([getProfile(), getOpenCycle()]);

  return (
    <>
      <div className="mb-4 flex items-center gap-3.5 rounded-panel bg-soft p-4">
        <div
          aria-hidden
          className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl bg-ink text-[22px] font-extrabold text-white"
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-heading text-ink">{profile.name}</p>
          <p className="truncate text-label font-medium text-sub">{profile.email}</p>
        </div>
      </div>

      <div className="mb-4 divide-y divide-line overflow-hidden rounded-panel bg-soft">
        <Row
          href="/settings/currency"
          label="Currency"
          value={`${profile.currency} ${CURRENCIES[profile.currency].symbol}`}
        />
        <Row
          href={cycle ? "/settings/income" : "/cycles/new"}
          label="Monthly income"
          value={cycle ? formatMoney(cycle.income, profile.currency) : "Not set"}
        />
      </div>
    </>
  );
}

function Row({
  href,
  label,
  value,
  external = false,
  download = false,
}: {
  href: string;
  label: string;
  value?: string;
  external?: boolean;
  download?: boolean;
}) {
  const content = (
    <>
      <span>{label}</span>
      <span className="flex items-center gap-2 text-[14.5px] font-semibold text-sub">
        {value}
        <ChevronRight className="size-4" strokeWidth={2} />
      </span>
    </>
  );
  const className =
    "flex w-full items-center justify-between gap-3 px-[18px] py-4 text-body font-semibold text-ink transition-colors hover:bg-line/60";

  // Plain anchors for the CSV download (a Route Handler) and the external link.
  if (external || download) {
    return (
      <a
        href={href}
        className={className}
        {...(external && { target: "_blank", rel: "noreferrer" })}
        {...(download && { download: true })}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
