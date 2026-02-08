import { NextResponse, type NextRequest } from "next/server";

const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

/**
 * Lightweight suggest endpoint — only Google Books, maxResults=5.
 * Used for the search-as-you-type dropdown. Intentionally minimal
 * to stay within the free API tier (1,000 req/day).
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("maxResults", "5");
  url.searchParams.set("fields", "items(id,volumeInfo/title,volumeInfo/authors,volumeInfo/imageLinks/smallThumbnail)");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suggestions = (data.items ?? []).map((v: any) => ({
      googleBookId: v.id,
      title: v.volumeInfo?.title ?? "Untitled",
      author: v.volumeInfo?.authors?.join(", ") ?? "Unknown Author",
      coverUrl: v.volumeInfo?.imageLinks?.smallThumbnail?.replace(/^http:/, "https:") ?? null,
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
