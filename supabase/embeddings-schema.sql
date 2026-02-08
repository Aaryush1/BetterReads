-- Smart Recommendations — Embeddings Schema
-- Run this in the Supabase SQL Editor AFTER schema.sql

-- ============================================
-- ENABLE PGVECTOR EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============================================
-- BOOK EMBEDDINGS TABLE
-- ============================================
CREATE TABLE book_embeddings (
  google_book_id  TEXT PRIMARY KEY,
  embedding       extensions.vector(1536) NOT NULL,
  title           TEXT NOT NULL,
  author          TEXT,
  genre           TEXT,
  description     TEXT,
  cover_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for cosine similarity (better recall than IVFFlat, no training step)
CREATE INDEX idx_book_embeddings_hnsw
  ON book_embeddings
  USING hnsw (embedding extensions.vector_cosine_ops);

-- ============================================
-- MATCH BOOKS FUNCTION (nearest-neighbor search)
-- ============================================
CREATE OR REPLACE FUNCTION match_books(
  query_embedding extensions.vector(1536),
  exclude_ids TEXT[],
  match_count INT DEFAULT 30
)
RETURNS TABLE (
  google_book_id TEXT,
  title TEXT,
  author TEXT,
  genre TEXT,
  description TEXT,
  cover_url TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    b.google_book_id,
    b.title,
    b.author,
    b.genre,
    b.description,
    b.cover_url,
    1 - (b.embedding <=> query_embedding) AS similarity
  FROM book_embeddings b
  WHERE b.google_book_id != ALL(exclude_ids)
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================
-- ROW LEVEL SECURITY — BOOK EMBEDDINGS
-- ============================================
ALTER TABLE book_embeddings ENABLE ROW LEVEL SECURITY;

-- Shared catalog: all authenticated users can read
CREATE POLICY "Authenticated users can read embeddings"
  ON book_embeddings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Writes happen via service role client (bypasses RLS)
