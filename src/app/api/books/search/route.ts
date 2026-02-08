import { NextResponse, type NextRequest } from "next/server";
import { searchBooks as searchGoogle } from "@/lib/google-books";
import { searchBooks as searchOpenLibrary } from "@/lib/open-library";
import { mergeResults } from "@/lib/normalize-book";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ books: [], error: null });
  }

  try {
    // Fetch from both APIs in parallel, OL is primary
    const [olResults, googleResults] = await Promise.all([
      searchOpenLibrary(query),
      searchGoogle(query),
    ]);

    const books = mergeResults(olResults, googleResults);

    return NextResponse.json({ books, error: null });
  } catch (err) {
    console.error("Book search error:", err);
    return NextResponse.json(
      { books: [], error: "Failed to search books. Please try again." },
      { status: 500 }
    );
  }
}
