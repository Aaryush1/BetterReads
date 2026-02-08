# Phase 1: Database Foundation

## Status: COMPLETE ✅

## Tasks

### Database Schema & Migration
- [x] Create migration file `supabase/migrations/YYYYMMDDHHMMSS_social_phase_1.sql`
- [x] Add `profiles` table with columns: id, user_id, username, display_name, bio, location, avatar_url, favorite_genres (TEXT[]), created_at, updated_at
- [x] Add constraints: username_format CHECK, bio_length CHECK, unique username, unique user_id
- [x] Add `user_favorites` table: id, user_id, book_id, book_data (JSONB), order_position, created_at
- [x] Add `reading_goals` table: id, user_id, year, target_books, created_at
- [x] Add constraint: unique(user_id, year)
- [x] Add `follows` table: id, follower_id, following_id, created_at
- [x] Add constraints: unique(follower_id, following_id), no_self_follow CHECK
- [x] Create `notification_type` ENUM ('follow', 'like', 'comment', 'mention')
- [x] Add `notifications` table: id, user_id, type, actor_id, entity_id, read (BOOLEAN), created_at
- [x] Add constraint: no_self_notify CHECK
- [x] Create indexes on all foreign keys and frequently queried columns
- [x] Run migration in Supabase SQL Editor
- [x] Verify all tables, constraints, and indexes created successfully

### RLS Policies
- [x] Enable RLS on `profiles` table
- [x] Create policy: "Profiles are publicly readable" (SELECT for all)
- [x] Create policy: "Users can create their own profile" (INSERT where user_id = auth.uid())
- [x] Create policy: "Users can update their own profile" (UPDATE where user_id = auth.uid())
- [x] Create policy: "Users can delete their own profile" (DELETE where user_id = auth.uid())
- [x] Enable RLS on `user_favorites` table with public read, owner-only write policies
- [x] Enable RLS on `reading_goals` table with public read, owner-only write policies
- [x] Enable RLS on `follows` table
- [x] Create policy: "Follows are publicly readable" (SELECT for all)
- [x] Create policy: "Users can follow others" (INSERT where follower_id = auth.uid())
- [x] Create policy: "Users can unfollow" (DELETE where follower_id = auth.uid())
- [x] Enable RLS on `notifications` table
- [x] Create policy: "Users can read their own notifications" (SELECT where user_id = auth.uid())
- [x] Create policy: "Users can update their own notifications" (UPDATE where user_id = auth.uid())
- [x] Create policy: "Users can delete their own notifications" (DELETE where user_id = auth.uid())

### Database Functions & Triggers
- [x] Create `update_updated_at_column()` function for auto-updating timestamps
- [x] Add BEFORE UPDATE trigger on `profiles` table to call update_updated_at_column()
- [x] Create `notify_on_follow()` function to insert notification when follow is created
- [x] Add AFTER INSERT trigger on `follows` table to call notify_on_follow()
- [x] Create `remove_follow_notification()` function to delete notification when follow is removed
- [x] Add AFTER DELETE trigger on `follows` table to call remove_follow_notification()

### Enable Supabase Realtime
- [x] Enable Realtime on `notifications` table in Supabase dashboard
- [x] Test Realtime subscription with sample INSERT

## Testing Checklist

- [x] All 5 tables created successfully (profiles, user_favorites, reading_goals, follows, notifications)
- [x] All constraints work (username format, bio length, unique constraints, check constraints)
- [x] All indexes exist (check with `\d+ table_name` in psql)
- [x] RLS policies prevent unauthorized access (test with different users)
- [x] RLS policies allow authorized access (can read own data, can write own data)
- [x] Cannot follow yourself (CHECK constraint prevents it)
- [x] Cannot create duplicate follows (UNIQUE constraint prevents it)
- [x] Following a user creates a notification automatically (trigger test)
- [x] Unfollowing a user removes the notification automatically (trigger test)
- [x] Profiles.updated_at auto-updates when profile is changed (trigger test)
- [x] Realtime subscription receives events when notification inserted

## Notes

