# Phase 3: Recommendation Engine

## Status: NOT STARTED

## Overview
Rewrite the `/api/recommendations` endpoint to use embedding-based semantic similarity. This is the core of the feature — taste vectors, negative signals, nearest-neighbor search, clustering, and dynamic reason generation.

## Tasks

### Taste Vector Computation
- [ ] Create `src/lib/taste-vector.ts` with:
  - [ ] `computeTasteVector(ratedBooks, embeddingsMap)` → `number[]`
  - [ ] Positive weights: 5.0→1.0, 4.5→0.85, 4.0→0.7, 3.5→0.4, 3.0→0.2
  - [ ] Negative weights: 1.0→0.6, 1.5→0.5, 2.0→0.35, 2.5→0.2
  - [ ] Combine: `finalVector = normalize(posVector - 0.3 * negVector)`
  - [ ] Handle edge cases: single rated book, all negative ratings, missing embeddings

### Genre Label Mapping
- [ ] Create `src/lib/genre-labels.ts`
  - [ ] Map ~40 common Google Books categories to human-friendly thematic labels
  - [ ] Fallback: title-case the raw genre string if no mapping exists
  - [ ] Export `getThematicLabel(genres: string[]): string`

### Clustering & Reason Generation
- [ ] Create `src/lib/recommendation-clusters.ts` with:
  - [ ] `clusterByAnchor(candidates, userRatedEmbeddings)` → `Cluster[]`
    - For each candidate, find the closest user-rated book (anchor) by cosine similarity
    - Group candidates by anchor
    - Limit to 5 clusters max (top 5 by cluster size)
  - [ ] `generateReason(cluster)` → `string`
    - If theme + anchor: `"${theme} — inspired by ${anchor.title}"`
    - If theme only: `"${theme}"`
    - If anchor only: `"Because you liked "${anchor.title}""`
  - [ ] Extract theme from genre metadata of books in cluster

### Recommendation API Rewrite
- [ ] Rewrite `src/app/api/recommendations/route.ts`:
  - [ ] Fetch user's rated books from `user_books`
  - [ ] Fetch their embeddings from `book_embeddings`
  - [ ] Compute taste vector (positive + negative)
  - [ ] Call `match_books` RPC with taste vector + excluded book IDs
  - [ ] Cluster results by anchor book
  - [ ] Generate dynamic reason strings
  - [ ] Format response (same shape as current)
- [ ] Preserve existing keyword logic as `fallbackRecommendations()` function
- [ ] Use fallback when:
  - [ ] User has 0 rated books
  - [ ] No embeddings found for user's rated books
  - [ ] `match_books` returns fewer than 6 results
  - [ ] Any error in the embedding pipeline

### Cosine Similarity Utility
- [ ] Add `cosineSimilarity(a: number[], b: number[])` helper for anchor matching
  - Used client-side in clustering (not in DB query)

## Testing Checklist
- [ ] User with 3+ rated books sees embedding-based recommendations (not keyword search)
- [ ] Recommendation rows have dynamic thematic labels (not just "Because you liked X")
- [ ] Negative signal works: rating a book 1 star reduces similar recommendations
- [ ] User with 0 rated books sees fallback curated recommendations
- [ ] User with 1 rated book sees meaningful recommendations
- [ ] Response shape matches existing contract (Discover page works unchanged)
- [ ] Response time < 2 seconds for a user with 20 rated books
- [ ] Fallback triggers gracefully on embedding service failure
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

## Notes
- The anchor-matching step happens in-memory (not a DB query) since we already have the embeddings
- Clustering quality depends on having enough rated books — with 1-2 rated books, we get 1-2 clusters
- The 0.3 alpha for negative signal is tunable; start conservative
- Reason strings should feel natural, not templated — test with real data
