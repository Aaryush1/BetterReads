import OpenAI from "openai";
import { adminClient } from "@/lib/supabase/admin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface BookMetadata {
  title: string;
  author?: string | null;
  genre?: string | null;
  description?: string | null;
  coverUrl?: string | null;
}

/**
 * Concatenates book metadata into a single string for embedding.
 * Handles missing fields gracefully.
 */
export function buildBookText(book: BookMetadata): string {
  const parts: string[] = [];

  parts.push(`Title: ${book.title}`);
  if (book.author) parts.push(`Author: ${book.author}`);
  if (book.genre) parts.push(`Genre: ${book.genre}`);
  if (book.description) {
    // Truncate long descriptions to keep embedding input reasonable
    const desc = book.description.slice(0, 2000);
    parts.push(desc);
  }

  return parts.join("\n");
}

/**
 * Generates a 1536-dimensional embedding via OpenAI text-embedding-3-small.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Embeds a single book: checks if already embedded, generates embedding, upserts.
 * Skips if the book is already in book_embeddings.
 */
export async function embedBook(
  googleBookId: string,
  book: BookMetadata
): Promise<void> {
  // Check if already embedded
  const { data: existing } = await adminClient
    .from("book_embeddings")
    .select("google_book_id")
    .eq("google_book_id", googleBookId)
    .single();

  if (existing) return;

  const text = buildBookText(book);
  const embedding = await generateEmbedding(text);

  const { error } = await adminClient.from("book_embeddings").upsert({
    google_book_id: googleBookId,
    embedding,
    title: book.title,
    author: book.author || null,
    genre: book.genre || null,
    description: book.description?.slice(0, 2000) || null,
    cover_url: book.coverUrl || null,
  });

  if (error) {
    console.error(`Failed to store embedding for ${googleBookId}:`, error);
    throw error;
  }
}

/**
 * Batch embeds multiple books. Processes in chunks to respect API limits.
 * Skips books that are already embedded.
 */
export async function embedBooks(
  books: Array<{ googleBookId: string } & BookMetadata>
): Promise<{ embedded: number; skipped: number; failed: number }> {
  const CHUNK_SIZE = 100;
  let embedded = 0;
  let skipped = 0;
  let failed = 0;

  // Check which books are already embedded
  const ids = books.map((b) => b.googleBookId);
  const { data: existingRows } = await adminClient
    .from("book_embeddings")
    .select("google_book_id")
    .in("google_book_id", ids);

  const existingIds = new Set(existingRows?.map((r) => r.google_book_id) ?? []);
  const toEmbed = books.filter((b) => !existingIds.has(b.googleBookId));
  skipped = books.length - toEmbed.length;

  // Process in chunks
  for (let i = 0; i < toEmbed.length; i += CHUNK_SIZE) {
    const chunk = toEmbed.slice(i, i + CHUNK_SIZE);

    // Generate embeddings for the chunk via batch API
    const texts = chunk.map((b) => buildBookText(b));

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });

      // Upsert all embeddings from this chunk
      const rows = response.data.map((item, idx) => ({
        google_book_id: chunk[idx].googleBookId,
        embedding: item.embedding,
        title: chunk[idx].title,
        author: chunk[idx].author || null,
        genre: chunk[idx].genre || null,
        description: chunk[idx].description?.slice(0, 2000) || null,
        cover_url: chunk[idx].coverUrl || null,
      }));

      const { error } = await adminClient
        .from("book_embeddings")
        .upsert(rows);

      if (error) {
        console.error(`Batch upsert failed for chunk ${i}:`, error);
        failed += chunk.length;
      } else {
        embedded += chunk.length;
      }
    } catch (err) {
      console.error(`Embedding generation failed for chunk ${i}:`, err);
      failed += chunk.length;
    }
  }

  return { embedded, skipped, failed };
}
