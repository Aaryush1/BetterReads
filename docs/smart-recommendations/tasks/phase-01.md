# Phase 1: Infrastructure

## Status: COMPLETE

## Overview
Set up pgvector in Supabase, create the embedding service, and wire up environment variables. After this phase, we can generate and store embeddings programmatically.

## Tasks

### Database Setup
- [x] Enable pgvector extension in Supabase SQL Editor
- [x] Create `book_embeddings` table with `vector(1536)` column
- [x] Create HNSW index on embedding column for cosine similarity
- [x] Create `match_books` Postgres function for nearest-neighbor search
- [x] Add RLS policy (authenticated read, service-role write)
- [x] Save migration SQL to `supabase/embeddings-schema.sql`

### Embedding Service
- [x] Install `openai` npm package
- [x] Create `src/lib/embeddings.ts` with:
  - [x] `generateEmbedding(text)` — calls OpenAI `text-embedding-3-small`
  - [x] `buildBookText(book)` — concatenates title + author + genre + description
  - [x] `embedBook(googleBookId, bookMeta)` — check-then-embed-then-upsert
  - [x] `embedBooks(books[])` — batch version with chunking

### Admin Supabase Client
- [x] Create `src/lib/supabase/admin.ts` — service-role client for embedding writes
- [x] Uses `SUPABASE_SERVICE_ROLE_KEY` env var (server-side only)

### Environment Variables
- [x] Add `OPENAI_API_KEY` to `.env.local.example`
- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local.example`
- [x] Verify both keys are set in `.env.local`

## Testing Checklist
- [x] `book_embeddings` table exists in Supabase with correct schema
- [x] HNSW index exists on the embedding column
- [x] `match_books` function can be called via `supabase.rpc()`
- [x] `generateEmbedding("test text")` returns a 1536-dimensional array
- [x] `embedBook()` successfully inserts a row into `book_embeddings`
- [x] Duplicate `embedBook()` call for same ID is a no-op (upsert)
- [x] `npm run build` passes with no TypeScript errors

## Notes
- pgvector is available on Supabase free tier
- HNSW chosen over IVFFlat: no training step, better recall, handles incremental inserts
- The `openai` package is the only new dependency
- Service role key must NEVER appear in `NEXT_PUBLIC_*` variables
