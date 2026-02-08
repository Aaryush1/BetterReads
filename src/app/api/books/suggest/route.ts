import { NextResponse, type NextRequest } from "next/server";

const SEARCH_URL = "https://openlibrary.org/search.json";

/**
 * Lightweight suggest endpoint using Open Library.
 * Used for the search-as-you-type dropdown.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "5");
    url.searchParams.set(
      "fields",
      "key,title,author_name,cover_i"
    );

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suggestions = (data.docs ?? []).map((doc: any) => ({
      googleBookId: `ol:${(doc.key as string).replace("/works/", "")}`,
      title: doc.title ?? "Untitled",
      author: doc.author_name?.join(", ") ?? "Unknown Author",
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`
        : null,
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
