import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { buildBookText, generateEmbeddings } from "@/lib/embeddings";
import { computeTasteVector } from "@/lib/taste-vector";
import {
  clusterByAnchor,
  generateReason,
} from "@/lib/recommendation-clusters";
import type { Candidate, AnchorBook } from "@/lib/recommendation-clusters";
import type { Book } from "@/types/book";

interface RecommendationRow {
  reason: string;
  sourceBook: { title: string; author: string | null } | null;
  books: Book[];
}

/** Parse pgvector string representation to number[] */
function parseEmbedding(raw: unknown): number[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return JSON.parse(raw);
  throw new Error("Invalid embedding format");
}

/** Map a match_books candidate row to a Book */
function candidateToBook(c: Candidate): Book {
  return {
    googleBookId: c.book_id,
    title: c.title,
    author: c.author ?? "Unknown Author",
    coverUrl: c.cover_url ?? null,
    description: c.description ?? null,
    pageCount: null,
    publishedDate: null,
    genre: c.genre ?? null,
    isbn: null,
  };
}

/* ── Fallback: keyword-based via Open Library ── */

import { searchBooks as searchOpenLibrary } from "@/lib/open-library";

const FALLBACK_QUERIES = [
  { query: "popular fiction bestseller", reason: "Popular Fiction" },
  { query: "classic literature novels", reason: "Classic Literature" },
  { query: "science fiction fantasy", reason: "Sci-Fi & Fantasy" },
  { query: "mystery thriller suspense", reason: "Mystery & Thriller" },
];

async function fallbackRecommendations(
  excludeIds: Set<string>
): Promise<NextResponse> {
  const rows: RecommendationRow[] = [];
  const seen = new Set<string>();

  const results = await Promise.all(
    FALLBACK_QUERIES.map(async ({ query, reason }) => {
      const books = await searchOpenLibrary(query);
      return { reason, books };
    })
  );

  for (const { reason, books } of results) {
    const filtered = books.filter(
      (b) => !excludeIds.has(b.googleBookId) && !seen.has(b.googleBookId)
    );
    filtered.forEach((b) => seen.add(b.googleBookId));

    if (filtered.length > 0) {
      rows.push({
        reason,
        sourceBook: null,
        books: filtered.slice(0, 6),
      });
    }
  }

  return NextResponse.json({ rows });
}

/* ── Main handler: embedding-based recommendations ── */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all user books (for exclusion + rated subset)
  const { data: allUserBooks } = await supabase
    .from("user_books")
    .select("google_book_id, title, author, rating, cover_url")
    .eq("user_id", user.id);

  const userBookIds = new Set(
    (allUserBooks ?? []).map((b) => b.google_book_id)
  );
  const ratedBooks = (allUserBooks ?? []).filter((b) => b.rating != null);

  // No rated books → fallback to curated keyword search
  if (ratedBooks.length === 0) {
    return fallbackRecommendations(userBookIds);
  }

  try {
    // 1. Fetch existing embeddings for the user's rated books
    const ratedIds = ratedBooks.map((b) => b.google_book_id);
    const { data: embRows } = await supabase
      .from("book_embeddings")
      .select("book_id, embedding")
      .in("book_id", ratedIds);

    const embeddingsMap = new Map<string, number[]>();
    for (const row of embRows ?? []) {
      embeddingsMap.set(row.book_id, parseEmbedding(row.embedding));
    }

    // 2. Generate embeddings on-the-fly for rated books that don't have them
    const missingBooks = ratedBooks.filter(
      (b) => !embeddingsMap.has(b.google_book_id)
    );

    if (missingBooks.length > 0) {
      try {
        const texts = missingBooks.map((b) =>
          buildBookText({ title: b.title, author: b.author })
        );
        const newEmbeddings = await generateEmbeddings(texts);

        for (let i = 0; i < missingBooks.length; i++) {
          embeddingsMap.set(missingBooks[i].google_book_id, newEmbeddings[i]);
        }

        // Fire-and-forget: store new embeddings for future requests
        const rows = missingBooks.map((b, i) => ({
          book_id: b.google_book_id,
          embedding: newEmbeddings[i],
          title: b.title,
          author: b.author ?? null,
          genre: null,
          description: null,
          cover_url: b.cover_url ?? null,
        }));
        Promise.resolve(adminClient.from("book_embeddings").upsert(rows)).catch(
          () => {}
        );
      } catch {
        // If on-the-fly generation fails, continue with whatever we have
      }
    }

    // If we still have no embeddings at all, fall back
    if (embeddingsMap.size === 0) {
      return fallbackRecommendations(userBookIds);
    }

    // 3. Compute taste vector (positive + negative signals)
    const ratedWithRating = ratedBooks.map((b) => ({
      googleBookId: b.google_book_id,
      rating: Number(b.rating),
    }));

    const tasteVector = computeTasteVector(ratedWithRating, embeddingsMap);
    if (!tasteVector) {
      return fallbackRecommendations(userBookIds);
    }

    // 4. Nearest-neighbor search via match_books RPC
    const { data: candidates, error: rpcError } = await supabase.rpc(
      "match_books",
      {
        query_embedding: tasteVector,
        exclude_ids: Array.from(userBookIds),
        match_count: 40,
      }
    );

    if (rpcError || !candidates || candidates.length < 6) {
      return fallbackRecommendations(userBookIds);
    }

    // 5. Fetch candidate embeddings for anchor matching
    const candidateIds = (candidates as Candidate[]).map(
      (c) => c.book_id
    );
    const { data: candEmbRows } = await supabase
      .from("book_embeddings")
      .select("book_id, embedding")
      .in("book_id", candidateIds);

    const candidateEmbeddings = new Map<string, number[]>();
    for (const row of candEmbRows ?? []) {
      candidateEmbeddings.set(
        row.book_id,
        parseEmbedding(row.embedding)
      );
    }

    // 6. Build anchor list from positively-rated books (rating >= 3)
    const anchors: AnchorBook[] = ratedBooks
      .filter(
        (b) =>
          Number(b.rating) >= 3 && embeddingsMap.has(b.google_book_id)
      )
      .map((b) => ({
        googleBookId: b.google_book_id,
        title: b.title,
        author: b.author,
        embedding: embeddingsMap.get(b.google_book_id)!,
        rating: Number(b.rating),
      }));

    if (anchors.length === 0) {
      return fallbackRecommendations(userBookIds);
    }

    // 7. Cluster candidates by anchor + generate reasons
    const clusters = clusterByAnchor(
      candidates as Candidate[],
      anchors,
      candidateEmbeddings
    );

    const rows: RecommendationRow[] = clusters
      .filter((c) => c.candidates.length > 0)
      .map((cluster) => ({
        reason: generateReason(cluster),
        sourceBook: {
          title: cluster.anchor.title,
          author: cluster.anchor.author,
        },
        books: cluster.candidates.slice(0, 6).map(candidateToBook),
      }));

    if (rows.length === 0) {
      return fallbackRecommendations(userBookIds);
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Recommendation engine error:", error);
    return fallbackRecommendations(userBookIds);
  }
}
