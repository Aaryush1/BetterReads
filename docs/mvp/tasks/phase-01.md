# Phase 1: Foundation

## Status: NOT STARTED

## Overview
Set up the design system, theme infrastructure, app layout, and Supabase project. After this phase, the app shell renders with correct fonts, colors, dark mode, and navigation — but no functionality yet.

## Tasks

### Design System & Theming
- [ ] Install `next-themes` package
- [ ] Configure Tailwind CSS v4 with design tokens in `globals.css` (all CSS variables from design vision — light and dark)
- [ ] Load Fraunces and Bricolage Grotesque fonts via `next/font/google`
- [ ] Implement ThemeToggle component (light/dark/system)
- [ ] Wire `next-themes` ThemeProvider into root layout with `class` strategy
- [ ] Verify dark mode toggles all tokens correctly

### App Shell & Layout
- [ ] Update root `layout.tsx` with fonts, metadata ("BetterReads"), ThemeProvider
- [ ] Build Navbar component (logo, nav tabs: My Library / Discover, search bar placeholder, avatar, theme toggle)
- [ ] Create authenticated layout wrapper (`src/app/(app)/layout.tsx`) that includes Navbar
- [ ] Create public layout wrapper for landing/auth pages (no navbar)

### Supabase Setup
- [ ] Create Supabase project (via dashboard)
- [ ] Add environment variables to `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Add `.env.local` to `.gitignore`
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] Create Supabase client utilities:
  - [ ] `src/lib/supabase/client.ts` — browser client (`createBrowserClient`)
  - [ ] `src/lib/supabase/server.ts` — server client (`createServerClient`)
  - [ ] `src/lib/supabase/middleware.ts` — middleware client factory
- [ ] Run database schema SQL:
  - [ ] Create `shelves` table (id, user_id, name, slug, is_default, position)
  - [ ] Create `user_books` table (id, user_id, shelf_id, google_book_id, rating as NUMERIC(2,1), cached fields)
  - [ ] Create indexes and RLS policies for both tables
  - [ ] Create `create_default_shelves()` function for new user setup

### Landing Page
- [ ] Build landing page (`src/app/page.tsx`) matching design vision: hero, book cover collage, feature strip, CTA buttons
- [ ] Ensure landing page works in both light and dark mode

### Shared Components
- [ ] Build BookCover component (image with 2:3 aspect ratio, gradient placeholder fallback, book shadow)
- [ ] Create TypeScript types (`src/types/book.ts`)

## Testing Checklist
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
