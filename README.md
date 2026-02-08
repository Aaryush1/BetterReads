# BetterReads

A modern Goodreads alternative for avid readers. Fast, beautiful, and focused on the core reading experience.

## Vision

Goodreads hasn't meaningfully evolved in over a decade. BetterReads is what a book tracking platform looks like when built today — clean design inspired by apps like Literal and StoryGraph, instant interactions, and a focus on what readers actually need.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Auth + Database:** Supabase (Postgres + Auth)
- **Book Data:** Google Books API + Open Library API
- **Hosting:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components
├── lib/          # Utilities, API clients, helpers
└── types/        # TypeScript type definitions

docs/             # PRDs, plans, and task tracking for all features
```

## Development Process

All features follow a structured workflow documented in `CLAUDE.md`:

1. **PRD** — Define the problem, goals, user stories, and acceptance criteria
2. **Technical Plan** — Architecture decisions, data model, component breakdown
3. **Phased Tasks** — Sequential implementation phases, each with a testing checklist
