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

/**
 * Fetch a single book by Open Library work ID (e.g. "OL12345W").
 * Fetches the work endpoint for description, then search for additional metadata.
 */
export async function getBook(workId: string): Promise<Book | null> {
  try {
    // Fetch work details (has description)
    const workRes = await fetch(
      `https://openlibrary.org/works/${encodeURIComponent(workId)}.json`,
      { next: { revalidate: 3600 } }
    );
    if (!workRes.ok) return null;

    const work = await workRes.json();

    // Extract description (can be string or { type, value } object)
    let description: string | null = null;
    if (typeof work.description === "string") {
      description = work.description;
    } else if (work.description?.value) {
      description = work.description.value;
    }

    // Get title from work
    const title = work.title ?? "Untitled";

    // Fetch search data for author, cover, page count, etc.
    const searchRes = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject,isbn&limit=5`,
      { next: { revalidate: 3600 } }
    );

    let author = "Unknown Author";
    let coverUrl: string | null = null;
    let pageCount: number | null = null;
    let publishedDate: string | null = null;
    let genre: string | null = null;
    let isbn: string | null = null;

    if (searchRes.ok) {
      const searchData: OpenLibrarySearchResponse = await searchRes.json();
      // Find the matching work in search results
      const match = searchData.docs.find(
        (d) => d.key === `/works/${workId}`
      ) ?? searchData.docs[0];

      if (match) {
        author = match.author_name?.join(", ") ?? "Unknown Author";
        coverUrl = buildCoverUrl(match.cover_i);
        pageCount = match.number_of_pages_median ?? null;
        publishedDate = match.first_publish_year?.toString() ?? null;
        genre = match.subject?.[0] ?? null;
        isbn = match.isbn?.[0] ?? null;
      }
    }

    // Use cover from work if search didn't find one
    if (!coverUrl && work.covers?.[0]) {
      coverUrl = buildCoverUrl(work.covers[0]);
    }

    return {
      googleBookId: `ol:${workId}`,
      title,
      author,
      coverUrl,
      description,
      pageCount,
      publishedDate,
      genre,
      isbn,
    };
  } catch (err) {
    console.error("Open Library getBook error:", err);
    return null;
  }
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
