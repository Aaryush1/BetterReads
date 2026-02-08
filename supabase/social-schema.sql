-- BetterReads Social Features - Database Schema
-- Phase 1: Profiles & Follow System
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  favorite_genres TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$'),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- USER FAVORITES TABLE
-- ============================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id TEXT NOT NULL, -- Google Books ID
  book_data JSONB NOT NULL, -- Cached book info: {title, authors, cover_url, etc.}
  order_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, book_id)
);

-- Indexes for user_favorites
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id, order_position);

-- ============================================
-- READING GOALS TABLE
-- ============================================
CREATE TABLE reading_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  target_books INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, year),
  CONSTRAINT target_books_positive CHECK (target_books > 0),
  CONSTRAINT year_valid CHECK (year >= 2020 AND year <= 2100)
);

-- Indexes for reading_goals
CREATE INDEX idx_reading_goals_user_year ON reading_goals(user_id, year);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for follows (for fast follower/following count queries)
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
-- Create notification type enum
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment', 'mention');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID, -- ID of related entity (follow_id, review_id, etc.)
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT no_self_notify CHECK (user_id != actor_id)
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- ============================================
-- ROW LEVEL SECURITY — PROFILES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- ROW LEVEL SECURITY — USER FAVORITES
-- ============================================
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favorites are publicly readable"
  ON user_favorites FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own favorites"
  ON user_favorites FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- ROW LEVEL SECURITY — READING GOALS
-- ============================================
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reading goals are publicly readable"
  ON reading_goals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reading goals"
  ON reading_goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reading goals"
  ON reading_goals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reading goals"
  ON reading_goals FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- ROW LEVEL SECURITY — FOLLOWS
-- ============================================
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly readable"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (follower_id = auth.uid());

-- ============================================
-- ROW LEVEL SECURITY — NOTIFICATIONS
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when a user is followed
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, actor_id, entity_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to remove notification when unfollowed
CREATE OR REPLACE FUNCTION remove_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE type = 'follow' AND entity_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create notification when follow is created
CREATE TRIGGER create_follow_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Trigger to remove notification when follow is deleted
CREATE TRIGGER remove_follow_notification_trigger
  AFTER DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION remove_follow_notification();

-- ============================================
-- REALTIME SETUP
-- ============================================
-- IMPORTANT: After running this schema, you must enable Realtime for the notifications table:
-- 1. Go to Supabase Dashboard → Database → Replication
-- 2. Find the "notifications" table
-- 3. Toggle "Enable Realtime" to ON
-- 4. This allows clients to subscribe to real-time notification events
