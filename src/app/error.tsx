"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-tight text-text-primary">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-sm text-sm text-text-tertiary">
        An unexpected error occurred. Please try again, or return to the home
        page if the problem persists.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-green-deep px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-medium"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="rounded-full border-[1.5px] border-border px-6 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
