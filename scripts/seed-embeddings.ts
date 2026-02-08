/**
 * Seed Script — Populate book_embeddings with ~10,000 popular books
 * Uses Open Library Search API (free, no API key required)
 *
 * Usage: npx tsx scripts/seed-embeddings.ts
 *
 * Features:
 * - Curated queries across genres, awards, authors, eras
 * - Deduplication by Open Library work key
 * - Rate-limited (100ms between requests — polite for OL)
 * - Batch OpenAI embedding generation (chunks of 100)
 * - Checkpoint file for resume capability
 * - Idempotent: skips already-embedded books
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

// Load env vars from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// ─── Clients ────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Constants ──────────────────────────────────────────────
const OL_SEARCH_URL = "https://openlibrary.org/search.json";
const CHECKPOINT_FILE = resolve(process.cwd(), "scripts/.seed-checkpoint.json");
const EMBEDDING_CHUNK_SIZE = 100;
const OL_DELAY_MS = 100; // polite rate for Open Library

// ─── Types ──────────────────────────────────────────────────
interface BookRecord {
  googleBookId: string; // stored as "ol:OL12345W" for Open Library books
  title: string;
  author: string | null;
  genre: string | null;
  description: string | null; // built from subjects
  coverUrl: string | null;
}

interface Checkpoint {
  completedQueries: string[];
  totalBooksCollected: number;
  totalBooksEmbedded: number;
}

// ─── Curated Query List (~250 queries) ──────────────────────
const SEED_QUERIES: string[] = [
  // Fiction genres (40 queries)
  "subject:fiction",
  "subject:literary fiction",
  "subject:science fiction",
  "subject:fantasy",
  "subject:mystery",
  "subject:thriller",
  "subject:romance",
  "subject:horror",
  "subject:historical fiction",
  "subject:contemporary fiction",
  "subject:dystopian fiction",
  "subject:adventure",
  "subject:gothic fiction",
  "subject:magical realism",
  "subject:satire",
  "subject:short stories",
  "subject:young adult fiction",
  "subject:crime fiction",
  "subject:suspense",
  "subject:war fiction",
  "subject:domestic fiction",
  "subject:psychological fiction",
  "subject:political fiction",
  "subject:urban fantasy",
  "subject:epic fantasy",
  "subject:space opera",
  "subject:cyberpunk",
  "subject:steampunk",
  "subject:paranormal",
  "subject:cozy mystery",
  "subject:noir",
  "subject:espionage",
  "subject:coming of age",
  "subject:family saga",
  "subject:western",
  "subject:absurdist fiction",
  "subject:speculative fiction",
  "subject:women fiction",
  "subject:action and adventure",
  "subject:graphic novels",

  // Non-fiction (30 queries)
  "subject:biography",
  "subject:autobiography",
  "subject:memoir",
  "subject:history",
  "subject:science",
  "subject:psychology",
  "subject:philosophy",
  "subject:business",
  "subject:self-help",
  "subject:true crime",
  "subject:travel",
  "subject:nature",
  "subject:politics",
  "subject:economics",
  "subject:sociology",
  "subject:technology",
  "subject:mathematics",
  "subject:art",
  "subject:music",
  "subject:cooking",
  "subject:health",
  "subject:religion",
  "subject:spirituality",
  "subject:education",
  "subject:journalism",
  "subject:essays",
  "subject:cultural studies",
  "subject:anthropology",
  "subject:neuroscience",
  "subject:environment",

  // Award winners (30 queries)
  "pulitzer prize fiction",
  "pulitzer prize nonfiction",
  "booker prize winner",
  "international booker prize",
  "hugo award best novel",
  "nebula award winner",
  "national book award fiction",
  "national book award nonfiction",
  "newbery medal winner",
  "caldecott medal",
  "costa book award",
  "women's prize for fiction",
  "edgar award mystery",
  "carnegie medal winner",
  "man booker prize shortlist",
  "kirkus prize",
  "pen faulkner award",
  "goncourt prize",
  "dublin literary award",
  "andrew carnegie medal",
  "national book critics circle",
  "lambda literary award",
  "arthur c clarke award",
  "world fantasy award",
  "bram stoker award",
  "locus award",
  "philip k dick award",
  "costa novel award",
  "baileys prize",
  "orange prize fiction",

  // Popular authors (50 queries)
  "author:Stephen King",
  "author:Toni Morrison",
  "author:Brandon Sanderson",
  "author:Margaret Atwood",
  "author:Neil Gaiman",
  "author:Haruki Murakami",
  "author:James Patterson",
  "author:Colleen Hoover",
  "author:Taylor Jenkins Reid",
  "author:Sally Rooney",
  "author:Kazuo Ishiguro",
  "author:Chimamanda Ngozi Adichie",
  "author:George R.R. Martin",
  "author:J.R.R. Tolkien",
  "author:Agatha Christie",
  "author:Jane Austen",
  "author:F. Scott Fitzgerald",
  "author:Gabriel Garcia Marquez",
  "author:Fyodor Dostoevsky",
  "author:Virginia Woolf",
  "author:Ernest Hemingway",
  "author:Kurt Vonnegut",
  "author:Ursula K. Le Guin",
  "author:Isaac Asimov",
  "author:Philip K. Dick",
  "author:Octavia Butler",
  "author:N.K. Jemisin",
  "author:George Orwell",
  "author:Ray Bradbury",
  "author:Cormac McCarthy",
  "author:Don DeLillo",
  "author:Zadie Smith",
  "author:Donna Tartt",
  "author:Khaled Hosseini",
  "author:Celeste Ng",
  "author:Min Jin Lee",
  "author:Ocean Vuong",
  "author:Brit Bennett",
  "author:Madeline Miller",
  "author:Emily Henry",
  "author:Matt Haig",
  "author:Fredrik Backman",
  "author:Delia Owens",
  "author:Andy Weir",
  "author:Michael Crichton",
  "author:Dan Brown",
  "author:John Grisham",
  "author:Malcolm Gladwell",
  "author:Yuval Noah Harari",
  "author:Rebecca Skloot",

  // Year-based best books (30 queries)
  "best fiction 2015",
  "best fiction 2016",
  "best fiction 2017",
  "best fiction 2018",
  "best fiction 2019",
  "best fiction 2020",
  "best fiction 2021",
  "best fiction 2022",
  "best fiction 2023",
  "best fiction 2024",
  "best nonfiction 2020",
  "best nonfiction 2021",
  "best nonfiction 2022",
  "best nonfiction 2023",
  "best nonfiction 2024",
  "popular books 2020",
  "popular books 2021",
  "popular books 2022",
  "popular books 2023",
  "popular books 2024",
  "bestseller 2020",
  "bestseller 2021",
  "bestseller 2022",
  "bestseller 2023",
  "bestseller 2024",
  "top rated books 2020",
  "top rated books 2021",
  "top rated books 2022",
  "top rated books 2023",
  "top rated books 2024",

  // Supplemental: classics, themes, global literature (70 queries)
  "classic novels",
  "modern classics literature",
  "great american novel",
  "great british novel",
  "russian literature classics",
  "japanese literature",
  "african literature",
  "latin american literature",
  "indian literature english",
  "australian literature",
  "canadian literature",
  "irish literature",
  "scandinavian noir",
  "mediterranean fiction",
  "middle eastern literature",
  "caribbean literature",
  "postcolonial literature",
  "feminist literature",
  "queer fiction",
  "diverse voices fiction",
  "subject:race relations",
  "subject:immigration",
  "subject:families",
  "subject:love stories",
  "subject:grief",
  "subject:war",
  "subject:identity",
  "subject:nature writing",
  "subject:artificial intelligence",
  "subject:space exploration",
  "debut novel award",
  "translated fiction",
  "subject:comics",
  "book to film adaptation",
  "beach reads",
  "summer reading",
  "page turner thriller",
  "mind bending fiction",
  "twist ending novel",
  "unreliable narrator",
  "multiple timelines novel",
  "dual perspective novel",
  "epistolary novel",
  "novels in verse",
  "climate fiction",
  "afrofuturism",
  "dark academia",
  "campus novel",
  "workplace fiction",
  "food fiction",
  "music fiction",
  "art world fiction",
  "sports fiction",
  "road trip novel",
  "island fiction",
  "small town fiction",
  "new york novel",
  "london fiction",
  "survival fiction",
  "subject:apocalyptic fiction",
  "subject:post-apocalyptic fiction",
  "subject:time travel",
  "alternate history",
  "first contact science fiction",
  "robots fiction",
  "subject:dragons",
  "subject:vampires",
  "subject:witches",
  "subject:ghosts",
];

// ─── Helpers ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function loadCheckpoint(): Checkpoint {
  if (existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(readFileSync(CHECKPOINT_FILE, "utf-8"));
  }
  return { completedQueries: [], totalBooksCollected: 0, totalBooksEmbedded: 0 };
}

function saveCheckpoint(cp: Checkpoint): void {
  writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
}

function buildBookText(book: BookRecord): string {
  const parts: string[] = [];
  parts.push(`Title: ${book.title}`);
  if (book.author) parts.push(`Author: ${book.author}`);
  if (book.genre) parts.push(`Genre: ${book.genre}`);
  if (book.description) parts.push(book.description.slice(0, 2000));
  return parts.join("\n");
}

function buildCoverUrl(coverId?: number): string | null {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

// ─── Open Library Fetch ─────────────────────────────────────

interface OLDoc {
  key: string; // "/works/OL12345W"
  title?: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  first_sentence?: string[];
  first_publish_year?: number;
}

async function fetchOpenLibraryBooks(query: string): Promise<BookRecord[]> {
  const url = new URL(OL_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "100");
  url.searchParams.set(
    "fields",
    "key,title,author_name,cover_i,subject,first_sentence,first_publish_year"
  );

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`  Open Library error (${res.status}) for query: ${query}`);
    return [];
  }

  const data = await res.json();
  if (!data.docs || data.docs.length === 0) return [];

  const books: BookRecord[] = [];
  for (const doc of data.docs as OLDoc[]) {
    if (!doc.key || !doc.title) continue;

    // Build a description from subjects + first_sentence
    const subjects = doc.subject?.slice(0, 20) ?? [];
    const firstSentence = doc.first_sentence?.[0] ?? "";

    // Skip books with very little metadata
    if (subjects.length < 2 && !firstSentence) continue;

    const descParts: string[] = [];
    if (subjects.length > 0) {
      descParts.push(`Subjects: ${subjects.join(", ")}`);
    }
    if (firstSentence) {
      descParts.push(firstSentence);
    }

    const workId = doc.key.replace("/works/", "");

    books.push({
      googleBookId: `ol:${workId}`,
      title: doc.title,
      author: doc.author_name?.join(", ") ?? null,
      genre: subjects[0] ?? null,
      description: descParts.join("\n"),
      coverUrl: buildCoverUrl(doc.cover_i),
    });
  }

  return books;
}

// ─── Batch Embed & Store ────────────────────────────────────

async function embedAndStoreBatch(books: BookRecord[]): Promise<number> {
  // Check which are already embedded
  const ids = books.map((b) => b.googleBookId);

  // Supabase .in() has a limit, so chunk the lookup
  const existingIds = new Set<string>();
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const { data: existing } = await supabase
      .from("book_embeddings")
      .select("google_book_id")
      .in("google_book_id", chunk);
    for (const r of existing ?? []) {
      existingIds.add(r.google_book_id);
    }
  }

  const toEmbed = books.filter((b) => !existingIds.has(b.googleBookId));

  if (toEmbed.length === 0) return 0;

  let embedded = 0;

  for (let i = 0; i < toEmbed.length; i += EMBEDDING_CHUNK_SIZE) {
    const chunk = toEmbed.slice(i, i + EMBEDDING_CHUNK_SIZE);
    const texts = chunk.map(buildBookText);

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });

      const rows = response.data.map((item, idx) => ({
        google_book_id: chunk[idx].googleBookId,
        embedding: item.embedding,
        title: chunk[idx].title,
        author: chunk[idx].author,
        genre: chunk[idx].genre,
        description: chunk[idx].description?.slice(0, 2000) ?? null,
        cover_url: chunk[idx].coverUrl,
      }));

      const { error } = await supabase.from("book_embeddings").upsert(rows);

      if (error) {
        console.error(`  Upsert error for chunk:`, error.message);
      } else {
        embedded += chunk.length;
      }
    } catch (err) {
      console.error(`  OpenAI embedding error:`, (err as Error).message);
    }
  }

  return embedded;
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log("=== BetterReads Seed Embeddings (Open Library) ===\n");

  // Validate env vars
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const checkpoint = loadCheckpoint();
  const completedSet = new Set(checkpoint.completedQueries);
  const pendingQueries = SEED_QUERIES.filter((q) => !completedSet.has(q));

  console.log(`Total queries: ${SEED_QUERIES.length}`);
  console.log(`Already completed: ${completedSet.size}`);
  console.log(`Remaining: ${pendingQueries.length}\n`);

  let queriesDone = completedSet.size;

  for (const query of pendingQueries) {
    queriesDone++;
    process.stdout.write(
      `[${queriesDone}/${SEED_QUERIES.length}] "${query}" ... `
    );

    try {
      const books = await fetchOpenLibraryBooks(query);
      console.log(`${books.length} results`);

      // Embed this batch immediately
      if (books.length > 0) {
        const embedded = await embedAndStoreBatch(books);
        checkpoint.totalBooksEmbedded += embedded;
        if (embedded > 0) {
          console.log(`  → Embedded ${embedded} new books`);
        }
      }

      checkpoint.completedQueries.push(query);
      checkpoint.totalBooksCollected += books.length;
      saveCheckpoint(checkpoint);
    } catch (err) {
      console.error(`  Error: ${(err as Error).message}`);
    }

    await sleep(OL_DELAY_MS);
  }

  // Final count from DB
  const { count } = await supabase
    .from("book_embeddings")
    .select("*", { count: "exact", head: true });

  console.log("\n=== Seed Complete ===");
  console.log(`Queries executed: ${SEED_QUERIES.length}`);
  console.log(`Books in book_embeddings: ${count}`);
  console.log(`Checkpoint saved to: ${CHECKPOINT_FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
