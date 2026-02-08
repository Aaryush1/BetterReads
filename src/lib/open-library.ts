import type { Book } from "@/types/book";

const SEARCH_URL = "https://openlibrary.org/search.json";

interface OpenLibraryDoc {
  key: string; // e.g. "/works/OL12345W"
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
  isbn?: string[];
}

interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

function buildCoverUrl(coverId?: number): string | null {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

function mapToBook(doc: OpenLibraryDoc): Book {
  return {
    googleBookId: `ol:${doc.key.replace("/works/", "")}`,
    title: doc.title ?? "Untitled",
    author: doc.author_name?.join(", ") ?? "Unknown Author",
    coverUrl: buildCoverUrl(doc.cover_i),
    description: null, // Open Library search doesn't return descriptions
    pageCount: doc.number_of_pages_median ?? null,
    publishedDate: doc.first_publish_year?.toString() ?? null,
    genre: doc.subject?.[0] ?? null,
    isbn: doc.isbn?.[0] ?? null,
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject,isbn");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error("Open Library API error:", res.status);
    return [];
  }

  const data: OpenLibrarySearchResponse = await res.json();
  return data.docs.map(mapToBook);
}
