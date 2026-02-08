import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedBookIfNeeded } from "@/lib/embeddings";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.shelfId !== undefined) {
    updates.shelf_id = body.shelfId;
  }
  if (body.rating !== undefined) {
    updates.rating = body.rating;
  }

  const { data: book, error } = await supabase
    .from("user_books")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*, shelves(id, name, slug, is_default, position)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fire-and-forget: ensure book has an embedding when rated
  if (body.rating !== undefined) {
    embedBookIfNeeded(book.google_book_id, {
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url,
    }).catch(() => {});
  }

  return NextResponse.json({
    book: {
      id: book.id,
      googleBookId: book.google_book_id,
      shelfId: book.shelf_id,
      shelf: book.shelves
        ? {
            id: book.shelves.id,
            name: book.shelves.name,
            slug: book.shelves.slug,
            isDefault: book.shelves.is_default,
            position: book.shelves.position,
          }
        : undefined,
      rating: book.rating ? Number(book.rating) : null,
      coverUrl: book.cover_url,
      title: book.title,
      author: book.author,
      addedAt: book.added_at,
      updatedAt: book.updated_at,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("user_books")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
