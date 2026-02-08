# Smart Recommendations — Technical Plan

**Status:** APPROVED
**Created:** 2026-02-08

---

## 1. Architecture Overview

The system has four components:

1. **Embedding Service** (`src/lib/embeddings.ts`) — Generates embeddings via OpenAI API, stores them in Supabase
2. **Seed Script** (`scripts/seed-embeddings.ts`) — One-time script to populate 10K books
3. **Recommendation Engine** (`src/app/api/recommendations/route.ts`) — Computes taste vectors, queries nearest neighbors, clusters results
4. **Shelf Hook** — Embeds books on shelf-add if not already embedded

No frontend changes. The `/api/recommendations` response shape stays identical.

---

## 2. Data Model

### New Table: `book_embeddings`

```sql
-- Enable pgvector
create extension if not exists vector with schema extensions;

-- Book embeddings table
create table book_embeddings (
  google_book_id  text primary key,
  embedding       extensions.vector(1536) not null,
  title           text not null,
  author          text,
  genre           text,
  description     text,
  cover_url       text,
  created_at      timestamptz default now()
);

-- HNSW index for cosine similarity (better recall than IVFFlat, no training step)
create index on book_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);
```

**Why HNSW over IVFFlat:**
- IVFFlat requires a training step (`CREATE INDEX` scans the full table) and returns approximate results that degrade when the data distribution shifts
- HNSW has no training step, better recall at the same speed, and handles incremental inserts gracefully
- At 10K-50K vectors with 1536 dimensions, HNSW is the clear choice per Supabase docs

### RLS Policy

```sql
-- book_embeddings is a shared catalog, not per-user
-- Read access for all authenticated users, write access only via service role (API routes)
alter table book_embeddings enable row level security;

create policy "Authenticated users can read embeddings"
  on book_embeddings for select
  using (auth.role() = 'authenticated');
```

Write operations happen server-side via the Supabase service role client (no RLS bypass needed if we use a separate admin client, or we can use a security definer function).

### Postgres Function: `match_books`

```sql
create or replace function match_books(
  query_embedding extensions.vector(1536),
  exclude_ids text[],
  match_count int default 30
)
returns table (
  google_book_id text,
  title text,
  author text,
  genre text,
  description text,
  cover_url text,
  similarity float
)
language sql stable
as $$
  select
    b.google_book_id,
    b.title,
    b.author,
    b.genre,
    b.description,
    b.cover_url,
    1 - (b.embedding <=> query_embedding) as similarity
  from book_embeddings b
  where b.google_book_id != all(exclude_ids)
  order by b.embedding <=> query_embedding
  limit match_count;
$$;
```

This function:
- Takes a taste vector, list of book IDs to exclude, and a result count
- Returns books sorted by cosine similarity (descending)
- Leverages the HNSW index for fast approximate nearest-neighbor search
- Called from the API route via `supabase.rpc('match_books', { ... })`

---

## 3. Embedding Service

### File: `src/lib/embeddings.ts`

**Dependencies:** `openai` npm package

```
npm install openai
```

**Core functions:**

#### `generateEmbedding(text: string): Promise<number[]>`
- Calls `POST https://api.openai.com/v1/embeddings` with model `text-embedding-3-small`
- Input: concatenated book text (title + author + genre + description)
- Output: 1536-dimensional float array
- Uses the `openai` SDK for type-safe calls

#### `buildBookText(book: { title, author, genre, description }): string`
- Concatenates book metadata into embedding input:
  ```
  Title: {title}
  Author: {author}
  Genre: {genre}
  {description (truncated to first ~2000 chars)}
  ```
- Handles nulls gracefully (omits missing fields)

#### `embedBook(googleBookId: string, book: BookMetadata): Promise<void>`
- Check if `google_book_id` already exists in `book_embeddings` (skip if so)
- Call `generateEmbedding(buildBookText(book))`
- Upsert into `book_embeddings` table
- Fire-and-forget pattern — embedding failures don't block the shelf operation

#### `embedBooks(books: BookMetadata[]): Promise<void>`
- Batch version for seed script
- Processes in chunks of 100 (OpenAI supports batch input)
- Rate-limited with delays between chunks

### Environment Variable

```
OPENAI_API_KEY=sk-...
```

Added to `.env.local.example`.

### Supabase Admin Client

For writing to `book_embeddings` (bypassing RLS), create a server-side admin client:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

File: `src/lib/supabase/admin.ts`
- Uses `createClient` from `@supabase/supabase-js` (not `@supabase/ssr`)
- Initialized with the service role key
- Only used server-side for embedding writes

---

## 4. Seed Script

### File: `scripts/seed-embeddings.ts`

**Purpose:** Populate `book_embeddings` with 10,000 popular books.

**Data Source Strategy:**

Google Books API has a 1,000 requests/day free tier limit. To get 10K books:
- Each request returns up to 40 results (`maxResults=40`)
- 250 requests = 10,000 books
- Spread across multiple days, OR use a paid API key

**Query Strategy — Curated Subject Searches:**

```typescript
const SEED_QUERIES = [
  // Fiction genres (40 queries × 40 results = 1,600 books)
  "subject:fiction", "subject:literary fiction", "subject:science fiction",
  "subject:fantasy", "subject:mystery", "subject:thriller",
  "subject:romance", "subject:horror", "subject:historical fiction",
  "subject:contemporary fiction", ...

  // Non-fiction (30 queries × 40 = 1,200 books)
  "subject:biography", "subject:history", "subject:science",
  "subject:psychology", "subject:philosophy", "subject:business", ...

  // Bestseller/award lists (30 queries × 40 = 1,200 books)
  "pulitzer prize fiction", "booker prize", "hugo award",
  "national book award", "newbery medal", "best books 2024", ...

  // Popular authors (50 queries × 40 = 2,000 books)
  "inauthor:Stephen King", "inauthor:Toni Morrison",
  "inauthor:Brandon Sanderson", ...

  // Supplemental: era + genre combos (100 queries × 40 = 4,000 books)
  "best fiction 2020", "best fiction 2021", "best fiction 2022",
  "classic novels", "modern classics", ...
];
```

Total: ~250 queries × 40 results = 10,000 books (with deduplication).

**Execution flow:**
1. Run each query against Google Books API (`maxResults=40`, paginate with `startIndex` if needed)
2. Deduplicate by `google_book_id`
3. Filter out books with no description (embeddings need text)
4. For each batch of books, call OpenAI embeddings API
5. Upsert into `book_embeddings`
6. Progress logging + resume capability (skip already-embedded books)

**Run command:**
```bash
npx tsx scripts/seed-embeddings.ts
```

**Rate limiting:**
- Google Books: 1 request/second (stay well under quota)
- OpenAI embeddings: 3,000 RPM limit on free tier; batch 100 texts per request
- Script designed to be idempotent and resumable

---

## 5. Recommendation Engine (Rewrite)

### File: `src/app/api/recommendations/route.ts`

**New flow:**

#### Step 1: Fetch User Data
```typescript
const { data: userBooks } = await supabase
  .from("user_books")
  .select("google_book_id, title, author, rating")
  .eq("user_id", user.id);
```

#### Step 2: Fetch Embeddings for User's Rated Books
```typescript
const ratedBooks = userBooks.filter(b => b.rating != null);
const bookIds = ratedBooks.map(b => b.google_book_id);

const { data: embeddings } = await adminClient
  .from("book_embeddings")
  .select("google_book_id, embedding")
  .in("google_book_id", bookIds);
```

#### Step 3: Compute Taste Vector (with Negative Signal)

```typescript
function computeTasteVector(
  ratedBooks: { google_book_id: string; rating: number }[],
  embeddings: Map<string, number[]>
): number[] {
  const POS_WEIGHTS: Record<number, number> = {
    5: 1.0, 4.5: 0.85, 4: 0.7, 3.5: 0.4, 3: 0.2
  };
  const NEG_WEIGHTS: Record<number, number> = {
    1: 0.6, 1.5: 0.5, 2: 0.35, 2.5: 0.2
  };
  const NEGATIVE_ALPHA = 0.3;

  // Separate positive (≥3) and negative (≤2.5) books
  // Compute weighted average for each
  // Final = normalize(posVector - NEGATIVE_ALPHA * negVector)
}
```

#### Step 4: Query Nearest Neighbors
```typescript
const { data: candidates } = await supabase.rpc("match_books", {
  query_embedding: tasteVector,          // the computed vector
  exclude_ids: allUserBookIds,           // books already on shelves
  match_count: 30,
});
```

#### Step 5: Cluster & Generate Dynamic Reasons

For each candidate book:
1. Find the user's rated book whose embedding is most similar to this candidate (the "anchor")
2. Group candidates by anchor
3. For each group, analyze genre metadata to extract a thematic label
4. Generate reason string combining anchor + theme

**Clustering logic:**
```typescript
interface Cluster {
  anchor: { title: string; author: string | null };
  theme: string | null;        // extracted from genre metadata
  books: Book[];
}

function clusterByAnchor(
  candidates: CandidateBook[],
  userRatedEmbeddings: Map<string, { embedding: number[]; title: string; author: string }>
): Cluster[]
```

**Reason generation:**
```typescript
function generateReason(cluster: Cluster): string {
  if (cluster.theme && cluster.anchor) {
    return `${cluster.theme} — inspired by ${cluster.anchor.title}`;
  }
  if (cluster.theme) {
    return cluster.theme;
  }
  return `Because you liked "${cluster.anchor.title}"`;
}
```

**Theme extraction:**
- Collect `genre` fields from all books in the cluster
- Find the most common genre
- Map to a human-friendly label (e.g., "Fiction / Science Fiction" → "Mind-bending sci-fi")
- If genres are diverse, use a generic thematic label based on the anchor book's genre

#### Step 6: Format Response (Unchanged Shape)
```typescript
return NextResponse.json({
  rows: clusters.map(c => ({
    reason: generateReason(c),
    sourceBook: c.anchor ? { title: c.anchor.title, author: c.anchor.author } : null,
    books: c.books.slice(0, 6),
  }))
});
```

#### Step 7: Fallback
If the user has no rated books, OR if embedding computation fails, OR if the candidate pool returns < 6 books, fall back to the existing keyword-based recommendation logic (preserved as `fallbackRecommendations()`).

---

## 6. Shelf Hook (Lazy Embedding)

### File: `src/app/api/shelf/route.ts` (POST handler modification)

After successfully inserting a book into `user_books`:

```typescript
// Fire-and-forget: embed the book if not already in book_embeddings
embedBookIfNeeded(googleBookId, { title, author, coverUrl }).catch(() => {
  // Silent fail — embedding is best-effort
});
```

**`embedBookIfNeeded` logic:**
1. Check if `google_book_id` exists in `book_embeddings`
2. If not, fetch full book details from Google Books API (to get description + genre)
3. Call `embedBook()` to generate and store the embedding
4. This runs asynchronously — the shelf response returns immediately

---

## 7. Genre Label Mapping

### File: `src/lib/genre-labels.ts`

A mapping from raw Google Books categories to human-friendly thematic labels:

```typescript
const GENRE_LABELS: Record<string, string> = {
  "Fiction / Science Fiction": "Mind-bending sci-fi",
  "Fiction / Fantasy": "Imaginative fantasy",
  "Fiction / Literary": "Literary fiction with depth",
  "Fiction / Mystery & Detective": "Gripping mysteries",
  "Fiction / Thrillers": "Page-turning thrillers",
  "Fiction / Romance": "Heartfelt romance",
  "Fiction / Historical": "Sweeping historical fiction",
  "Fiction / Horror": "Dark and haunting reads",
  "Biography & Autobiography": "Fascinating life stories",
  "History": "Stories from history",
  "Science": "Curious minds, big ideas",
  "Psychology": "Understanding the human mind",
  // ... 30-40 mappings covering major categories
};
```

Fallback: if no mapping exists, use the raw genre string with title case.

---

## 8. Component Breakdown

| Component | File | Type | Purpose |
|-----------|------|------|---------|
| Embedding service | `src/lib/embeddings.ts` | New | OpenAI embedding generation + storage |
| Admin Supabase client | `src/lib/supabase/admin.ts` | New | Service-role client for embedding writes |
| Genre label mapping | `src/lib/genre-labels.ts` | New | Human-friendly genre labels |
| Seed script | `scripts/seed-embeddings.ts` | New | Populate 10K books |
| Recommendation engine | `src/app/api/recommendations/route.ts` | Rewrite | Taste vector + vector search + clustering |
| Shelf API hook | `src/app/api/shelf/route.ts` | Modify | Fire-and-forget embedding on book add |
| DB migration | `supabase/embeddings-schema.sql` | New | pgvector setup + table + function |
| Env template | `.env.local.example` | Modify | Add `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

---

## 9. Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `openai` | OpenAI API SDK (embeddings) | latest |

Single new dependency. The `openai` package is the official TypeScript SDK.

---

## 10. API Contract (Unchanged)

```typescript
// GET /api/recommendations
// Response:
{
  rows: Array<{
    reason: string;                                    // Dynamic thematic label
    sourceBook: { title: string; author: string | null } | null;  // Anchor book
    books: Book[];                                     // 6 recommended books
  }>
}
```

The Discover page (`src/app/(app)/discover/page.tsx`) continues to work with zero changes.

---

## 11. Performance Budget

| Operation | Target | Notes |
|-----------|--------|-------|
| Taste vector computation | < 50ms | In-memory weighted average of ~20 vectors |
| `match_books` RPC call | < 200ms | HNSW index query on 10K vectors |
| Total `/api/recommendations` | < 2s | Including DB reads + clustering |
| Embedding generation (per book) | < 500ms | OpenAI API latency |
| Seed script (full 10K) | ~2-4 hours | Rate-limited, resumable |

---

## 12. Risk Assessment

| Risk | Mitigation |
|------|------------|
| OpenAI API key exposure | Server-side only, never in `NEXT_PUBLIC_*` vars |
| Embedding API downtime | Graceful fallback to keyword-based recommendations |
| Seed script Google Books rate limit | 1 req/sec throttle, resumable, spread across sessions |
| Supabase free tier pgvector limits | pgvector available on free tier; 500MB storage handles 50K+ embeddings |
| Poor recommendations from sparse descriptions | `buildBookText` concatenates title+author+genre to supplement |
| Taste vector dominated by one genre | Clustering ensures diversity across rows |
| Service role key security | Only used in server-side `admin.ts`, never exposed to client |

---

## 13. Phased Implementation

### Phase 1: Infrastructure
- Enable pgvector, create `book_embeddings` table, `match_books` function
- Create embedding service (`src/lib/embeddings.ts`)
- Create admin Supabase client
- Add environment variables

### Phase 2: Seed Script
- Build and run the seed script to populate 10K books
- Verify embeddings are stored correctly
- Test `match_books` function with sample vectors

### Phase 3: Recommendation Engine
- Rewrite `/api/recommendations` with taste vector computation
- Implement negative signal weighting
- Implement clustering + dynamic reason generation
- Preserve fallback path
- Test end-to-end

### Phase 4: Shelf Hook + Polish
- Add fire-and-forget embedding to shelf POST
- Genre label mapping
- Edge case handling (no embeddings, partial embeddings, empty taste vector)
- Performance verification
- Update docs

---

*This plan is a draft. Awaiting user approval before proceeding to phased task breakdown.*
