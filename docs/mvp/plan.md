# BetterReads MVP — Technical Plan

**Status:** DRAFT — Awaiting Approval
**PRD:** `docs/mvp/prd.md` (APPROVED)
**Created:** 2026-02-08

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    Client                        │
│  Next.js App Router (React 19, TypeScript)       │
│  Tailwind CSS + Design Tokens                    │
│  @supabase/ssr (browser client)                  │
└──────────────┬───────────────┬──────────────────┘
               │               │
      Server Components    API Routes
      (read-only auth)    (mutations)
               │               │
┌──────────────┴───────────────┴──────────────────┐
│              Next.js Middleware                   │
│  @supabase/ssr (server client)                   │
│  Session refresh, auth guards                    │
└──────────────┬───────────────┬──────────────────┘
               │               │
┌──────────────┴───┐   ┌──────┴──────────────────┐
│   Supabase        │   │   External APIs          │
│   - Auth          │   │   - Google Books API     │
│   - Postgres DB   │   │   - Open Library API     │
│   - RLS Policies  │   │                          │
└──────────────────┘   └──────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering | Server Components by default, Client Components where interactive | Faster initial loads, SEO for landing page, progressive enhancement |
| Auth | Supabase Auth via `@supabase/ssr` | Bundled with DB, cookie-based sessions work with SSR, no extra service |
| DB Access | Supabase JS client with RLS | Row-level security enforces data isolation at DB level, not app level |
| Book Data | Server-side API routes proxy to Google Books / Open Library | Keeps API keys secure, allows response normalization, enables caching |
| State | Server state via Supabase, minimal client state via React hooks | No complex state library needed for MVP scope |
| Theming | CSS variables + Tailwind + `class` strategy for dark mode | `prefers-color-scheme` detection + manual toggle + localStorage persistence |
| Styling | Tailwind CSS v4 with design tokens in `globals.css` | Already installed, aligns with design vision tokens |

---

## 2. Data Model

### Supabase Tables

```sql
-- Users are managed by Supabase Auth (auth.users)
-- No custom users table needed for MVP

-- Shelves (user-defined, with 3 defaults created on signup)
CREATE TABLE shelves (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,                -- display name (e.g., "Currently Reading")
  slug          TEXT NOT NULL,                -- URL-safe identifier (e.g., "currently-reading")
  is_default    BOOLEAN DEFAULT FALSE,        -- true for the 3 built-in shelves (cannot be deleted)
  position      SMALLINT NOT NULL DEFAULT 0,  -- display order
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_shelves_user ON shelves(user_id, position);

-- User's book shelf entries
CREATE TABLE user_books (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shelf_id      UUID REFERENCES shelves(id) ON DELETE CASCADE NOT NULL,
  google_book_id TEXT NOT NULL,              -- Google Books volume ID
  rating        NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0 AND MOD(rating * 2, 1) = 0),  -- nullable, 0.5-5.0 in 0.5 steps
  cover_url     TEXT,                         -- cached cover image URL
  title         TEXT NOT NULL,                -- cached for display without API call
  author        TEXT,                         -- cached
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, google_book_id)             -- one entry per book per user
);

-- Index for fast shelf queries
CREATE INDEX idx_user_books_user_shelf ON user_books(user_id, shelf_id);
CREATE INDEX idx_user_books_user_rating ON user_books(user_id, rating) WHERE rating IS NOT NULL;

-- Row Level Security: shelves
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shelves"
  ON shelves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shelves"
  ON shelves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shelves"
  ON shelves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shelves"
  ON shelves FOR DELETE USING (auth.uid() = user_id);

-- Row Level Security: user_books
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own books"
  ON user_books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own books"
  ON user_books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own books"
  ON user_books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books"
  ON user_books FOR DELETE USING (auth.uid() = user_id);

-- Function to create default shelves for new users (called via trigger or on first login)
CREATE OR REPLACE FUNCTION create_default_shelves(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO shelves (user_id, name, slug, is_default, position) VALUES
    (p_user_id, 'Currently Reading', 'currently-reading', TRUE, 0),
    (p_user_id, 'Want to Read', 'want-to-read', TRUE, 1),
    (p_user_id, 'Read', 'read', TRUE, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Design Notes:**
- **Two tables:** `shelves` (user's shelf definitions) and `user_books` (books on shelves). This supports custom shelf names.
- 3 default shelves are created per user on signup. Default shelves have `is_default = TRUE` and cannot be deleted by the user.
- `shelf_id` is a foreign key to `shelves.id`, replacing the old text `shelf` column.
- We cache `title`, `author`, and `cover_url` on the `user_books` row to avoid re-fetching from Google Books every time we render a shelf.
- `google_book_id` is the canonical ID. If we later add Open Library fallback, we can add an `open_library_id` column.
- The `UNIQUE(user_id, google_book_id)` constraint prevents a book appearing on multiple shelves. Moving a book between shelves is an UPDATE on `shelf_id`.
- **Rating** is `NUMERIC(2,1)` — supports half-stars: 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0. Nullable — a book can be on a shelf without a rating.

### TypeScript Types

```typescript
// src/types/book.ts

interface Book {
  googleBookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  pageCount: number | null;
  publishedDate: string | null;
  genre: string | null;
  isbn: string | null;
}

interface Shelf {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  position: number;
}

interface UserBook {
  id: string;
  googleBookId: string;
  shelfId: string;
  shelf?: Shelf;            // joined shelf data
  rating: number | null;    // 0.5-5.0 in 0.5 steps
  coverUrl: string | null;
  title: string;
  author: string | null;
  addedAt: string;
  updatedAt: string;
}

// Valid rating values
type Rating = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
```

---

## 3. API Design

### Internal API Routes (`src/app/api/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/books/search?q=` | GET | Proxy to Google Books + Open Library, returns normalized results |
| `/api/books/[id]` | GET | Fetch single book detail by Google Books volume ID |
| `/api/shelves` | GET | Get current user's shelves (ordered by position) |
| `/api/shelves` | POST | Create a custom shelf `{ name }` |
| `/api/shelves/[id]` | PATCH | Rename a shelf `{ name }` |
| `/api/shelves/[id]` | DELETE | Delete a custom shelf (fails if `is_default`) |
| `/api/shelf` | GET | Get current user's books (optionally filtered by `?shelfId=`) |
| `/api/shelf` | POST | Add a book to a shelf `{ googleBookId, shelfId, title, author, coverUrl }` |
| `/api/shelf/[id]` | PATCH | Update shelf or rating `{ shelfId?, rating? }` |
| `/api/shelf/[id]` | DELETE | Remove a book from shelves |
| `/api/recommendations` | GET | Get recommendations for current user (placeholder logic for MVP) |

### External API Usage

**Google Books API:**
- Endpoint: `https://www.googleapis.com/books/v1/volumes?q={query}&key={API_KEY}`
- Used for: search, book detail, cover images
- Rate limit: 1,000 requests/day (free tier)
- Requires: API key stored in `GOOGLE_BOOKS_API_KEY` env var

**Open Library API:**
- Endpoint: `https://openlibrary.org/search.json?q={query}`
- Used for: supplemental search results, cover images as fallback
- Rate limit: None (but be respectful)
- Requires: No API key
- Cover images: `https://covers.openlibrary.org/b/id/{cover_id}-L.jpg`

### Normalization

Both APIs return different shapes. The `/api/books/search` route normalizes both into our `Book` interface before returning to the client. Google Books is primary; Open Library fills gaps (e.g., missing covers).

---

## 4. Component Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, theme provider, metadata
│   ├── page.tsx                # Landing page (public)
│   ├── login/page.tsx          # Login form
│   ├── signup/page.tsx         # Signup form
│   ├── library/page.tsx        # My shelves (protected)
│   ├── search/page.tsx         # Search results (protected)
│   ├── book/[id]/page.tsx      # Book detail (protected)
│   ├── discover/page.tsx       # Recommendations (protected)
│   ├── api/
│   │   ├── books/
│   │   │   ├── search/route.ts
│   │   │   └── [id]/route.ts
│   │   ├── shelf/
│   │   │   ├── route.ts        # GET all, POST new
│   │   │   └── [id]/route.ts   # PATCH, DELETE
│   │   └── recommendations/
│   │       └── route.ts
│   └── globals.css             # Design tokens, Tailwind config
├── components/
│   ├── Navbar.tsx              # App navigation bar
│   ├── BookCard.tsx            # Book cover card (grid item)
│   ├── BookCover.tsx           # Cover image with fallback placeholder
│   ├── StarRating.tsx          # Interactive half-star rating (0.5-5.0)
│   ├── ShelfSelector.tsx       # Dropdown to pick/change shelf (includes custom shelves)
│   ├── ShelfManager.tsx        # Create, rename, delete custom shelves
│   ├── SearchBar.tsx           # Search input component
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   └── AuthForm.tsx            # Shared login/signup form logic
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (createBrowserClient)
│   │   ├── server.ts           # Server client (createServerClient)
│   │   └── middleware.ts       # Middleware client factory
│   ├── google-books.ts         # Google Books API client
│   ├── open-library.ts         # Open Library API client
│   └── normalize-book.ts       # Normalize API responses → Book type
├── types/
│   └── book.ts                 # Shared TypeScript types
└── middleware.ts                # Next.js middleware (auth guard + session refresh)
```

---

## 5. Authentication Flow

```
User visits /library (protected route)
  → Next.js middleware intercepts
  → Creates Supabase server client, calls getUser()
  → No session? Redirect to /login
  → Has session? Refresh token in cookies, continue to page

User submits login form
  → Client-side Supabase client calls signInWithPassword()
  → Supabase sets auth cookies
  → Redirect to /library

User submits signup form
  → Client-side Supabase client calls signUp()
  → Supabase sends confirmation email (if enabled) or auto-confirms
  → Redirect to /library

User clicks logout
  → Client-side Supabase client calls signOut()
  → Cookies cleared, redirect to /
```

**Protected Routes:** `/library`, `/search`, `/book/[id]`, `/discover`
**Public Routes:** `/`, `/login`, `/signup`

---

## 6. Theme System

```
1. On first visit:
   → Check localStorage for saved preference
   → If none, check prefers-color-scheme media query
   → Apply 'dark' class to <html> if dark mode

2. CSS variables:
   → Light tokens in :root
   → Dark tokens in .dark (overrides :root)
   → All components use var(--token-name) — auto-adapts

3. Toggle:
   → ThemeToggle component in Navbar
   → On click: toggle .dark class on <html>, save to localStorage
   → next-themes library handles SSR flash prevention
```

**Package:** `next-themes` (prevents flash of wrong theme on SSR, handles localStorage, media query detection)

---

## 7. Recommendations (MVP Approach)

For MVP, the recommendation engine is a **simple heuristic**, not ML:

1. **"Because you liked X"** — Pick books from the user's highest-rated `read` shelf. Search Google Books for similar titles/authors. Group results by the source book.
2. **"Top in [Genre]"** — Extract genres from the user's shelf. Query Google Books for top books in those genres, excluding books already on shelves.
3. **Fallback** — If the user has no rated books, show editorially curated "popular picks."

This is intentionally simple. The data model and UI are built to support a real recommendation engine later.

---

## 8. Dependencies to Add

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Supabase client |
| `@supabase/ssr` | SSR-compatible auth (cookie handling) |
| `next-themes` | Dark mode with SSR (no flash) |

No other dependencies needed. The project already has Next.js 16, React 19, Tailwind CSS 4, TypeScript 5, and ESLint.

---

## 9. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
```

`NEXT_PUBLIC_` prefixed vars are exposed to the browser (required for Supabase client). `GOOGLE_BOOKS_API_KEY` stays server-only.

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Books API rate limit (1k/day free) | Search breaks at scale | Cache responses, use Open Library as fallback, apply for higher quota |
| Cover images missing from API | Broken UI | BookCover component with gradient placeholder fallback |
| Supabase free tier limits | DB or auth limits hit | Generous for MVP scale (50k monthly active users, 500MB DB) |
| Dark mode flash on SSR | Brief wrong-theme flicker | `next-themes` injects script in `<head>` to prevent |
| Slow external API calls | Sluggish search | Server-side caching, loading skeletons, debounced input |

---

## 11. Phases

The implementation is broken into 6 sequential phases. Each phase is independently testable and builds on the previous one. See `docs/mvp/tasks/` for detailed task breakdowns.

| Phase | Name | Description |
|-------|------|-------------|
| 1 | **Foundation** | Design system, theme, layout, Supabase setup, env config |
| 2 | **Auth** | Sign up, log in, log out, middleware guards, protected routes |
| 3 | **Book Search & Detail** | Google Books + Open Library integration, search page, book detail page |
| 4 | **Shelves** | Add/move/remove books, library page, shelf tabs, book grid |
| 5 | **Ratings & Recommendations** | Star rating component, rating persistence, discover page, recommendation logic |
| 6 | **Polish & QA** | Responsive, animations, loading states, error handling, final testing |
