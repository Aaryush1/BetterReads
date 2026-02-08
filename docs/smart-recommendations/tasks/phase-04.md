# Phase 4: Shelf Hook + Polish

## Status: COMPLETE

## Overview
Wire up lazy embedding on shelf-add so the candidate pool grows organically, handle edge cases, verify performance, and update documentation.

## Tasks

### Shelf Hook
- [x] Modify `src/app/api/shelf/route.ts` POST handler:
  - [x] After successful `user_books` insert, fire-and-forget `embedBookIfNeeded()`
  - [x] `embedBookIfNeeded`: check `book_embeddings` for existing row, skip if found
  - [x] If not found, fetch full book details from Google Books API (for description + genre)
  - [x] Call `embedBook()` to generate and store embedding
  - [x] Must not block the shelf response — use `Promise.catch(() => {})` pattern
  - [x] Must not fail the shelf operation if embedding fails
- [x] Modify `src/app/api/shelf/[id]/route.ts` PATCH handler:
  - [x] On rating update, fire-and-forget `embedBookIfNeeded()`

### Edge Cases
- [x] Handle books with no description gracefully (embed with title+author+genre only)
- [x] Handle OpenAI API errors (timeout, rate limit, auth failure) — log and skip
- [x] Handle Supabase write errors for `book_embeddings` — log and skip
- [x] Handle case where user's rated books have 0 embeddings in `book_embeddings`
  - [x] On-the-fly generation in recommendation route bridges the gap
- [x] Handle case where `match_books` returns 0 results (fall back)
- [x] Handle very new user: 1 book shelved but not yet rated (show fallback)
- [x] Skip Open Library IDs (`ol:*`) in shelf hook — already in seed pool

### Documentation
- [x] `.env.local.example` already has both new env vars + comments

### Final Cleanup
- [x] No debug logging in embedding service
- [x] No secrets leak to client-side code
- [x] Run `npm run build` — zero errors
- [x] Run `npm run lint` — zero errors

## Testing Checklist
- [x] Adding a new book to shelf triggers embedding generation
- [x] Adding a book that's already embedded does NOT re-embed
- [x] Embedding failure does not prevent book from being added to shelf
- [x] `npm run build` passes
- [x] `npm run lint` passes

## Notes
- `embedBookIfNeeded` fetches full Google Books details for richer embeddings (description + genre)
- OL-prefixed IDs are skipped in the hook since they're already in the seed pool
- The on-the-fly generation in the recommendation route (Phase 3) handles the existing library gap
- The shelf hook handles all future books going forward
- Combined with Phase 3's on-the-fly generation, the system works immediately for both old and new books
