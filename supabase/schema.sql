-- BetterReads MVP Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- SHELVES TABLE
-- ============================================
CREATE TABLE shelves (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  is_default    BOOLEAN DEFAULT FALSE,
  position      SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_shelves_user ON shelves(user_id, position);

-- ============================================
-- USER BOOKS TABLE
-- ============================================
CREATE TABLE user_books (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shelf_id      UUID REFERENCES shelves(id) ON DELETE CASCADE NOT NULL,
  google_book_id TEXT NOT NULL,
  rating        NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0 AND MOD(rating * 2, 1) = 0),
  cover_url     TEXT,
  title         TEXT NOT NULL,
  author        TEXT,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, google_book_id)
);

CREATE INDEX idx_user_books_user_shelf ON user_books(user_id, shelf_id);
CREATE INDEX idx_user_books_user_rating ON user_books(user_id, rating) WHERE rating IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY — SHELVES
-- ============================================
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shelves"
  ON shelves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shelves"
  ON shelves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shelves"
  ON shelves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shelves"
  ON shelves FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ROW LEVEL SECURITY — USER BOOKS
-- ============================================
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own books"
  ON user_books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own books"
  ON user_books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own books"
  ON user_books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books"
  ON user_books FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT SHELVES FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION create_default_shelves(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO shelves (user_id, name, slug, is_default, position) VALUES
    (p_user_id, 'Currently Reading', 'currently-reading', TRUE, 0),
    (p_user_id, 'Want to Read', 'want-to-read', TRUE, 1),
    (p_user_id, 'Read', 'read', TRUE, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
