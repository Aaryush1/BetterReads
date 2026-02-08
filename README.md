# BetterReads

A modern Goodreads alternative for avid readers. Fast, beautiful, and focused on the core reading experience.

## Vision

Goodreads hasn't meaningfully evolved in over a decade. BetterReads is what a book tracking platform looks like when built today — clean design inspired by apps like Literal and StoryGraph, instant interactions, and a focus on what readers actually need.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS v4
- **Auth + Database:** Supabase (Postgres + Auth)
- **Book Data:** Google Books API + Open Library API
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google Books API key](https://developers.google.com/books/docs/v1/using#APIKey) (free tier: 1,000 requests/day)

### 1. Clone & install

```bash
git clone <repo-url>
cd BetterReads
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql` to create all tables, RLS policies, and functions
3. Copy your project URL and anon key from **Settings > API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

- **Book Search** — Search millions of books via Google Books + Open Library, with instant search-as-you-type suggestions
- **Smart Shelves** — Default shelves (Want to Read, Currently Reading, Read) + unlimited custom shelves
- **Star Ratings** — Half-star precision ratings with keyboard-accessible slider
- **Discover** — Personalized recommendations based on your highest-rated books
- **Dark Mode** — Full light/dark/system theme support
- **Responsive** — Mobile-first design with hamburger nav, stacked layouts, and touch-friendly interactions

## Project Structure

```
src/
├── app/            # Next.js App Router pages & API routes
│   ├── (app)/      # Authenticated pages (with Navbar)
│   ├── (public)/   # Landing, login, signup (no Navbar)
│   └── api/        # REST API routes
├── components/     # Reusable UI components
├── lib/            # Utilities, API clients, helpers
│   └── supabase/   # Supabase client factories (browser, server, middleware)
└── types/          # TypeScript type definitions

docs/               # PRDs, plans, and task tracking for all features
supabase/           # Database schema SQL
```

## Development Process

All features follow a structured workflow documented in `CLAUDE.md`:

1. **PRD** — Define the problem, goals, user stories, and acceptance criteria
2. **Technical Plan** — Architecture decisions, data model, component breakdown
3. **Phased Tasks** — Sequential implementation phases, each with a testing checklist
