import { NextResponse } from "next/server";
import { getBook as getGoogleBook } from "@/lib/google-books";
import { getBook as getOpenLibraryBook } from "@/lib/open-library";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { book: null, error: "Book ID is required" },
      { status: 400 }
    );
  }

  try {
    // Open Library IDs start with "ol:"
    if (id.startsWith("ol:")) {
      const olId = id.slice(3);
      const book = await getOpenLibraryBook(olId);
      if (!book) {
        return NextResponse.json(
          { book: null, error: "Book not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ book, error: null });
    }

    // Try Google Books first, fall back to Open Library search
    const book = await getGoogleBook(id);
    if (book) {
      return NextResponse.json({ book, error: null });
    }

    return NextResponse.json(
      { book: null, error: "Book not found" },
      { status: 404 }
    );
  } catch (err) {
    console.error("Book detail error:", err);
    return NextResponse.json(
      { book: null, error: "Failed to fetch book details." },
      { status: 500 }
    );
  }
}
