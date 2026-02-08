import type { Book } from "@/types/book";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    publishedDate?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

interface GoogleBooksSearchResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

function extractIsbn(
  identifiers?: GoogleBooksVolume["volumeInfo"]["industryIdentifiers"]
): string | null {
  if (!identifiers) return null;
  const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
  if (isbn13) return isbn13.identifier;
  const isbn10 = identifiers.find((id) => id.type === "ISBN_10");
  return isbn10?.identifier ?? null;
}

function normalizeCoverUrl(url?: string): string | null {
  if (!url) return null;
  // Google Books sometimes returns http — force https
  return url.replace(/^http:/, "https:");
}

function mapToBook(volume: GoogleBooksVolume): Book {
  const info = volume.volumeInfo;
  return {
    googleBookId: volume.id,
    title: info.title ?? "Untitled",
    author: info.authors?.join(", ") ?? "Unknown Author",
    coverUrl: normalizeCoverUrl(info.imageLinks?.thumbnail),
    description: info.description ?? null,
    pageCount: info.pageCount ?? null,
    publishedDate: info.publishedDate ?? null,
    genre: info.categories?.[0] ?? null,
    isbn: extractIsbn(info.industryIdentifiers),
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_BOOKS_API_KEY not set, skipping Google Books search");
    return [];
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("maxResults", "20");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error("Google Books API error:", res.status, await res.text());
    return [];
  }

  const data: GoogleBooksSearchResponse = await res.json();
  if (!data.items) return [];

  return data.items.map(mapToBook);
}

export async function getBook(volumeId: string): Promise<Book | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_BOOKS_API_KEY not set, skipping Google Books fetch");
    return null;
  }

  const url = `${BASE_URL}/${encodeURIComponent(volumeId)}?key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error("Google Books API error:", res.status);
    return null;
  }

  const volume: GoogleBooksVolume = await res.json();
  return mapToBook(volume);
}
