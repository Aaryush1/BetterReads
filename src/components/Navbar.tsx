"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

const navTabs = [
  { label: "My Library", href: "/library" },
  { label: "Discover", href: "/discover" },
];

interface NavbarProps {
  userEmail?: string | null;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const initial = userEmail ? userEmail[0].toUpperCase() : "?";

  async function handleSignOut() {
    setMenuOpen(false);
    setMobileNavOpen(false);
    const res = await fetch("/auth/signout", { method: "POST" });
    if (res.redirected) {
      router.push(res.url);
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Hamburger button (mobile only) */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors hover:bg-bg-warm hover:text-text-primary sm:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-green-deep">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h1V2H4Zm3 0v20h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm5 0a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-8Zm1 4h6v2h-6V6Zm0 4h6v1h-6v-1Zm0 2h4v1h-4v-1Z" />
          </svg>
          <span className="hidden sm:inline">BetterReads</span>
        </Link>

        {/* Nav tabs (desktop) */}
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

        {/* Search bar */}
        <SearchBar className="ml-auto max-w-xs flex-1" />

        {/* Right side: theme toggle + avatar with menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-light text-sm font-semibold text-copper transition-shadow hover:ring-2 hover:ring-amber"
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              {initial}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-[12px] border border-border bg-bg-card shadow-md">
                {userEmail && (
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {userEmail}
                    </p>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:bg-bg-warm hover:text-text-primary"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileNavOpen && (
        <div className="border-t border-border bg-bg-cream px-4 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-1">
            {navTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-green-light text-green-deep"
                      : "text-text-secondary hover:bg-bg-warm hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="rounded-[var(--radius-sm)] px-4 py-2.5 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-bg-warm hover:text-text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
