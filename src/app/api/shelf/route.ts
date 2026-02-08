import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedBookIfNeeded } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shelfId = request.nextUrl.searchParams.get("shelfId");

  let query = supabase
    .from("user_books")
    .select("*, shelves(id, name, slug, is_default, position)")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (shelfId) {
    query = query.eq("shelf_id", shelfId);
  }

  const { data: books, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    books: (books ?? []).map(mapUserBook),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { googleBookId, shelfId, title, author, coverUrl } = body;

  if (!googleBookId || !shelfId || !title) {
    return NextResponse.json(
      { error: "googleBookId, shelfId, and title are required" },
      { status: 400 }
    );
  }

  const { data: book, error } = await supabase
    .from("user_books")
    .insert({
      user_id: user.id,
      shelf_id: shelfId,
      google_book_id: googleBookId,
      title,
      author: author || null,
      cover_url: coverUrl || null,
    })
    .select("*, shelves(id, name, slug, is_default, position)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This book is already on one of your shelves" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire-and-forget: embed the book for future recommendations
  embedBookIfNeeded(googleBookId, { title, author, coverUrl }).catch(() => {});

  return NextResponse.json({ book: mapUserBook(book) }, { status: 201 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserBook(row: any) {
  return {
    id: row.id,
    googleBookId: row.google_book_id,
    shelfId: row.shelf_id,
    shelf: row.shelves
      ? {
          id: row.shelves.id,
          name: row.shelves.name,
          slug: row.shelves.slug,
          isDefault: row.shelves.is_default,
          position: row.shelves.position,
        }
      : undefined,
    rating: row.rating ? Number(row.rating) : null,
    coverUrl: row.cover_url,
    title: row.title,
    author: row.author,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
  };
}
