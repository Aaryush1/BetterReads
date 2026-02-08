"use client";

import { useState, useEffect, useRef } from "react";
import type { Shelf } from "@/types/book";

interface ShelfSelectorProps {
  /** Google Books volume ID */
  googleBookId: string;
  /** Book metadata for caching in user_books */
  title: string;
  author: string;
  coverUrl: string | null;
  /** Pre-loaded shelf status (if known) */
  currentUserBookId?: string;
  currentShelfId?: string;
  currentShelfName?: string;
  /** Variant: "button" for search results, "full" for book detail page */
  variant?: "button" | "full";
  /** Callback after a shelf change */
  onUpdate?: () => void;
}

export default function ShelfSelector({
  googleBookId,
  title,
  author,
  coverUrl,
  currentUserBookId,
  currentShelfId,
  currentShelfName,
  variant = "button",
  onUpdate,
}: ShelfSelectorProps) {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userBookId, setUserBookId] = useState(currentUserBookId);
  const [activeShelfId, setActiveShelfId] = useState(currentShelfId);
  const [activeShelfName, setActiveShelfName] = useState(currentShelfName);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync props when they change
  useEffect(() => {
    setUserBookId(currentUserBookId);
    setActiveShelfId(currentShelfId);
    setActiveShelfName(currentShelfName);
  }, [currentUserBookId, currentShelfId, currentShelfName]);

  // Fetch shelves when dropdown opens
  useEffect(() => {
    if (open && shelves.length === 0) {
      fetch("/api/shelves")
        .then((r) => r.json())
        .then((data) => setShelves(data.shelves ?? []))
        .catch(() => {});
    }
  }, [open, shelves.length]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function addToShelf(shelfId: string, shelfName: string) {
    setLoading(true);
    setOpen(false);

    // Optimistic update
    setActiveShelfId(shelfId);
    setActiveShelfName(shelfName);

    try {
      if (userBookId) {
        // Move to different shelf
        const res = await fetch(`/api/shelf/${userBookId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shelfId }),
        });
        if (!res.ok) throw new Error();
      } else {
        // Add new
        const res = await fetch("/api/shelf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleBookId, shelfId, title, author, coverUrl }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUserBookId(data.book?.id);
      }
      onUpdate?.();
    } catch {
      // Revert optimistic update
      setActiveShelfId(currentShelfId);
      setActiveShelfName(currentShelfName);
      setUserBookId(currentUserBookId);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromShelf() {
    if (!userBookId) return;
    setLoading(true);
    setOpen(false);

    // Optimistic update
    const prevBookId = userBookId;
    const prevShelfId = activeShelfId;
    const prevShelfName = activeShelfName;
    setUserBookId(undefined);
    setActiveShelfId(undefined);
    setActiveShelfName(undefined);

    try {
      const res = await fetch(`/api/shelf/${prevBookId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onUpdate?.();
    } catch {
      // Revert
      setUserBookId(prevBookId);
      setActiveShelfId(prevShelfId);
      setActiveShelfName(prevShelfName);
    } finally {
      setLoading(false);
    }
  }

  const isOnShelf = !!activeShelfId;

  // "full" variant — book detail page (two stacked buttons)
  if (variant === "full") {
    return (
      <div className="relative flex flex-col gap-2" ref={dropdownRef}>
        {isOnShelf ? (
          <button
            onClick={() => setOpen(!open)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-green-light px-4 py-3.5 text-sm font-semibold text-green-deep border-[1.5px] border-green-deep/15 transition-colors hover:bg-green-deep hover:text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : `✓ ${activeShelfName}`}
          </button>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-green-deep px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-medium disabled:opacity-60"
          >
            {loading ? "Saving..." : "+ Want to Read"}
          </button>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-[var(--radius-md)] border-[1.5px] border-border bg-bg-card px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-text-secondary"
        >
          {isOnShelf ? "Change shelf ↓" : "Choose shelf ↓"}
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg-card shadow-[var(--shadow-md)]">
            {/* Default shelves */}
            {shelves
              .filter((s) => s.isDefault)
              .map((shelf) => (
                <button
                  key={shelf.id}
                  onClick={() => addToShelf(shelf.id, shelf.name)}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-bg-warm ${
                    shelf.id === activeShelfId
                      ? "font-semibold text-green-deep"
                      : "text-text-primary"
                  }`}
                >
                  {shelf.id === activeShelfId && (
                    <span className="text-green-deep">✓</span>
                  )}
                  {shelf.name}
                </button>
              ))}

            {/* Custom shelves */}
            {shelves.filter((s) => !s.isDefault).length > 0 && (
              <>
                <div className="border-t border-border-light" />
                {shelves
                  .filter((s) => !s.isDefault)
                  .map((shelf) => (
                    <button
                      key={shelf.id}
                      onClick={() => addToShelf(shelf.id, shelf.name)}
                      className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-bg-warm ${
                        shelf.id === activeShelfId
                          ? "font-semibold text-green-deep"
                          : "text-text-primary"
                      }`}
                    >
                      {shelf.id === activeShelfId && (
                        <span className="text-green-deep">✓</span>
                      )}
                      {shelf.name}
                    </button>
                  ))}
              </>
            )}

            {/* Remove option */}
            {isOnShelf && (
              <>
                <div className="border-t border-border-light" />
                <button
                  onClick={removeFromShelf}
                  className="w-full px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  Remove from shelf
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // "button" variant — search results (pill button)
  return (
    <div className="relative" ref={dropdownRef}>
      {isOnShelf ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
          disabled={loading}
          className="whitespace-nowrap rounded-full border-[1.5px] border-green-deep/15 bg-green-light px-[18px] py-2 text-[13px] font-semibold text-green-deep transition-colors hover:border-green-deep hover:bg-green-deep hover:text-white disabled:opacity-60"
        >
          {loading ? "..." : `✓ ${activeShelfName}`}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
          disabled={loading}
          className="whitespace-nowrap rounded-full border-[1.5px] border-green-deep/12 bg-green-light px-[18px] py-2 text-[13px] font-semibold text-green-deep transition-colors hover:border-green-deep hover:bg-green-deep hover:text-white disabled:opacity-60"
        >
          {loading ? "..." : "+ Add to shelf"}
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg-card shadow-[var(--shadow-md)]">
          {shelves
            .filter((s) => s.isDefault)
            .map((shelf) => (
              <button
                key={shelf.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToShelf(shelf.id, shelf.name);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-bg-warm ${
                  shelf.id === activeShelfId
                    ? "font-semibold text-green-deep"
                    : "text-text-primary"
                }`}
              >
                {shelf.id === activeShelfId && (
                  <span className="text-green-deep">✓</span>
                )}
                {shelf.name}
              </button>
            ))}

          {shelves.filter((s) => !s.isDefault).length > 0 && (
            <>
              <div className="border-t border-border-light" />
              {shelves
                .filter((s) => !s.isDefault)
                .map((shelf) => (
                  <button
                    key={shelf.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToShelf(shelf.id, shelf.name);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-bg-warm ${
                      shelf.id === activeShelfId
                        ? "font-semibold text-green-deep"
                        : "text-text-primary"
                    }`}
                  >
                    {shelf.id === activeShelfId && (
                      <span className="text-green-deep">✓</span>
                    )}
                    {shelf.name}
                  </button>
                ))}
            </>
          )}

          {isOnShelf && (
            <>
              <div className="border-t border-border-light" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromShelf();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                Remove from shelf
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
