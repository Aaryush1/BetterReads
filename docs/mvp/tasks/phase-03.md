# Phase 3: Book Search & Detail

## Status: NOT STARTED

## Overview
Integrate Google Books and Open Library APIs. Build search and book detail pages. After this phase, users can search for any book and view its details — but can't add to shelves yet.

## Tasks

### API Integration
- [ ] Add `GOOGLE_BOOKS_API_KEY` to `.env.local`
- [ ] Build Google Books API client (`src/lib/google-books.ts`):
  - [ ] `searchBooks(query: string)` — search volumes
  - [ ] `getBook(volumeId: string)` — get single volume detail
  - [ ] Map response to `Book` type
- [ ] Build Open Library API client (`src/lib/open-library.ts`):
  - [ ] `searchBooks(query: string)` — search works
  - [ ] Map response to `Book` type
  - [ ] Build cover image URL from cover ID
- [ ] Build normalizer (`src/lib/normalize-book.ts`):
  - [ ] Merge Google Books and Open Library results
  - [ ] Google Books is primary, Open Library fills missing covers/data
  - [ ] Deduplicate by title+author similarity

### API Routes
- [ ] Build `/api/books/search/route.ts`:
  - [ ] Accept `?q=` query param
  - [ ] Validate and sanitize input
  - [ ] Call Google Books (primary), then Open Library (supplemental)
  - [ ] Return normalized `Book[]`
  - [ ] Handle errors gracefully (return empty results, not 500)
- [ ] Build `/api/books/[id]/route.ts`:
  - [ ] Accept Google Books volume ID
  - [ ] Fetch full book detail
  - [ ] Return normalized `Book`

### Search Page
- [ ] Build search page (`src/app/(app)/search/page.tsx`)
- [ ] Wire SearchBar component in Navbar to navigate to `/search?q={query}`
- [ ] Build standalone SearchBar component (input with icon, debounced, form submit)
- [ ] Fetch results from `/api/books/search` on page load using search params
- [ ] Render search results as list cards matching design vision (cover, title, author, description, metadata)
- [ ] Show "No results" state
- [ ] Show loading skeleton while fetching

### Book Detail Page
- [ ] Build book detail page (`src/app/(app)/book/[id]/page.tsx`)
- [ ] Fetch book from `/api/books/[id]`
- [ ] Render matching design vision: large cover, title, author, metadata bar (pages, published, genre, ISBN), description
- [ ] Show loading skeleton while fetching
- [ ] Shelf action buttons render but are non-functional (wired in Phase 4)
- [ ] Star rating component renders but is non-functional (wired in Phase 5)

### BookCard Component
- [ ] Build BookCard component for grid display (cover, title, author)
- [ ] Clickable — navigates to `/book/[id]`

## Testing Checklist
- [ ] Searching "donna tartt" returns relevant results from Google Books
- [ ] Search results show cover images from API
- [ ] Books without covers show gradient placeholder
- [ ] Clicking a search result navigates to book detail page
- [ ] Book detail page shows all metadata (title, author, pages, published date, description)
- [ ] Search handles empty query gracefully
- [ ] Search handles API errors gracefully (shows error message, not crash)
- [ ] NavBar search bar navigates to search page with query
- [ ] Pages render in both light and dark mode
- [ ] Pages are responsive on mobile

## Notes
- Google Books API free tier allows 1,000 requests/day. For development, this is fine. Monitor usage.
- Cover image URLs from Google Books may use `http://` — we should rewrite to `https://`.
- Consider adding `next/image` with a configured remote pattern for Google Books and Open Library domains.
