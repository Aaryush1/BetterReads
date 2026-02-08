import type { Metadata } from "next";
import type { Book } from "@/types/book";
import SearchResults from "@/components/SearchResults";

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
      {books.length > 0 && <SearchResults books={books} />}
    </div>
  );
}
