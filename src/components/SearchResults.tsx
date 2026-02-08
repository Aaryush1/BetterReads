"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCover from "./BookCover";
import StarRating from "./StarRating";
import ShelfSelector from "./ShelfSelector";
import type { Book, UserBook } from "@/types/book";

interface SearchResultsProps {
  books: Book[];
}

export default function SearchResults({ books }: SearchResultsProps) {
  const [userBooks, setUserBooks] = useState<Map<string, UserBook>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/shelf")
      .then((r) => r.json())
      .then((data) => {
        const allBooks: UserBook[] = data.books ?? [];
        const map = new Map<string, UserBook>();
        allBooks.forEach((b) => map.set(b.googleBookId, b));
        setUserBooks(map);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

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

  return (
    <div className="flex flex-col gap-4 pb-12">
      {books.map((book) => {
        const ub = userBooks.get(book.googleBookId);
        return (
          <div
            key={book.googleBookId}
            className="group flex gap-5 rounded-[var(--radius-lg)] border border-border-light bg-bg-card p-5 shadow-[var(--shadow-sm)] transition-all hover:border-border hover:shadow-[var(--shadow-md)]"
          >
            {/* Cover */}
            <Link href={`/book/${book.googleBookId}`} className="shrink-0">
              <BookCover src={book.coverUrl} title={book.title} size="sm" />
            </Link>

            {/* Info */}
            <Link
              href={`/book/${book.googleBookId}`}
              className="flex min-w-0 flex-1 flex-col justify-center"
            >
              <h3 className="font-display text-lg font-medium tracking-tight text-text-primary">
                {book.title}
              </h3>
              <p className="mb-2 text-sm text-text-secondary">{book.author}</p>
              {book.description && (
                <p className="line-clamp-2 text-[13px] leading-relaxed text-text-tertiary">
                  {book.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
                {ub?.rating != null && (
                  <StarRating value={ub.rating} size="sm" readOnly />
                )}
                {book.pageCount && <span>{book.pageCount} pages</span>}
                {book.publishedDate && <span>{book.publishedDate}</span>}
                {book.genre && <span>{book.genre}</span>}
              </div>
            </Link>

            {/* Shelf action */}
            <div className="hidden items-center sm:flex">
              {loaded ? (
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
              ) : (
                <div className="h-9 w-28 animate-pulse rounded-full bg-border-light" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
