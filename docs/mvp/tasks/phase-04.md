# Phase 4: Shelves

## Status: NOT STARTED

## Overview
Users can add books to shelves, manage custom shelves, view their library, and move/remove books. After this phase, the core book-tracking workflow is fully functional — including creating, renaming, and deleting custom shelves.

## Tasks

### Shelves API Routes
- [ ] Build `/api/shelves/route.ts` (GET):
  - [ ] Get current user from Supabase session
  - [ ] Query `shelves` table ordered by `position`
  - [ ] Return `Shelf[]`
- [ ] Build `/api/shelves/route.ts` (POST):
  - [ ] Accept `{ name }`
  - [ ] Generate `slug` from name (lowercase, hyphenated)
  - [ ] Set `is_default = false`, assign next `position`
  - [ ] Insert into `shelves` with `user_id` from session
  - [ ] Handle duplicate slug — return appropriate error
  - [ ] Return created `Shelf`
- [ ] Build `/api/shelves/[id]/route.ts` (PATCH):
  - [ ] Accept `{ name }`
  - [ ] Regenerate `slug` from new name
  - [ ] Prevent renaming if `is_default = true` (optional — or allow rename of defaults)
  - [ ] Return updated `Shelf`
- [ ] Build `/api/shelves/[id]/route.ts` (DELETE):
  - [ ] Check `is_default` — reject deletion of default shelves with error message
  - [ ] Delete shelf (cascades to `user_books` on that shelf via FK)
  - [ ] Return success

### User Books API Routes
- [ ] Build `/api/shelf/route.ts` (GET):
  - [ ] Get current user from Supabase session
  - [ ] Query `user_books` table (optionally filter by `?shelfId=`)
  - [ ] Join with `shelves` to include shelf name/slug
  - [ ] Return `UserBook[]`
- [ ] Build `/api/shelf/route.ts` (POST):
  - [ ] Accept `{ googleBookId, shelfId, title, author, coverUrl }`
  - [ ] Insert into `user_books` with `user_id` from session
  - [ ] Handle duplicate (book already on a shelf) — return appropriate error
  - [ ] Return created `UserBook`
- [ ] Build `/api/shelf/[id]/route.ts` (PATCH):
  - [ ] Accept `{ shelfId?, rating? }` (partial update)
  - [ ] Update `user_books` row, set `updated_at`
  - [ ] Return updated `UserBook`
- [ ] Build `/api/shelf/[id]/route.ts` (DELETE):
  - [ ] Delete `user_books` row
  - [ ] Return success

### ShelfSelector Component
- [ ] Build ShelfSelector component (`src/components/ShelfSelector.tsx`)
- [ ] Fetch user's shelves from `/api/shelves` (default + custom)
- [ ] Display all shelves in dropdown — defaults first, then custom shelves separated by divider
- [ ] States: "Add to shelf" (no shelf assigned), "[Shelf Name]" (on shelf, with change/remove options)
- [ ] On select: calls POST (add) or PATCH (change shelf) API
- [ ] Include "Remove from shelf" option that calls DELETE

### ShelfManager Component
- [ ] Build ShelfManager component (`src/components/ShelfManager.tsx`)
- [ ] Display list of all shelves with book counts
- [ ] Default shelves shown with lock icon (cannot be deleted)
- [ ] Custom shelves have rename and delete actions
- [ ] "Create new shelf" input with add button
  - [ ] Validate: non-empty name, no duplicate names
  - [ ] On submit: calls POST `/api/shelves`
- [ ] Rename inline edit:
  - [ ] Click shelf name to enter edit mode
  - [ ] On confirm: calls PATCH `/api/shelves/[id]`
- [ ] Delete with confirmation:
  - [ ] Show confirmation dialog: "Delete '[name]'? Books on this shelf will be removed from your library."
  - [ ] On confirm: calls DELETE `/api/shelves/[id]`
- [ ] Integrate ShelfManager into library page (e.g., sidebar or settings modal)

### Library Page
- [ ] Build library page (`src/app/(app)/library/page.tsx`)
- [ ] Fetch user's shelves from `/api/shelves` and books from `/api/shelf`
- [ ] Display header: "My Library" with total book count
- [ ] Build shelf tab bar showing all shelves (default + custom) with book counts per shelf
- [ ] Filter displayed books by active shelf tab
- [ ] Render books as grid of BookCards with covers, titles, authors
- [ ] Empty state per shelf ("No books here yet. Search for books to add.")
- [ ] Include ShelfManager access (button/link to manage shelves)

### Wire Shelf Actions into Existing Pages
- [ ] Book detail page: wire ShelfSelector (add/change/remove shelf)
  - [ ] Check if book is already on a shelf on page load
  - [ ] Show current shelf name if so
- [ ] Search results: wire "+ Add to shelf" button using ShelfSelector
  - [ ] Check which books are already on shelves (batch lookup)
  - [ ] Show shelf status on already-added books

### Optimistic UI
- [ ] Shelf changes update UI immediately before API confirms
- [ ] Revert on error with toast/notification

## Testing Checklist
- [ ] User can add a book to "Want to Read" from book detail page
- [ ] User can add a book to a custom shelf from book detail page
- [ ] User can add a book to a shelf from search results
- [ ] User can change a book's shelf (e.g., "Want to Read" → "Currently Reading")
- [ ] User can move a book to a custom shelf
- [ ] User can remove a book from a shelf
- [ ] Library page shows all shelf tabs (default + custom) with correct counts
- [ ] Switching shelf tabs filters the book grid
- [ ] Empty shelf shows appropriate empty state message
- [ ] User can create a custom shelf with a custom name
- [ ] User can rename a custom shelf
- [ ] User can delete a custom shelf (with confirmation)
- [ ] Default shelves cannot be deleted
- [ ] Deleting a shelf removes its books from the library
- [ ] Duplicate shelf name is handled gracefully
- [ ] ShelfSelector dropdown shows all shelves (default + custom)
- [ ] Book added by User A is not visible to User B (RLS works)
- [ ] Duplicate add attempt is handled gracefully (not crash)
- [ ] Shelf status is reflected on book detail page (shows current shelf name)
- [ ] Shelf status is reflected on search results (shows "On shelf" vs "+ Add")
- [ ] All shelf operations work in both light and dark mode
- [ ] Library page is responsive on mobile

## Notes
- The `user_books` table UNIQUE constraint on `(user_id, google_book_id)` prevents duplicates at the DB level. The API should catch this and return a clear error.
- For shelf changes (moving between shelves), use PATCH on `shelfId` (not DELETE + INSERT) to preserve the original `added_at` timestamp and any rating.
- Default shelves are created per user in Phase 1 via `create_default_shelves()`. They have `is_default = true` and cannot be deleted.
- Custom shelves use `is_default = false`. The `slug` is auto-generated from the name for URL-safe identifiers.
- Deleting a custom shelf cascades to `user_books` via the FK constraint — books on that shelf are removed. The confirmation dialog must make this clear to the user.
