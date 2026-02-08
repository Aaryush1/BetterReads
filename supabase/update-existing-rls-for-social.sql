-- Update Existing RLS Policies for Social Features
-- This updates the shelves and user_books tables to allow public READ access
-- so that user profiles can display books and shelves publicly
-- Run this AFTER running social-schema.sql

-- ============================================
-- UPDATE SHELVES RLS POLICIES
-- ============================================
-- Drop the existing private SELECT policy
DROP POLICY IF EXISTS "Users can view their own shelves" ON shelves;

-- Create new public READ policy
CREATE POLICY "Shelves are publicly readable"
  ON shelves FOR SELECT
  USING (true);

-- Keep the existing write policies (users can only modify their own shelves)
-- These policies already exist and don't need to change:
-- - "Users can insert their own shelves"
-- - "Users can update their own shelves"
-- - "Users can delete their own shelves"

-- ============================================
-- UPDATE USER_BOOKS RLS POLICIES
-- ============================================
-- Drop the existing private SELECT policy
DROP POLICY IF EXISTS "Users can view their own books" ON user_books;

-- Create new public READ policy
CREATE POLICY "User books are publicly readable"
  ON user_books FOR SELECT
  USING (true);

-- Keep the existing write policies (users can only modify their own books)
-- These policies already exist and don't need to change:
-- - "Users can insert their own books"
-- - "Users can update their own books"
-- - "Users can delete their own books"

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, you can verify the policies with:
-- SELECT * FROM pg_policies WHERE tablename IN ('shelves', 'user_books');
