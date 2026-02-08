import { NextResponse } from "next/server";
import { getBook } from "@/lib/google-books";

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
    const book = await getBook(id);

    if (!book) {
      return NextResponse.json(
        { book: null, error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ book, error: null });
  } catch (err) {
    console.error("Book detail error:", err);
    return NextResponse.json(
      { book: null, error: "Failed to fetch book details." },
      { status: 500 }
    );
  }
}
