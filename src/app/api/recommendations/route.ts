import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/types/book";

interface RecommendationRow {
  reason: string;
  sourceBook: { title: string; author: string | null } | null;
  books: Book[];
}

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

async function searchGoogleBooks(query: string, maxResults = 6): Promise<Book[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) return [];

  const url = new URL(BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("orderBy", "relevance");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any): Book => ({
        googleBookId: v.id,
        title: v.volumeInfo?.title ?? "Untitled",
        author: v.volumeInfo?.authors?.join(", ") ?? "Unknown Author",
        coverUrl: v.volumeInfo?.imageLinks?.thumbnail?.replace(/^http:/, "https:") ?? null,
        description: v.volumeInfo?.description ?? null,
        pageCount: v.volumeInfo?.pageCount ?? null,
        publishedDate: v.volumeInfo?.publishedDate ?? null,
        genre: v.volumeInfo?.categories?.[0] ?? null,
        isbn: null,
      })
    );
  } catch {
    return [];
  }
}

/** Curated fallback queries for users with no rated books */
const FALLBACK_QUERIES = [
  { query: "bestseller fiction 2024", reason: "Popular Fiction" },
  { query: "classic literature must read", reason: "Classic Literature" },
  { query: "best science fiction fantasy", reason: "Sci-Fi & Fantasy" },
  { query: "best mystery thriller", reason: "Mystery & Thriller" },
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's books with ratings
  const { data: userBooks } = await supabase
    .from("user_books")
    .select("google_book_id, title, author, rating, shelves(name)")
    .eq("user_id", user.id)
    .order("rating", { ascending: false });

  const allUserBooks = userBooks ?? [];
  const userBookIds = new Set(allUserBooks.map((b) => b.google_book_id));

  // Get highly-rated books (rating >= 4)
  const topRated = allUserBooks.filter(
    (b) => b.rating != null && Number(b.rating) >= 4
  );

  const rows: RecommendationRow[] = [];

  if (topRated.length > 0) {
    // "Because you liked X" — search for similar books by author or title keywords
    const seen = new Set<string>();
    // Limit to 3 source books to avoid too many API calls
    const sources = topRated.slice(0, 3);

    const results = await Promise.all(
      sources.map(async (book) => {
        const authorQuery = book.author
          ? `inauthor:${book.author}`
          : book.title;
        const books = await searchGoogleBooks(authorQuery, 8);
        return { book, books };
      })
    );

    for (const { book, books } of results) {
      const filtered = books.filter(
        (b) => !userBookIds.has(b.googleBookId) && !seen.has(b.googleBookId)
      );
      filtered.forEach((b) => seen.add(b.googleBookId));

      if (filtered.length > 0) {
        rows.push({
          reason: `Because you liked "${book.title}"`,
          sourceBook: { title: book.title, author: book.author },
          books: filtered.slice(0, 6),
        });
      }
    }

    // Genre-based recommendations from user's shelf
    const genres = allUserBooks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((b: any) => b.shelves?.name)
      .filter(Boolean);
    const uniqueGenres = [...new Set(genres)];

    if (uniqueGenres.length > 0 && rows.length < 4) {
      // Search for popular books in the user's shelf categories
      const genreBooks = await searchGoogleBooks(
        `best books ${uniqueGenres[0]}`,
        8
      );
      const filtered = genreBooks.filter(
        (b) => !userBookIds.has(b.googleBookId) && !seen.has(b.googleBookId)
      );
      if (filtered.length > 0) {
        rows.push({
          reason: "Recommended for you",
          sourceBook: null,
          books: filtered.slice(0, 6),
        });
      }
    }
  }

  // If we have no rows (no rated books or searches returned nothing), use fallback
  if (rows.length === 0) {
    const seen = new Set<string>();
    const results = await Promise.all(
      FALLBACK_QUERIES.map(async ({ query, reason }) => {
        const books = await searchGoogleBooks(query, 8);
        return { reason, books };
      })
    );

    for (const { reason, books } of results) {
      const filtered = books.filter(
        (b) => !userBookIds.has(b.googleBookId) && !seen.has(b.googleBookId)
      );
      filtered.forEach((b) => seen.add(b.googleBookId));

      if (filtered.length > 0) {
        rows.push({
          reason,
          sourceBook: null,
          books: filtered.slice(0, 6),
        });
      }
    }
  }

  return NextResponse.json({ rows });
}
