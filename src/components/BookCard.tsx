import Link from "next/link";
import BookCover from "./BookCover";
import type { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.googleBookId}`}
      className="group flex flex-col gap-2"
    >
      <BookCover src={book.coverUrl} title={book.title} size="md" />
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-medium text-text-primary group-hover:text-green-deep transition-colors">
          {book.title}
        </p>
        <p className="truncate text-xs text-text-secondary">{book.author}</p>
      </div>
    </Link>
  );
}
