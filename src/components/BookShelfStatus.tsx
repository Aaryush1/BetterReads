"use client";

import { useEffect, useState } from "react";
import ShelfSelector from "./ShelfSelector";
import StarRating from "./StarRating";
import type { UserBook } from "@/types/book";

interface BookShelfStatusProps {
  googleBookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  variant?: "button" | "full";
}

export default function BookShelfStatus({
  googleBookId,
  title,
  author,
  coverUrl,
  variant = "full",
}: BookShelfStatusProps) {
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetch("/api/shelf")
      .then((r) => r.json())
      .then((data) => {
        const books: UserBook[] = data.books ?? [];
        const match = books.find((b) => b.googleBookId === googleBookId);
        setUserBook(match ?? null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [googleBookId]);

  function refreshUserBook() {
    fetch("/api/shelf")
      .then((r) => r.json())
      .then((data) => {
        const books: UserBook[] = data.books ?? [];
        const match = books.find((b) => b.googleBookId === googleBookId);
        setUserBook(match ?? null);
      })
      .catch(() => {});
  }

  async function handleRatingChange(rating: number | null) {
    if (!userBook) return;
    setRatingLoading(true);

    // Optimistic update
    const prevRating = userBook.rating;
    setUserBook({ ...userBook, rating });

    try {
      const res = await fetch(`/api/shelf/${userBook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert
      setUserBook((prev) => (prev ? { ...prev, rating: prevRating } : prev));
    } finally {
      setRatingLoading(false);
    }
  }

  if (!loaded) {
    if (variant === "full") {
      return (
        <div className="flex flex-col gap-2">
          <div className="h-12 animate-pulse rounded-[var(--radius-md)] bg-border-light" />
          <div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-border-light" />
        </div>
      );
    }
    return (
      <div className="h-9 w-28 animate-pulse rounded-full bg-border-light" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ShelfSelector
        googleBookId={googleBookId}
        title={title}
        author={author}
        coverUrl={coverUrl}
        currentUserBookId={userBook?.id}
        currentShelfId={userBook?.shelfId}
        currentShelfName={userBook?.shelf?.name}
        variant={variant}
        onUpdate={refreshUserBook}
      />
      {/* Show interactive rating when book is on a shelf (full variant only) */}
      {variant === "full" && userBook && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-[13px] font-medium text-text-secondary">
            Your rating
          </span>
          <StarRating
            value={userBook.rating}
            onChange={handleRatingChange}
            size="lg"
            showLabel
          />
          {ratingLoading && (
            <span className="text-xs text-text-tertiary">Saving...</span>
          )}
        </div>
      )}
    </div>
  );
}
