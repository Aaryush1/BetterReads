import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Shelf name is required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: shelf, error } = await supabase
    .from("shelves")
    .update({ name, slug })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A shelf with that name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    shelf: {
      id: shelf.id,
      name: shelf.name,
      slug: shelf.slug,
      isDefault: shelf.is_default,
      position: shelf.position,
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

  // Check if shelf is default
  const { data: shelf } = await supabase
    .from("shelves")
    .select("is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!shelf) {
    return NextResponse.json({ error: "Shelf not found" }, { status: 404 });
  }

  if (shelf.is_default) {
    return NextResponse.json(
      { error: "Default shelves cannot be deleted" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("shelves")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
