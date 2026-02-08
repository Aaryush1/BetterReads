import type { Book } from "@/types/book";

/**
 * Merge Google Books (primary) with Open Library (supplemental) results.
 * Open Library fills in missing covers and data for Google Books results,
 * and adds unique titles not found in Google Books.
 */
export function mergeResults(
  googleBooks: Book[],
  openLibraryBooks: Book[]
): Book[] {
  // Start with Google Books as primary
  const merged = [...googleBooks];
  const seenTitles = new Set(
    googleBooks.map((b) => normalizeTitle(b.title))
  );

  // Supplement: fill missing covers from Open Library
  for (const gb of merged) {
    if (gb.coverUrl) continue;

    const match = openLibraryBooks.find(
      (ol) =>
        normalizeTitle(ol.title) === normalizeTitle(gb.title) &&
        hasAuthorOverlap(gb.author, ol.author)
    );
    if (match?.coverUrl) {
      gb.coverUrl = match.coverUrl;
    }
  }

  // Add unique Open Library results not already in Google Books
  for (const ol of openLibraryBooks) {
    const normalized = normalizeTitle(ol.title);
    if (!seenTitles.has(normalized)) {
      seenTitles.add(normalized);
      merged.push(ol);
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
