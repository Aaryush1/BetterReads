"use client";

import { useState, useEffect, useCallback } from "react";
import type { Shelf, UserBook } from "@/types/book";
import BookCover from "@/components/BookCover";
import ShelfManager from "@/components/ShelfManager";
import Link from "next/link";

interface ShelfWithCount extends Shelf {
  bookCount: number;
}

export default function LibraryPage() {
  const [shelves, setShelves] = useState<ShelfWithCount[]>([]);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [shelvesRes, booksRes] = await Promise.all([
        fetch("/api/shelves"),
        fetch("/api/shelf"),
      ]);
      const shelvesData = await shelvesRes.json();
      const booksData = await booksRes.json();

      const allShelves: Shelf[] = shelvesData.shelves ?? [];
      const allBooks: UserBook[] = booksData.books ?? [];

      // Count books per shelf
      const shelvesWithCounts: ShelfWithCount[] = allShelves.map((s) => ({
        ...s,
        bookCount: allBooks.filter((b) => b.shelfId === s.id).length,
      }));

      setShelves(shelvesWithCounts);
      setBooks(allBooks);

      // Set initial active tab if not set
      if (!activeShelfId && allShelves.length > 0) {
        setActiveShelfId(null); // null = "All Books"
      }
    } catch {
      // Silently fail — empty state will show
    } finally {
      setLoading(false);
    }
  }, [activeShelfId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBooks = activeShelfId
    ? books.filter((b) => b.shelfId === activeShelfId)
    : books;

  const totalBooks = books.length;

  if (loading) {
    return <LibrarySkeleton />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-normal tracking-tight text-text-primary">
            My Library
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {totalBooks} book{totalBooks !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowManager(true)}
          className="rounded-[var(--radius-md)] border-[1.5px] border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
        >
          Manage shelves
        </button>
      </div>

      {/* Shelf tabs */}
      <div className="mb-7 flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveShelfId(null)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-5 py-2.5 text-sm font-medium transition-all ${
            activeShelfId === null
              ? "border-green-deep/15 bg-green-light font-semibold text-green-deep"
              : "border-transparent text-text-tertiary hover:bg-black/[0.02] hover:text-text-secondary dark:hover:bg-white/[0.03]"
          }`}
        >
          All
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeShelfId === null
                ? "bg-green-deep/15 text-green-deep"
                : "bg-black/[0.06] dark:bg-white/[0.08]"
            }`}
          >
            {totalBooks}
          </span>
        </button>
        {shelves.map((shelf) => (
          <button
            key={shelf.id}
            onClick={() => setActiveShelfId(shelf.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-5 py-2.5 text-sm font-medium transition-all ${
              activeShelfId === shelf.id
                ? "border-green-deep/15 bg-green-light font-semibold text-green-deep"
                : "border-transparent text-text-tertiary hover:bg-black/[0.02] hover:text-text-secondary dark:hover:bg-white/[0.03]"
            }`}
          >
            {shelf.name}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeShelfId === shelf.id
                  ? "bg-green-deep/15 text-green-deep"
                  : "bg-black/[0.06] dark:bg-white/[0.08]"
              }`}
            >
              {shelf.bookCount}
            </span>
          </button>
        ))}
      </div>

      {/* Book grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-6 pb-12">
          {filteredBooks.map((book) => (
            <Link
              key={book.id}
              href={`/book/${book.googleBookId}`}
              className="group flex cursor-pointer flex-col gap-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5"
            >
              <BookCover src={book.coverUrl} title={book.title} size="md" />
              <div className="min-w-0">
                <p className="truncate font-display text-[13px] font-semibold leading-tight text-text-primary transition-colors group-hover:text-green-deep">
                  {book.title}
                </p>
                <p className="truncate text-xs text-text-tertiary">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-text-secondary">No books here yet</p>
          <p className="mt-1 text-sm text-text-tertiary">
            <Link href="/search" className="text-green-deep hover:underline">
              Search for books
            </Link>{" "}
            to add to your library.
          </p>
        </div>
      )}

      {/* Shelf Manager modal */}
      {showManager && (
        <ShelfManager
          shelves={shelves}
          onUpdate={() => {
            fetchData();
          }}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div>
      <div className="mb-2">
        <div className="h-9 w-40 animate-pulse rounded-md bg-border-light" />
        <div className="mt-2 h-4 w-20 animate-pulse rounded-md bg-border-light" />
      </div>
      <div className="mb-7 flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 animate-pulse rounded-full bg-border-light"
          />
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-[2/3] w-full animate-pulse rounded-[var(--radius-md)] bg-border-light" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-border-light" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-border-light" />
          </div>
        ))}
      </div>
    </div>
  );
}
