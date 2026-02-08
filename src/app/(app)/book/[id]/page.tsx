import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook } from "@/lib/google-books";
import BookCover from "@/components/BookCover";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);
  return {
    title: book ? `${book.title} — BetterReads` : "Book — BetterReads",
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10 pb-12 md:flex-row md:gap-12">
      {/* Left: Cover + shelf actions */}
      <div className="shrink-0 md:w-[240px]">
        <BookCover src={book.coverUrl} title={book.title} size="lg" className="mx-auto md:mx-0" />

        {/* Shelf action buttons (non-functional, wired in Phase 4) */}
        <div className="mt-5 flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-green-deep px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-medium">
            + Want to Read
          </button>
          <button className="rounded-[var(--radius-md)] border-[1.5px] border-border bg-bg-card px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-text-secondary">
            Change shelf &darr;
          </button>
        </div>
      </div>

      {/* Right: Book info */}
      <div className="flex-1">
        <h1 className="font-display text-4xl font-normal tracking-tight leading-tight text-text-primary">
          {book.title}
        </h1>
        <p className="mt-2 text-[17px] text-text-secondary">
          by <span className="font-medium text-green-deep">{book.author}</span>
        </p>

        {/* Star rating placeholder (non-functional, wired in Phase 5) */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm font-medium text-text-secondary">
            Your rating
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="cursor-pointer text-[22px] text-border transition-colors hover:text-amber"
              >
                &#9733;
              </span>
            ))}
          </div>
        </div>

        {/* Metadata bar */}
        <div className="mt-6 flex flex-wrap gap-6 border-b border-border-light pb-7">
          {book.pageCount && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Pages
              </span>
              <span className="text-[15px] font-semibold text-text-primary">
                {book.pageCount}
              </span>
            </div>
          )}
          {book.publishedDate && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Published
              </span>
              <span className="text-[15px] font-semibold text-text-primary">
                {book.publishedDate}
              </span>
            </div>
          )}
          {book.genre && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Genre
              </span>
              <span className="text-[15px] font-semibold text-text-primary">
                {book.genre}
              </span>
            </div>
          )}
          {book.isbn && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                ISBN
              </span>
              <span className="text-[15px] font-semibold text-text-primary">
                {book.isbn}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {book.description && (
          <div className="mt-7">
            <h3 className="mb-3 font-display text-lg font-medium text-text-primary">
              About this book
            </h3>
            <div
              className="text-[15px] leading-relaxed text-text-secondary [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: book.description }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
