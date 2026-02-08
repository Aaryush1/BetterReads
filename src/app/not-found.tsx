import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-light">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-copper"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h1 className="mb-2 font-display text-4xl font-normal tracking-tight text-text-primary">
        Page not found
      </h1>
      <p className="mb-8 max-w-sm text-[15px] text-text-tertiary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-green-deep px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-medium"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="rounded-full border-[1.5px] border-border px-6 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
        >
          Search books
        </Link>
      </div>
    </div>
  );
}
