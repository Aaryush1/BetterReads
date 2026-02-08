"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Suggestion {
  googleBookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
}

interface SearchBarProps {
  defaultValue?: string;
  className?: string;
}

const cache = new Map<string, Suggestion[]>();
const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

export default function SearchBar({
  defaultValue = "",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    // Check cache first
    if (cache.has(q)) {
      setSuggestions(cache.get(q)!);
      setOpen(true);
      setLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/books/suggest?q=${encodeURIComponent(q)}`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const data = await res.json();
      const items: Suggestion[] = data.suggestions ?? [];
      cache.set(q, items);
      setSuggestions(items);
      setOpen(true);
    } catch {
      // Aborted or network error — ignore
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, DEBOUNCE_MS);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleSelect(suggestion: Suggestion) {
    setOpen(false);
    setQuery("");
    router.push(`/book/${suggestion.googleBookId}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="flex w-full items-center gap-2 rounded-full border border-border bg-bg-warm px-4 py-2 text-sm transition-colors focus-within:border-green-deep focus-within:ring-2 focus-within:ring-green-deep/15">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-text-tertiary"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search books..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
            autoComplete="off"
          />
          {loading && (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-border-light border-t-green-deep" />
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg-card shadow-[var(--shadow-lg)]">
          {suggestions.map((s, i) => (
            <Link
              key={s.googleBookId}
              href={`/book/${s.googleBookId}`}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                i === activeIndex
                  ? "bg-green-subtle"
                  : "hover:bg-bg-warm"
              }`}
            >
              {/* Tiny cover */}
              <div className="h-10 w-7 shrink-0 overflow-hidden rounded-[3px]">
                {s.coverUrl ? (
                  <Image
                    src={s.coverUrl}
                    alt=""
                    width={28}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-deep/20 to-amber/10">
                    <span className="text-[6px] font-bold text-text-tertiary">
                      ?
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {s.title}
                </p>
                <p className="truncate text-xs text-text-tertiary">
                  {s.author}
                </p>
              </div>
            </Link>
          ))}
          {/* "See all results" link */}
          <button
            onClick={() => {
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }}
            className="flex w-full items-center justify-center border-t border-border-light px-4 py-2.5 text-[13px] font-medium text-green-deep transition-colors hover:bg-green-subtle"
          >
            See all results for &ldquo;{query.trim()}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
