import Link from "next/link";

export default function BookNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
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
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
      </div>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-tight text-text-primary">
        Book not found
      </h2>
      <p className="mb-8 max-w-sm text-sm text-text-tertiary">
        We couldn&apos;t find this book. It may have been removed or the link
        might be incorrect.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/search"
          className="rounded-full bg-green-deep px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-medium"
        >
          Search books
        </Link>
        <Link
          href="/library"
          className="rounded-full border-[1.5px] border-border px-6 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
        >
          My Library
        </Link>
      </div>
    </div>
  );
}
