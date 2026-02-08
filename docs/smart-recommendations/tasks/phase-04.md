# Phase 4: Shelf Hook + Polish

## Status: NOT STARTED

## Overview
Wire up lazy embedding on shelf-add so the candidate pool grows organically, handle edge cases, verify performance, and update documentation.

## Tasks

### Shelf Hook
- [ ] Modify `src/app/api/shelf/route.ts` POST handler:
  - [ ] After successful `user_books` insert, fire-and-forget `embedBookIfNeeded()`
  - [ ] `embedBookIfNeeded`: check `book_embeddings` for existing row, skip if found
  - [ ] If not found, fetch full book details from Google Books API (for description + genre)
  - [ ] Call `embedBook()` to generate and store embedding
  - [ ] Must not block the shelf response — use `Promise.catch(() => {})` pattern
  - [ ] Must not fail the shelf operation if embedding fails

### Edge Cases
- [ ] Handle books with no description gracefully (embed with title+author+genre only)
- [ ] Handle OpenAI API errors (timeout, rate limit, auth failure) — log and skip
- [ ] Handle Supabase write errors for `book_embeddings` — log and skip
- [ ] Handle case where user's rated books have 0 embeddings in `book_embeddings`
- [ ] Handle case where `match_books` returns 0 results (fall back)
- [ ] Handle very new user: 1 book shelved but not yet rated (show fallback)

### Performance Verification
- [ ] Measure `/api/recommendations` response time with 10K book pool
- [ ] Verify HNSW index is being used (check query plan)
- [ ] Ensure taste vector computation is < 50ms for 20 rated books
- [ ] Ensure total response time < 2 seconds

### Documentation
- [ ] Update `.env.local.example` with both new env vars + comments
- [ ] Update `README.md` with:
  - [ ] OpenAI API key prerequisite
  - [ ] Supabase service role key setup
  - [ ] Note about running seed script
- [ ] Update `CLAUDE.md` with:
  - [ ] New embedding service pattern
  - [ ] Admin Supabase client convention
  - [ ] Smart recommendations as current feature
- [ ] Update `docs/smart-recommendations/prd.md` status to reflect completion

### Final Cleanup
- [ ] Remove any debug logging from embedding service
- [ ] Verify no secrets leak to client-side code
- [ ] Run `npm run build` — zero errors
- [ ] Run `npm run lint` — zero errors

## Testing Checklist
- [ ] Adding a new book to shelf triggers embedding generation
- [ ] Adding a book that's already embedded does NOT re-embed
- [ ] Embedding failure does not prevent book from being added to shelf
- [ ] `/api/recommendations` response time < 2 seconds consistently
- [ ] Discover page renders correctly with new recommendation data
- [ ] Dark mode still works on Discover page (no UI changes, but verify)
- [ ] Fallback recommendations work when embedding service is unavailable
- [ ] All env vars documented in `.env.local.example`
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

## Notes
- The fire-and-forget pattern means the first time a user adds a rare book, it won't appear in their OWN recommendations immediately — but it will for future sessions
- The seed script should have already covered most popular books, so this hook mainly catches obscure/niche books
- Performance should be well within budget — HNSW queries on 10K vectors are sub-100ms
