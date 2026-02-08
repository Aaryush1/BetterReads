import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user has shelves; if not, create defaults
  const { data: shelves, error } = await supabase
    .from("shelves")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (shelves.length === 0) {
    // First time — create default shelves
    const { error: fnError } = await supabase.rpc("create_default_shelves", {
      p_user_id: user.id,
    });

    if (fnError) {
      return NextResponse.json({ error: fnError.message }, { status: 500 });
    }

    // Re-fetch after creation
    const { data: newShelves, error: refetchError } = await supabase
      .from("shelves")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (refetchError) {
      return NextResponse.json({ error: refetchError.message }, { status: 500 });
    }

    return NextResponse.json({
      shelves: (newShelves ?? []).map(mapShelf),
    });
  }

  return NextResponse.json({
    shelves: shelves.map(mapShelf),
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
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Shelf name is required" }, { status: 400 });
  }

  const slug = slugify(name);

  // Get next position
  const { data: existing } = await supabase
    .from("shelves")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data: shelf, error } = await supabase
    .from("shelves")
    .insert({
      user_id: user.id,
      name,
      slug,
      is_default: false,
      position: nextPosition,
    })
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

  return NextResponse.json({ shelf: mapShelf(shelf) }, { status: 201 });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapShelf(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isDefault: row.is_default,
    position: row.position,
  };
}
