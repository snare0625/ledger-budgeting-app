/** Subtitle under the "Ledger" heading on the auth screens. */
export function AuthSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 mb-[34px] min-h-5 text-center text-label font-medium text-dark-sub">
      {children}
    </p>
  );
}

/** Suspense fallback: reserves the subtitle line while the page streams in. */
export function AuthFallback() {
  return <AuthSubtitle>{" "}</AuthSubtitle>;
}
