import type { Book } from "@/types/book";

/**
 * Merge Open Library (primary) with Google Books (supplemental) results.
 * Google Books fills in missing data for OL results,
 * and adds unique titles not found in Open Library.
 */
export function mergeResults(
  openLibraryBooks: Book[],
  googleBooks: Book[]
): Book[] {
  // Start with Open Library as primary
  const merged = [...openLibraryBooks];
  const seenTitles = new Set(
    openLibraryBooks.map((b) => normalizeTitle(b.title))
  );

  // Supplement: fill missing covers from Google Books
  for (const ol of merged) {
    if (ol.coverUrl) continue;

    const match = googleBooks.find(
      (gb) =>
        normalizeTitle(gb.title) === normalizeTitle(ol.title) &&
        hasAuthorOverlap(ol.author, gb.author)
    );
    if (match?.coverUrl) {
      ol.coverUrl = match.coverUrl;
    }
  }

  // Add unique Google Books results not already in Open Library
  for (const gb of googleBooks) {
    const normalized = normalizeTitle(gb.title);
    if (!seenTitles.has(normalized)) {
      seenTitles.add(normalized);
      merged.push(gb);
    }
  }

  return merged;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAuthorOverlap(a: string, b: string): boolean {
  const wordsA = a.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const wordsB = b.toLowerCase().split(/[\s,]+/).filter(Boolean);
  return wordsA.some((word) => wordsB.includes(word) && word.length > 2);
}
