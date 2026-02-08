import OpenAI from "openai";
import { adminClient } from "@/lib/supabase/admin";
import { getBook as getGoogleBook } from "@/lib/google-books";
import { getBook as getOpenLibraryBook } from "@/lib/open-library";

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
 * Generates embeddings for multiple texts in a single API call.
 * Returns an array of embeddings in the same order as the input texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
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
    .select("book_id")
    .eq("book_id", googleBookId)
    .single();

  if (existing) return;

  const text = buildBookText(book);
  const embedding = await generateEmbedding(text);

  const { error } = await adminClient.from("book_embeddings").upsert({
    book_id: googleBookId,
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
    .select("book_id")
    .in("book_id", ids);

  const existingIds = new Set(existingRows?.map((r) => r.book_id) ?? []);
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
        book_id: chunk[idx].googleBookId,
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

/**
 * Embeds a book if it doesn't already have an embedding.
 * For OL IDs, fetches from Open Library. For Google IDs, fetches from Google Books.
 * Designed to be called fire-and-forget from shelf/rating handlers.
 */
export async function embedBookIfNeeded(
  bookId: string,
  fallback: { title: string; author?: string | null; coverUrl?: string | null }
): Promise<void> {
  // Check if already embedded
  const { data: existing } = await adminClient
    .from("book_embeddings")
    .select("book_id")
    .eq("book_id", bookId)
    .single();

  if (existing) return;

  // Fetch full details for richer embedding (description + genre)
  let meta: BookMetadata = {
    title: fallback.title,
    author: fallback.author,
    coverUrl: fallback.coverUrl,
  };

  try {
    const fullBook = bookId.startsWith("ol:")
      ? await getOpenLibraryBook(bookId.slice(3))
      : await getGoogleBook(bookId);

    if (fullBook) {
      meta = {
        title: fullBook.title,
        author: fullBook.author,
        genre: fullBook.genre,
        description: fullBook.description,
        coverUrl: fullBook.coverUrl,
      };
    }
  } catch {
    // Use fallback metadata if fetch fails
  }

  await embedBook(bookId, meta);
}
