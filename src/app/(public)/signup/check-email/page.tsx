import Link from "next/link";

export const metadata = {
  title: "Check Your Email — BetterReads",
};

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-warm p-4">
      <div className="w-full max-w-md rounded-[24px] bg-bg-card p-10 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-deep/10">
          <svg
            className="h-8 w-8 text-green-deep"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h1 className="mb-3 font-display text-[24px] font-medium tracking-tight">
          Check your email
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-text-tertiary">
          We sent a confirmation link to your email address. Click the link to
          activate your account and start tracking your reading journey.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-green-deep hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
