# Phase 5: Ratings & Recommendations

## Status: IN PROGRESS

## Overview
Add interactive star ratings and the Discover page with recommendation rows. After this phase, users can rate books and see personalized suggestions.

## Tasks

### Star Rating Component
- [x] Build StarRating component (`src/components/StarRating.tsx`):
  - [x] Support half-star increments (0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)
  - [x] Interactive mode (click to set rating, hover preview) for book detail
    - [x] Each star has two clickable halves (left = half, right = full) for half-star precision
    - [x] Hover preview shows the exact rating value that would be set on click
  - [x] Display-only mode (small, non-interactive) for library cards and search results
    - [x] Render partial fill for half-star values (e.g., 3.5 shows 3 full + 1 half-filled star)
  - [x] Support sizes: `sm` (14px stars), `md` (18px), `lg` (24px)
  - [x] Filled stars use amber color (`--color-amber`), half-filled stars use split fill, empty stars use border color
  - [x] Click on current rating to remove it (set to null)
  - [x] Show "X / 5" label next to rating in large mode (e.g., "3.5 / 5")

### Rating Persistence
- [x] Wire StarRating on book detail page to call PATCH `/api/shelf/[id]` with `{ rating }` (value is `NUMERIC(2,1)`: 0.5–5.0 in 0.5 steps, or `null` to clear)
- [x] Ensure rating is fetched and displayed when book detail page loads (half-star values render correctly)
- [x] Show ratings on BookCard in library grid (display-only, half-star support)
- [x] Show ratings on search result cards for books already on shelves (display-only, half-star support)

### Recommendations API
- [x] Build `/api/recommendations/route.ts`:
  - [x] Get user's highest-rated books from `user_books` (rating >= 4)
  - [x] For each top-rated book, search Google Books for similar books (by same author, similar title keywords)
  - [x] Exclude books already on user's shelves
  - [x] Group results by source book ("Because you liked X")
  - [x] If user has no rated books, return curated fallback list
  - [x] Extract genres from user's shelf, query "top books in [genre]"
  - [x] Return structured response: `{ rows: [{ reason, sourceBook, books }] }`

### Discover Page
- [x] Build discover page (`src/app/(app)/discover/page.tsx`)
- [x] Fetch recommendations from `/api/recommendations`
- [x] Render recommendation rows matching design vision:
  - [x] Row header: "Because you liked *[Book Title]*" with genre tags
  - [x] "See all" link (can be non-functional for MVP)
  - [x] Horizontal scroll of book cards with cover, title, author, rating (if exists), "+ Add to shelf"
- [x] Wire "+ Add to shelf" on recommendation cards to ShelfSelector (shows all shelves including custom)
- [x] Empty state: "Rate some books to get personalized recommendations!"
- [x] Loading skeletons while fetching

### Navbar Integration
- [x] Ensure "Discover" tab in Navbar links to `/discover`
- [x] Highlight active tab based on current route

## Testing Checklist
- [ ] User can click stars to rate a book on the detail page (full and half-star values)
- [ ] Half-star precision works: clicking left half of a star sets X.5, right half sets X.0
- [ ] Rating persists — reload the page and rating is still there (e.g., 3.5 stays as 3.5)
- [ ] Half-star values display correctly (3 full stars + 1 half-filled star for 3.5)
- [ ] User can change a rating by clicking a different star position
- [ ] User can remove a rating by clicking the current rating star
- [ ] Ratings appear on library book cards (display-only, with half-star rendering)
- [ ] Ratings appear on search results for shelved books (display-only, with half-star rendering)
- [ ] Discover page shows recommendation rows with book covers
- [ ] Recommendation reasons display correctly ("Because you liked X")
- [ ] User can add a recommended book to a shelf
- [ ] New user with no ratings sees fallback recommendations
- [ ] Horizontal scroll works on recommendation rows
- [ ] All components render in both light and dark mode
- [ ] Discover page is responsive on mobile

## Notes
- Recommendation quality will be basic for MVP. The key goal is having the UI, data flow, and API contract in place so a better algorithm can be swapped in later.
- Google Books API "related" or "similar" features are limited. We'll rely on keyword-based search (author name, genre terms) as the heuristic.
- Rate-limit awareness: recommendations may trigger multiple Google Books API calls. Consider caching recommendation results per user with a TTL.
- StarRating uses SVG clip paths for half-star rendering: amber fill clipped to left half, border-colored empty star behind.
- BookShelfStatus now handles both shelf selector and interactive rating (full variant), keeping the rating logic co-located with shelf status.
- Discover page uses `scrollbar-hide` CSS utility for clean horizontal scrolling on recommendation rows.
