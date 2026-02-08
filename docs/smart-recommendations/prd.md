# Smart Recommendations — Product Requirements Document

**Status:** APPROVED
**Created:** 2026-02-08
**Last Updated:** 2026-02-08

---

## 1. Problem Statement

BetterReads' current recommendation system is essentially "more books by the same author." It searches Google Books by author name for the user's top-rated books and returns whatever the API considers relevant. This produces:

- **Shallow recommendations** — users see the same author's backlist, not genuinely similar books by different authors
- **No semantic understanding** — the system doesn't know that a user who loved *The Road* might enjoy *Station Eleven* (post-apocalyptic literary fiction), because it only matches on "Cormac McCarthy"
- **No cross-genre discovery** — a user who rates both literary fiction and sci-fi highly gets siloed recommendations in each, never seeing books that bridge the gap
- **Weak cold start** — new users get the same 4 hardcoded lists regardless of the first book they add
- **No learning** — the system doesn't improve as users interact with it; showing and ignoring a recommendation has zero effect

The MVP PRD explicitly noted: *"Recommendation algorithm is TBD — will be refined post-MVP."* This is that refinement.

## 2. Vision

Replace the keyword-search recommendation engine with an **embedding-based semantic similarity system**. Every book in the system gets a dense vector representation that captures its themes, tone, genre, and style. A user's "taste profile" is computed from their rated books, and recommendations are found by nearest-neighbor search in vector space.

The result: recommendations that feel like they come from a well-read friend, not a keyword search.

## 3. Goals

- **Semantic matching** — Recommend books based on thematic/tonal similarity, not just author or title keywords
- **Personalized taste profiles** — Build a per-user taste vector from their ratings (weighted by rating value)
- **Explainable results** — Every recommendation includes a reason tied to the user's reading history
- **Fast cold start** — Even a single rated book produces meaningful recommendations
- **Progressive improvement** — Recommendations get better as users rate more books
- **Low operational cost** — Embedding generation is a one-time cost per book; vector search is fast and cheap
- **Backward-compatible UI** — The Discover page and API contract stay the same; only the backend algorithm changes

## 4. Non-Goals

- **Social/collaborative filtering** — Not using other users' data (requires critical mass we don't have yet)
- **LLM-generated explanations** — No Claude/GPT calls at recommendation time (too slow, too expensive per request). May be added later as an enhancement
- **Real-time learning** — No reinforcement learning or click-through tracking (future enhancement)
- **Custom embedding model** — Using an off-the-shelf embedding API, not training our own
- **Full book catalog pre-indexing** — Beyond the 10K seed catalog, we embed books as they enter the system (shelved by users), not the entire Google Books catalog

## 5. User Stories

### Recommendations
- As a user who rated *Project Hail Mary* 5 stars, I see recommendations for other sci-fi novels with humor and problem-solving themes — not just "more Andy Weir"
- As a user who loves both literary fiction and fantasy, I see recommendations that bridge the two (e.g., Susanna Clarke, Kazuo Ishiguro's *The Buried Giant*)
- As a user with only 1 rated book, I still get meaningful recommendations based on that book's themes
- As a user, I see a clear reason for each recommendation row (e.g., "Similar to books you've loved" or "Because you enjoyed dark, atmospheric fiction")
- As a user, I can add a recommended book to my shelf directly from the Discover page (unchanged from MVP)

### Behind the Scenes
- As a book that gets searched or shelved, my description is embedded and stored so I can appear in future recommendations
- As the system, I generate embeddings lazily (on first encounter) and cache them permanently
- As the system, when a user rates or re-rates a book, I recompute their taste profile on the next Discover page visit

## 6. Acceptance Criteria

### Must pass to ship:
- [ ] Books are embedded using an external embedding API when first encountered
- [ ] Embeddings are stored in Supabase via `pgvector`
- [ ] A user's taste profile (weighted average of rated book embeddings) is computed per request
- [ ] Recommendations are retrieved via cosine similarity nearest-neighbor search
- [ ] Books already on the user's shelves are excluded from results
- [ ] At least 3 recommendation rows are returned for users with 1+ rated books
- [ ] Fallback recommendations (curated or popular) are shown for users with 0 rated books
- [ ] Each recommendation row includes a human-readable `reason` string
- [ ] The `/api/recommendations` response shape is unchanged (backward-compatible)
- [ ] The Discover page works without any frontend changes
- [ ] Embedding generation failures are handled gracefully (fall back to current keyword search)
- [ ] Response time for `/api/recommendations` is under 2 seconds for a user with 20 rated books
- [ ] New environment variable(s) are documented in `.env.local.example`

### Nice to have:
- [ ] Genre diversity: rows span multiple genres rather than clustering in one
- [ ] Engagement tracking: log which recommendations are shown (for future optimization)

## 7. Technical Approach (High Level)

### Embedding Model
Use **OpenAI `text-embedding-3-small`** (1536 dimensions, $0.02/1M tokens). Alternatives: Voyage AI, Cohere embed-v3. The embedding input for each book is a concatenation of:

```
Title: {title}
Author: {author}
Genre: {genre}
Description: {description (truncated to ~500 words)}
```

### Storage
Use **Supabase `pgvector`** extension. Add a `book_embeddings` table:

```sql
CREATE TABLE book_embeddings (
  google_book_id TEXT PRIMARY KEY,
  embedding      vector(1536),
  title          TEXT,
  author         TEXT,
  genre          TEXT,
  description    TEXT,
  cover_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

Index for fast nearest-neighbor search:

```sql
CREATE INDEX ON book_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### Taste Profile Computation
For each user request:

1. Fetch user's rated books + their embeddings from `book_embeddings`
2. Split into positive signal (rating >= 3.0) and negative signal (rating <= 2.5)
3. Compute positive taste vector: `pos_vector = Σ (pos_weight × embedding) / Σ pos_weight`
   - Positive weights: `5.0 → 1.0`, `4.5 → 0.85`, `4.0 → 0.7`, `3.5 → 0.4`, `3.0 → 0.2`
4. Compute negative taste vector: `neg_vector = Σ (neg_weight × embedding) / Σ neg_weight`
   - Negative weights: `1.0 → 0.6`, `1.5 → 0.5`, `2.0 → 0.35`, `2.5 → 0.2`
5. Compute final taste vector: `taste_vector = pos_vector - (α × neg_vector)` where `α = 0.3` (tunable)
6. Normalize the taste vector

### Recommendation Query
```sql
SELECT *, 1 - (embedding <=> $taste_vector) AS similarity
FROM book_embeddings
WHERE google_book_id NOT IN ($user_book_ids)
ORDER BY embedding <=> $taste_vector
LIMIT 30;
```

Group results into rows of 6 using dynamic reason generation (see below).

### Dynamic Reason Generation
Instead of static template strings, recommendation rows are grouped and labeled dynamically:

1. For each recommended book, find the user's rated book whose embedding is most similar (the "anchor")
2. Cluster the 30 results by their anchor book — books anchored to the same rated book form a row
3. For each cluster, analyze the genre/category metadata of the books in it to extract a thematic label
4. Generate reason strings that combine the anchor and theme:
   - If cluster has a clear genre pattern: `"Dark atmospheric fiction — because you loved The Road"`
   - If anchored to a single highly-rated book: `"Readers who loved Project Hail Mary also enjoyed these"`
   - If cluster spans genres: `"Literary novels with a speculative edge"`
5. Rows with a `sourceBook` reference the anchor; thematic-only rows have `sourceBook: null`

This produces reasons like:
- "Sweeping historical epics — inspired by your love of All the Light We Cannot See"
- "Witty, voice-driven literary fiction"
- "Mind-bending sci-fi with heart"

### Candidate Pool Growth
Books enter `book_embeddings` through three paths:
1. **User shelves a book** — if not already embedded, embed on write (via the shelf API)
2. **Seed catalog** — one-time script to embed the top 10,000 popular/classic books across genres for a rich cold-start pool
3. **Ongoing growth** — as more users shelf books, the pool grows organically

### Fallback Strategy
If embedding generation fails or the candidate pool is too small, fall back to the current keyword-based system. The existing recommendation code stays in the codebase as the fallback path.

## 8. Architecture Diagram

```
User rates/shelves book
        │
        ▼
  ┌─────────────┐    embed text    ┌──────────────────┐
  │ Shelf API   │ ──────────────▶  │ OpenAI Embeddings│
  │ (POST/PATCH)│                  │ API              │
  └─────────────┘                  └──────────────────┘
        │                                   │
        │                          embedding vector
        ▼                                   │
  ┌─────────────┐                           ▼
  │ user_books  │                  ┌──────────────────┐
  │ (Supabase)  │                  │ book_embeddings  │
  └─────────────┘                  │ (Supabase +      │
                                   │  pgvector)       │
                                   └──────────────────┘
                                            │
User opens Discover                         │
        │                                   │
        ▼                                   │
  ┌──────────────────┐                      │
  │ GET /api/        │  1. fetch user rated  │
  │ recommendations  │     book embeddings   │
  │                  │  2. compute taste vec  │
  │                  │  3. nearest-neighbor ──┘
  │                  │     query
  │                  │  4. group + format
  └──────────────────┘
        │
        ▼
  ┌──────────────────┐
  │ Discover Page    │  (unchanged)
  │ (React client)   │
  └──────────────────┘
```

## 9. Cost Estimate

| Operation | Volume | Cost |
|-----------|--------|------|
| Embed a book (~200 tokens avg) | 1,000 books | ~$0.004 |
| Embed a book | 10,000 books | ~$0.04 |
| pgvector query | Unlimited | Free (Supabase compute) |
| OpenAI API monthly (moderate usage) | ~5,000 embeddings/mo | ~$0.02/mo |

Cost is negligible. The embedding API is one of the cheapest AI services available.

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAI API down/slow | Low | Medium | Fall back to keyword search; embeddings are cached permanently |
| Small candidate pool early on | Low | Low | 10K seed catalog provides strong baseline from day one |
| pgvector performance at scale | Low | Low | IVFFlat index handles 100K+ vectors; HNSW available if needed |
| Embedding quality for short descriptions | Medium | Low | Concatenate title + author + genre to supplement; Google Books descriptions are usually 100+ words |
| Supabase free tier limits | Medium | Medium | pgvector is available on free tier; storage is generous |

## 11. Resolved Decisions

| Question | Decision |
|----------|----------|
| Embedding provider | **OpenAI `text-embedding-3-small`** (1536 dimensions) |
| Seed catalog size | **10,000 books** — popular/classic across genres, embedded via one-time script |
| Negative signals | **Yes, in v1** — low-rated books (1-2.5 stars) push the taste vector away with α=0.3 dampening |
| Reason generation | **Dynamic grouping** — cluster by anchor book, extract thematic labels from genre metadata, produce natural-language row titles |
| Candidate pool growth | Lazy embedding on shelf-add (if book not already embedded) + 10K seed |

---

*This PRD is approved. Proceeding to technical plan.*
