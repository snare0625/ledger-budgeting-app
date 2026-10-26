"use client";

import { useEffect } from "react";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-sheet px-10 text-center">
      <h1 className="text-title-sm text-ink">Something went wrong</h1>
      <p className="mt-2 text-label font-medium text-sub">
        We couldn&apos;t load this screen. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={retry}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-label font-bold text-white hover:bg-ink/85"
      >
        Try again
      </button>
    </main>
  );
}
