# Phase 3: Recommendation Engine

## Status: COMPLETE

## Overview
Rewrite the `/api/recommendations` endpoint to use embedding-based semantic similarity. This is the core of the feature — taste vectors, negative signals, nearest-neighbor search, clustering, and dynamic reason generation.

## Tasks

### Taste Vector Computation
- [x] Create `src/lib/taste-vector.ts` with:
  - [x] `computeTasteVector(ratedBooks, embeddingsMap)` → `number[]`
  - [x] Positive weights: 5.0→1.0, 4.5→0.85, 4.0→0.7, 3.5→0.4, 3.0→0.2
  - [x] Negative weights: 1.0→0.6, 1.5→0.5, 2.0→0.35, 2.5→0.2
  - [x] Combine: `finalVector = normalize(posVector - 0.3 * negVector)`
  - [x] Handle edge cases: single rated book, all negative ratings, missing embeddings

### Genre Label Mapping
- [x] Create `src/lib/genre-labels.ts`
  - [x] Map ~40 common Google Books categories to human-friendly thematic labels
  - [x] Fallback: title-case the raw genre string if no mapping exists
  - [x] Export `getThematicLabel(genres: string[]): string`

### Clustering & Reason Generation
- [x] Create `src/lib/recommendation-clusters.ts` with:
  - [x] `clusterByAnchor(candidates, userRatedEmbeddings)` → `Cluster[]`
    - For each candidate, find the closest user-rated book (anchor) by cosine similarity
    - Group candidates by anchor
    - Limit to 5 clusters max (top 5 by cluster size)
  - [x] `generateReason(cluster)` → `string`
    - If theme + anchor: `"${theme} — inspired by ${anchor.title}"`
    - If theme only: `"${theme}"`
    - If anchor only: `"Because you liked "${anchor.title}""`
  - [x] Extract theme from genre metadata of books in cluster

### Recommendation API Rewrite
- [x] Rewrite `src/app/api/recommendations/route.ts`:
  - [x] Fetch user's rated books from `user_books`
  - [x] Fetch their embeddings from `book_embeddings`
  - [x] On-the-fly embedding generation for rated books missing from pool
  - [x] Compute taste vector (positive + negative)
  - [x] Call `match_books` RPC with taste vector + excluded book IDs
  - [x] Cluster results by anchor book
  - [x] Generate dynamic reason strings
  - [x] Format response (same shape as current)
- [x] Preserve existing keyword logic as `fallbackRecommendations()` function
- [x] Use fallback when:
  - [x] User has 0 rated books
  - [x] No embeddings found for user's rated books
  - [x] `match_books` returns fewer than 6 results
  - [x] Any error in the embedding pipeline

### Cosine Similarity Utility
- [x] Add `cosineSimilarity(a: number[], b: number[])` helper for anchor matching
  - Used client-side in clustering (not in DB query)

## Testing Checklist
- [x] Response shape matches existing contract (Discover page works unchanged)
- [x] `npm run build` passes
- [x] `npm run lint` passes

## Notes
- On-the-fly embedding generation bridges the gap between seed pool (OL IDs) and user's library (Google Book IDs)
- Generated embeddings are stored fire-and-forget for future requests
- Candidate embeddings are fetched in a second query for anchor matching (~40 vectors)
- Fallback gracefully handles any errors in the embedding pipeline
