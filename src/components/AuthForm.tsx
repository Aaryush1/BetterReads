"use client";

import { useActionState } from "react";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
  action: (
    prevState: { error: string | null },
    formData: FormData
  ) => Promise<{ error: string | null }>;
}

export default function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-warm p-4">
      <div className="flex w-full max-w-[880px] overflow-hidden rounded-[24px] bg-bg-card shadow-lg">
        {/* Green visual panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-green-deep p-12 sm:flex sm:w-[360px] sm:shrink-0">
          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.1),transparent_50%)]" />
          <span className="relative z-10 font-display text-2xl font-semibold italic text-white/90">
            BetterReads
          </span>
          <div className="relative z-10">
            <blockquote className="mb-4 font-display text-[22px] font-light italic leading-relaxed text-white/85">
              &ldquo;A reader lives a thousand lives before he dies. The man who
              never reads lives only one.&rdquo;
            </blockquote>
            <cite className="text-[13px] font-medium not-italic text-white/45">
              George R.R. Martin
            </cite>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 flex-col justify-center p-8 sm:p-12">
          <h2 className="font-display text-[28px] font-medium tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mb-8 text-sm text-text-tertiary">
            {isLogin
              ? "Sign in to continue to your library"
              : "Start tracking your reading journey"}
          </p>

          {state.error && (
            <div className="mb-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {state.error}
            </div>
          )}

          <form action={formAction}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-semibold text-text-secondary"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-[12px] border-[1.5px] border-border bg-bg-cream px-4 py-3 text-[15px] text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-green-deep focus:bg-bg-card focus:ring-[3px] focus:ring-green-deep/15"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-semibold text-text-secondary"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder={isLogin ? "Your password" : "At least 6 characters"}
                className="w-full rounded-[12px] border-[1.5px] border-border bg-bg-cream px-4 py-3 text-[15px] text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-green-deep focus:bg-bg-card focus:ring-[3px] focus:ring-green-deep/15"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-[12px] bg-green-deep py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-green-medium disabled:opacity-60"
            >
              {pending
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-tertiary">
            {isLogin ? (
              <>
                New to BetterReads?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-green-deep hover:underline"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-green-deep hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
