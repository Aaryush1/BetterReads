"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import ShelfSelector from "@/components/ShelfSelector";
import type { Book, UserBook } from "@/types/book";

interface RecommendationRow {
  reason: string;
  sourceBook: { title: string; author: string | null } | null;
  books: Book[];
}

export default function DiscoverPage() {
  const [rows, setRows] = useState<RecommendationRow[]>([]);
  const [userBooks, setUserBooks] = useState<Map<string, UserBook>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [recsRes, shelfRes] = await Promise.all([
        fetch("/api/recommendations"),
        fetch("/api/shelf"),
      ]);
      const recsData = await recsRes.json();
      const shelfData = await shelfRes.json();

      setRows(recsData.rows ?? []);

      const allBooks: UserBook[] = shelfData.books ?? [];
      const map = new Map<string, UserBook>();
      allBooks.forEach((b) => map.set(b.googleBookId, b));
      setUserBooks(map);
    } catch {
      // Silent fail — empty state will show
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function refreshUserBooks() {
    fetch("/api/shelf")
      .then((r) => r.json())
      .then((data) => {
        const allBooks: UserBook[] = data.books ?? [];
        const map = new Map<string, UserBook>();
        allBooks.forEach((b) => map.set(b.googleBookId, b));
        setUserBooks(map);
      })
      .catch(() => {});
  }

  if (loading) {
    return <DiscoverSkeleton />;
  }

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-normal tracking-tight text-text-primary">
          Discover
        </h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Personalized recommendations based on your library
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-text-secondary">
            Rate some books to get personalized recommendations!
          </p>
          <p className="mt-2 text-sm text-text-tertiary">
            <Link href="/search" className="text-green-deep hover:underline">
              Search for books
            </Link>{" "}
            to add to your library, then rate them to unlock recommendations.
          </p>
        </div>
      ) : (
        <div className="stagger-children flex flex-col gap-10">
          {rows.map((row, i) => (
            <section key={i} className="animate-fade-in-up">
              {/* Row header */}
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-xl font-medium tracking-tight text-text-primary">
                  {row.reason}
                </h2>
              </div>

              {/* Horizontal scroll of book cards */}
              <div className="scrollbar-hide -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
                {row.books.map((book) => {
                  const ub = userBooks.get(book.googleBookId);
                  return (
                    <div
                      key={book.googleBookId}
                      className="flex w-[150px] shrink-0 flex-col gap-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
                    >
                      <Link
                        href={`/book/${book.googleBookId}`}
                        className="group"
                      >
                        <BookCover
                          src={book.coverUrl}
                          title={book.title}
                          size="md"
                        />
                        <div className="mt-2 min-w-0">
                          <p className="line-clamp-2 font-display text-[13px] font-semibold leading-tight text-text-primary transition-colors group-hover:text-green-deep">
                            {book.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-text-tertiary">
                            {book.author}
                          </p>
                        </div>
                      </Link>
                      {/* Add to shelf button */}
                      <div className="mt-auto">
                        <ShelfSelector
                          googleBookId={book.googleBookId}
                          title={book.title}
                          author={book.author}
                          coverUrl={book.coverUrl}
                          currentUserBookId={ub?.id}
                          currentShelfId={ub?.shelfId}
                          currentShelfName={ub?.shelf?.name}
                          variant="button"
                          onUpdate={refreshUserBooks}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="pb-12">
      <div className="mb-8">
        <div className="h-9 w-40 animate-pulse rounded-md bg-border-light" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-border-light" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-10">
          <div className="mb-4 h-7 w-60 animate-pulse rounded-md bg-border-light" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="w-[150px] shrink-0">
                <div className="aspect-[2/3] w-full animate-pulse rounded-[var(--radius-md)] bg-border-light" />
                <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-border-light" />
                <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-border-light" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
