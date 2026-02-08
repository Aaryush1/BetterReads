# Phase 4: Shelves

## Status: COMPLETE

## Overview
Users can add books to shelves, manage custom shelves, view their library, and move/remove books. After this phase, the core book-tracking workflow is fully functional — including creating, renaming, and deleting custom shelves.

## Tasks

### Shelves API Routes
- [x] Build `/api/shelves/route.ts` (GET):
  - [x] Get current user from Supabase session
  - [x] Query `shelves` table ordered by `position`
  - [x] Return `Shelf[]`
- [x] Build `/api/shelves/route.ts` (POST):
  - [x] Accept `{ name }`
  - [x] Generate `slug` from name (lowercase, hyphenated)
  - [x] Set `is_default = false`, assign next `position`
  - [x] Insert into `shelves` with `user_id` from session
  - [x] Handle duplicate slug — return appropriate error
  - [x] Return created `Shelf`
- [x] Build `/api/shelves/[id]/route.ts` (PATCH):
  - [x] Accept `{ name }`
  - [x] Regenerate `slug` from new name
  - [x] Prevent renaming if `is_default = true` (optional — or allow rename of defaults)
  - [x] Return updated `Shelf`
- [x] Build `/api/shelves/[id]/route.ts` (DELETE):
  - [x] Check `is_default` — reject deletion of default shelves with error message
  - [x] Delete shelf (cascades to `user_books` on that shelf via FK)
  - [x] Return success

### User Books API Routes
- [x] Build `/api/shelf/route.ts` (GET):
  - [x] Get current user from Supabase session
  - [x] Query `user_books` table (optionally filter by `?shelfId=`)
  - [x] Join with `shelves` to include shelf name/slug
  - [x] Return `UserBook[]`
- [x] Build `/api/shelf/route.ts` (POST):
  - [x] Accept `{ googleBookId, shelfId, title, author, coverUrl }`
  - [x] Insert into `user_books` with `user_id` from session
  - [x] Handle duplicate (book already on a shelf) — return appropriate error
  - [x] Return created `UserBook`
- [x] Build `/api/shelf/[id]/route.ts` (PATCH):
  - [x] Accept `{ shelfId?, rating? }` (partial update)
  - [x] Update `user_books` row, set `updated_at`
  - [x] Return updated `UserBook`
- [x] Build `/api/shelf/[id]/route.ts` (DELETE):
  - [x] Delete `user_books` row
  - [x] Return success

### ShelfSelector Component
- [x] Build ShelfSelector component (`src/components/ShelfSelector.tsx`)
- [x] Fetch user's shelves from `/api/shelves` (default + custom)
- [x] Display all shelves in dropdown — defaults first, then custom shelves separated by divider
- [x] States: "Add to shelf" (no shelf assigned), "[Shelf Name]" (on shelf, with change/remove options)
- [x] On select: calls POST (add) or PATCH (change shelf) API
- [x] Include "Remove from shelf" option that calls DELETE

### ShelfManager Component
- [x] Build ShelfManager component (`src/components/ShelfManager.tsx`)
- [x] Display list of all shelves with book counts
- [x] Default shelves shown with lock icon (cannot be deleted)
- [x] Custom shelves have rename and delete actions
- [x] "Create new shelf" input with add button
  - [x] Validate: non-empty name, no duplicate names
  - [x] On submit: calls POST `/api/shelves`
- [x] Rename inline edit:
  - [x] Click shelf name to enter edit mode
  - [x] On confirm: calls PATCH `/api/shelves/[id]`
- [x] Delete with confirmation:
  - [x] Show confirmation dialog: "Delete '[name]'? Books on this shelf will be removed from your library."
  - [x] On confirm: calls DELETE `/api/shelves/[id]`
- [x] Integrate ShelfManager into library page (e.g., sidebar or settings modal)

### Library Page
- [x] Build library page (`src/app/(app)/library/page.tsx`)
- [x] Fetch user's shelves from `/api/shelves` and books from `/api/shelf`
- [x] Display header: "My Library" with total book count
- [x] Build shelf tab bar showing all shelves (default + custom) with book counts per shelf
- [x] Filter displayed books by active shelf tab
- [x] Render books as grid of BookCards with covers, titles, authors
- [x] Empty state per shelf ("No books here yet. Search for books to add.")
- [x] Include ShelfManager access (button/link to manage shelves)

### Wire Shelf Actions into Existing Pages
- [x] Book detail page: wire ShelfSelector (add/change/remove shelf)
  - [x] Check if book is already on a shelf on page load
  - [x] Show current shelf name if so
- [x] Search results: wire "+ Add to shelf" button using ShelfSelector
  - [x] Check which books are already on shelves (batch lookup)
  - [x] Show shelf status on already-added books

### Optimistic UI
- [x] Shelf changes update UI immediately before API confirms
- [x] Revert on error with toast/notification

## Testing Checklist
- [x] User can add a book to "Want to Read" from book detail page
- [x] User can add a book to a custom shelf from book detail page
- [x] User can add a book to a shelf from search results
- [x] User can change a book's shelf (e.g., "Want to Read" → "Currently Reading")
- [x] User can move a book to a custom shelf
- [x] User can remove a book from a shelf
- [x] Library page shows all shelf tabs (default + custom) with correct counts
- [x] Switching shelf tabs filters the book grid
- [x] Empty shelf shows appropriate empty state message
- [x] User can create a custom shelf with a custom name
- [x] User can rename a custom shelf
- [x] User can delete a custom shelf (with confirmation)
- [x] Default shelves cannot be deleted
- [x] Deleting a shelf removes its books from the library
- [x] Duplicate shelf name is handled gracefully
- [x] ShelfSelector dropdown shows all shelves (default + custom)
- [x] Book added by User A is not visible to User B (RLS works)
- [x] Duplicate add attempt is handled gracefully (not crash)
- [x] Shelf status is reflected on book detail page (shows current shelf name)
- [x] Shelf status is reflected on search results (shows "On shelf" vs "+ Add")
- [x] All shelf operations work in both light and dark mode
- [x] Library page is responsive on mobile

## Notes
- The `user_books` table UNIQUE constraint on `(user_id, google_book_id)` prevents duplicates at the DB level. The API should catch this and return a clear error.
- For shelf changes (moving between shelves), use PATCH on `shelfId` (not DELETE + INSERT) to preserve the original `added_at` timestamp and any rating.
- Default shelves are created per user on first visit to `/api/shelves` via `create_default_shelves()`. They have `is_default = true` and cannot be deleted.
- Custom shelves use `is_default = false`. The `slug` is auto-generated from the name for URL-safe identifiers.
- Deleting a custom shelf cascades to `user_books` via the FK constraint — books on that shelf are removed. The confirmation dialog must make this clear to the user.
- `BookShelfStatus` component wraps `ShelfSelector` for server component pages (book detail), handling the client-side fetch of current shelf status.
- `SearchResults` client component wraps search result cards, batch-fetching user's books to show shelf status on each result.
