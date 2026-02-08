# Phase 2: Seed Script

## Status: IN PROGRESS

## Overview
Build and run a script that populates `book_embeddings` with 10,000 popular books across genres. This gives the recommendation engine a rich candidate pool from day one.

## Tasks

### Script Development
- [x] Create `scripts/seed-embeddings.ts`
- [x] Define curated query list (~250 queries across genres, awards, popular authors, eras)
  - [x] Fiction genres: literary, sci-fi, fantasy, mystery, thriller, romance, horror, historical (~40 queries)
  - [x] Non-fiction: biography, history, science, psychology, philosophy, business (~30 queries)
  - [x] Award winners: Pulitzer, Booker, Hugo, National Book Award, Nebula, Newbery (~30 queries)
  - [x] Popular authors: ~50 high-profile authors across genres
  - [x] Year-based: "best fiction 20XX" for recent years (~30 queries)
  - [x] Supplemental: classic novels, modern classics, genre combos (~70 queries)
- [x] For each query, fetch from Google Books API (`maxResults=40`)
- [x] Deduplicate results by `google_book_id`
- [x] Filter out books with no description (< 50 chars)
- [x] Batch-generate embeddings via OpenAI API (chunks of 100)
- [x] Upsert results into `book_embeddings`

### Resilience
- [x] Add progress logging (X of Y queries, total books embedded)
- [x] Skip books already in `book_embeddings` (resumable)
- [x] Rate limiting: 1 req/sec for Google Books, respect OpenAI RPM limits
- [x] Error handling: log failures, continue with next batch
- [x] Save progress to a local JSON checkpoint file

### Execution
- [ ] Run script: `npx tsx scripts/seed-embeddings.ts`
- [ ] Verify rows in `book_embeddings` table
- [ ] Spot-check: query a sample embedding for nearest neighbors

## Testing Checklist
- [ ] Script runs without crashing
- [ ] Books span multiple genres (verify with `SELECT DISTINCT genre FROM book_embeddings`)
- [ ] `match_books` returns sensible results for a test vector
- [ ] Script is idempotent (re-running skips already-embedded books)

## Notes
- Google Books free tier: 1,000 requests/day. With 250 queries, the script completes in 1 day
- If using a paid API key, can finish much faster
- OpenAI embedding cost for 10K books: ~$0.04
- Script should be run once, then only the shelf hook handles new books
- Consider running in batches if API quotas are tight (the checkpoint file enables this)
- Added `dotenv` as dev dependency for loading `.env.local` in standalone script
- Excluded `scripts/` from tsconfig to avoid Next.js build picking up standalone script deps
- Checkpoint file (`.seed-checkpoint.json`) added to `.gitignore`
