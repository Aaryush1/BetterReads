# Phase 3: Book Search & Detail

## Status: COMPLETE

## Overview
Integrate Google Books and Open Library APIs. Build search and book detail pages. After this phase, users can search for any book and view its details — but can't add to shelves yet.

## Tasks

### API Integration
- [x] Add `GOOGLE_BOOKS_API_KEY` to `.env.local`
- [x] Build Google Books API client (`src/lib/google-books.ts`):
  - [x] `searchBooks(query: string)` — search volumes
  - [x] `getBook(volumeId: string)` — get single volume detail
  - [x] Map response to `Book` type
- [x] Build Open Library API client (`src/lib/open-library.ts`):
  - [x] `searchBooks(query: string)` — search works
  - [x] Map response to `Book` type
  - [x] Build cover image URL from cover ID
- [x] Build normalizer (`src/lib/normalize-book.ts`):
  - [x] Merge Google Books and Open Library results
  - [x] Google Books is primary, Open Library fills missing covers/data
  - [x] Deduplicate by title+author similarity

### API Routes
- [x] Build `/api/books/search/route.ts`:
  - [x] Accept `?q=` query param
  - [x] Validate and sanitize input
  - [x] Call Google Books (primary), then Open Library (supplemental)
  - [x] Return normalized `Book[]`
  - [x] Handle errors gracefully (return empty results, not 500)
- [x] Build `/api/books/[id]/route.ts`:
  - [x] Accept Google Books volume ID
  - [x] Fetch full book detail
  - [x] Return normalized `Book`

### Search Page
- [x] Build search page (`src/app/(app)/search/page.tsx`)
- [x] Wire SearchBar component in Navbar to navigate to `/search?q={query}`
- [x] Build standalone SearchBar component (input with icon, debounced, form submit)
- [x] Fetch results from `/api/books/search` on page load using search params
- [x] Render search results as list cards matching design vision (cover, title, author, description, metadata)
- [x] Show "No results" state
- [x] Show loading skeleton while fetching

### Book Detail Page
- [x] Build book detail page (`src/app/(app)/book/[id]/page.tsx`)
- [x] Fetch book from `/api/books/[id]`
- [x] Render matching design vision: large cover, title, author, metadata bar (pages, published, genre, ISBN), description
- [x] Show loading skeleton while fetching
- [x] Shelf action buttons render but are non-functional (wired in Phase 4)
- [x] Star rating component renders but is non-functional (wired in Phase 5)

### BookCard Component
- [x] Build BookCard component for grid display (cover, title, author)
- [x] Clickable — navigates to `/book/[id]`

## Testing Checklist
- [x] Searching "donna tartt" returns relevant results from Google Books
- [x] Search results show cover images from API
- [x] Books without covers show gradient placeholder
- [x] Clicking a search result navigates to book detail page
- [x] Book detail page shows all metadata (title, author, pages, published date, description)
- [x] Search handles empty query gracefully
- [x] Search handles API errors gracefully (shows error message, not crash)
- [x] NavBar search bar navigates to search page with query
- [x] Pages render in both light and dark mode
- [x] Pages are responsive on mobile

## Notes
- Google Books API free tier allows 1,000 requests/day. For development, this is fine. Monitor usage.
- Cover image URLs from Google Books may use `http://` — we should rewrite to `https://`.
- `next/image` remote patterns configured in `next.config.ts` for `books.google.com` and `covers.openlibrary.org`.
- Search page fetches data server-side (SSR) directly calling API clients — no internal HTTP fetch needed.
- Book detail page uses `getBook()` directly in the server component for faster loading.
- Book descriptions from Google Books may contain HTML — rendered with `dangerouslySetInnerHTML`.
