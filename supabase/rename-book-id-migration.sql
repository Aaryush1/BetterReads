-- Migration: Rename google_book_id → book_id in book_embeddings
-- Run this in the Supabase SQL Editor

-- 2. Drop old function (return type changed, so CREATE OR REPLACE won't work)
DROP FUNCTION IF EXISTS match_books(extensions.vector, TEXT[], INT);

-- 3. Recreate with new column name
CREATE OR REPLACE FUNCTION match_books(
  query_embedding extensions.vector(1536),
  exclude_ids TEXT[],
  match_count INT DEFAULT 30
)
RETURNS TABLE (
  book_id TEXT,
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
    b.book_id,
    b.title,
    b.author,
    b.genre,
    b.description,
    b.cover_url,
    1 - (b.embedding <=> query_embedding) AS similarity
  FROM book_embeddings b
  WHERE b.book_id != ALL(exclude_ids)
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
$$;
