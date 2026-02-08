"use client";

import { useEffect, useState } from "react";
import ShelfSelector from "./ShelfSelector";
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
    <ShelfSelector
      googleBookId={googleBookId}
      title={title}
      author={author}
      coverUrl={coverUrl}
      currentUserBookId={userBook?.id}
      currentShelfId={userBook?.shelfId}
      currentShelfName={userBook?.shelf?.name}
      variant={variant}
      onUpdate={() => {
        // Re-fetch to get updated shelf status
        fetch("/api/shelf")
          .then((r) => r.json())
          .then((data) => {
            const books: UserBook[] = data.books ?? [];
            const match = books.find((b) => b.googleBookId === googleBookId);
            setUserBook(match ?? null);
          })
          .catch(() => {});
      }}
    />
  );
}
