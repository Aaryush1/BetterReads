"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const navTabs = [
  { label: "My Library", href: "/library" },
  { label: "Discover", href: "/discover" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-green-deep">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h1V2H4Zm3 0v20h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm5 0a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-8Zm1 4h6v2h-6V6Zm0 4h6v1h-6v-1Zm0 2h4v1h-4v-1Z" />
          </svg>
          BetterReads
        </Link>

        {/* Nav tabs */}
        <div className="hidden items-center gap-1 sm:flex">
          {navTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-light text-green-deep"
                    : "text-text-secondary hover:bg-green-subtle hover:text-green-deep"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search bar placeholder */}
        <div className="ml-auto flex max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-bg-warm px-4 py-2 text-sm text-text-tertiary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search books...</span>
        </div>

        {/* Right side: avatar + theme toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-light text-sm font-semibold text-copper">
            ?
          </div>
        </div>
      </div>
    </nav>
  );
}
