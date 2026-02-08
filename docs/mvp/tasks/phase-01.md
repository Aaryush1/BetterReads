# Phase 1: Foundation

## Status: IN PROGRESS

## Overview
Set up the design system, theme infrastructure, app layout, and Supabase project. After this phase, the app shell renders with correct fonts, colors, dark mode, and navigation — but no functionality yet.

## Tasks

### Design System & Theming
- [x] Install `next-themes` package
- [x] Configure Tailwind CSS v4 with design tokens in `globals.css` (all CSS variables from design vision — light and dark)
- [x] Load Fraunces and Bricolage Grotesque fonts via `next/font/google`
- [x] Implement ThemeToggle component (light/dark/system)
- [x] Wire `next-themes` ThemeProvider into root layout with `class` strategy
- [ ] Verify dark mode toggles all tokens correctly

### App Shell & Layout
- [x] Update root `layout.tsx` with fonts, metadata ("BetterReads"), ThemeProvider
- [x] Build Navbar component (logo, nav tabs: My Library / Discover, search bar placeholder, avatar, theme toggle)
- [x] Create authenticated layout wrapper (`src/app/(app)/layout.tsx`) that includes Navbar
- [x] Create public layout wrapper for landing/auth pages (no navbar)

### Supabase Setup
- [ ] Create Supabase project (via dashboard)
- [ ] Add environment variables to `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [x] Add `.env.local` to `.gitignore`
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`
- [x] Create Supabase client utilities:
  - [x] `src/lib/supabase/client.ts` — browser client (`createBrowserClient`)
  - [x] `src/lib/supabase/server.ts` — server client (`createServerClient`)
  - [x] `src/lib/supabase/middleware.ts` — middleware client factory
- [ ] Run database schema SQL:
  - [x] Create `shelves` table (id, user_id, name, slug, is_default, position) — SQL in `supabase/schema.sql`
  - [x] Create `user_books` table (id, user_id, shelf_id, google_book_id, rating as NUMERIC(2,1), cached fields) — SQL in `supabase/schema.sql`
  - [x] Create indexes and RLS policies for both tables — SQL in `supabase/schema.sql`
  - [x] Create `create_default_shelves()` function for new user setup — SQL in `supabase/schema.sql`

### Landing Page
- [x] Build landing page (`src/app/page.tsx`) matching design vision: hero, book cover collage, feature strip, CTA buttons
- [ ] Ensure landing page works in both light and dark mode

### Shared Components
- [x] Build BookCover component (image with 2:3 aspect ratio, gradient placeholder fallback, book shadow)
- [x] Create TypeScript types (`src/types/book.ts`)

## Testing Checklist
- [x] `npm run build` succeeds without errors
- [x] `npm run lint` passes without errors
- [ ] `npm run dev` starts without errors
- [ ] Landing page renders with correct fonts (Fraunces headings, Bricolage body)
- [ ] Light/dark mode toggle works and persists across page reload
- [ ] Dark mode auto-detects browser preference on first visit
- [ ] Navbar renders with correct layout
- [ ] Supabase client connects (check browser console for no errors)
- [ ] BookCover renders placeholder gradient when no image provided
- [ ] All pages responsive on mobile viewport

## Notes
- The Navbar search bar and nav links won't be functional yet — they link to pages built in later phases
- Protected route guards are set up in Phase 2
- Database schema SQL is in `supabase/schema.sql` — must be run in Supabase SQL Editor after project creation
- Native binary packages (`@tailwindcss/oxide-win32-x64-msvc`, `lightningcss-win32-x64-msvc`) added as direct dependencies to work around npm optional dependency bug
- Migrated to Next.js 16 `proxy.ts` convention (renamed from `middleware.ts`, function exported as `proxy` instead of `middleware`)
