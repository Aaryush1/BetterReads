import type { Metadata } from "next";
import type { Book } from "@/types/book";
import BookCover from "@/components/BookCover";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search — BetterReads",
};

async function fetchBooks(query: string): Promise<{ books: Book[]; error: string | null }> {
  const { searchBooks: searchGoogle } = await import("@/lib/google-books");
  const { searchBooks: searchOpenLibrary } = await import("@/lib/open-library");
  const { mergeResults } = await import("@/lib/normalize-book");

  try {
    const [googleResults, olResults] = await Promise.all([
      searchGoogle(query),
      searchOpenLibrary(query),
    ]);
    return { books: mergeResults(googleResults, olResults), error: null };
  } catch {
    return { books: [], error: "Failed to search books." };
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const { books, error } = query
    ? await fetchBooks(query)
    : { books: [], error: null };

  return (
    <div>
      {/* Search header */}
      <div className="mb-7">
        {query ? (
          <>
            <h2 className="font-display text-2xl font-normal tracking-tight text-text-primary">
              Results for <span className="italic text-text-tertiary">&ldquo;{query}&rdquo;</span>
            </h2>
            <p className="mt-1 text-sm text-text-tertiary">
              {books.length} book{books.length !== 1 ? "s" : ""} found
            </p>
          </>
        ) : (
          <h2 className="font-display text-2xl font-normal tracking-tight text-text-primary">
            Search for books
          </h2>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {query && !error && books.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-text-secondary">No books found</p>
          <p className="mt-1 text-sm text-text-tertiary">
            Try a different search term
          </p>
        </div>
      )}

      {/* Results list */}
      {books.length > 0 && (
        <div className="flex flex-col gap-4 pb-12">
          {books.map((book) => (
            <Link
              key={book.googleBookId}
              href={`/book/${book.googleBookId}`}
              className="group flex gap-5 rounded-[var(--radius-lg)] border border-border-light bg-bg-card p-5 shadow-[var(--shadow-sm)] transition-all hover:translate-x-1 hover:border-border hover:shadow-[var(--shadow-md)]"
            >
              {/* Cover */}
              <div className="shrink-0">
                <BookCover src={book.coverUrl} title={book.title} size="sm" />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3 className="font-display text-lg font-medium tracking-tight text-text-primary">
                  {book.title}
                </h3>
                <p className="mb-2 text-sm text-text-secondary">
                  {book.author}
                </p>
                {book.description && (
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-text-tertiary">
                    {book.description}
                  </p>
                )}
                <div className="mt-2 flex gap-3 text-xs text-text-tertiary">
                  {book.pageCount && <span>{book.pageCount} pages</span>}
                  {book.publishedDate && <span>{book.publishedDate}</span>}
                  {book.genre && <span>{book.genre}</span>}
                </div>
              </div>

              {/* Action button (non-functional, wired in Phase 4) */}
              <div className="hidden items-center sm:flex">
                <span className="whitespace-nowrap rounded-full border-[1.5px] border-green-deep/12 bg-green-light px-[18px] py-2 text-[13px] font-semibold text-green-deep transition-colors group-hover:border-green-deep group-hover:bg-green-deep group-hover:text-white">
                  + Add to shelf
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
