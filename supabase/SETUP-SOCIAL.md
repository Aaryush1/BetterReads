# Setup Instructions: Social Features Database

Follow these steps in order to set up the database for social features (Phase 1).

## Prerequisites

- Access to Supabase Dashboard
- Project already has existing schema from MVP (shelves, user_books tables)

---

## Step 1: Run Main Social Schema

1. Open Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of **`supabase/social-schema.sql`**
4. Paste into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Verify success: You should see "Success. No rows returned"

This creates:
- ✅ `profiles` table
- ✅ `user_favorites` table
- ✅ `reading_goals` table
- ✅ `follows` table
- ✅ `notifications` table (with `notification_type` enum)
- ✅ RLS policies for all new tables
- ✅ Database functions (`update_updated_at_column`, `notify_on_follow`, `remove_follow_notification`)
- ✅ Triggers (auto-update timestamps, notification creation/deletion)

---

## Step 2: Update Existing RLS Policies

1. Still in **SQL Editor**, create another **"New Query"**
2. Copy the entire contents of **`supabase/update-existing-rls-for-social.sql`**
3. Paste into the SQL Editor
4. Click **"Run"**
5. Verify success: You should see "Success. No rows returned"

This updates:
- ✅ `shelves` table: Now publicly readable (so profiles can show user shelves)
- ✅ `user_books` table: Now publicly readable (so profiles can show user books and ratings)

**Note:** Write policies remain unchanged — users can still only modify their own data.

---

## Step 3: Enable Realtime for Notifications

1. In Supabase Dashboard, go to **Database → Replication**
2. Scroll down to find the **`notifications`** table in the list
3. Toggle **"Enable Realtime"** to **ON** (green)
4. Verify: The toggle should stay green after clicking

This allows:
- ✅ Real-time notification delivery to clients
- ✅ Instant updates when someone follows you
- ✅ Live notification bell badge updates

---

## Step 4: Verify Setup

Run these verification queries in the SQL Editor to confirm everything is set up correctly.

### Check all tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_favorites', 'reading_goals', 'follows', 'notifications')
ORDER BY table_name;
```

**Expected result:** 5 rows (all tables listed)

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_favorites', 'reading_goals', 'follows', 'notifications', 'shelves', 'user_books')
ORDER BY tablename;
```

**Expected result:** All tables should have `rowsecurity = true`

### Check policies exist:
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected result:** Should see policies like:
- `profiles`: 4 policies (public read, owner write/update/delete)
- `user_favorites`: 4 policies (public read, owner write/update/delete)
- `reading_goals`: 4 policies (public read, owner write/update/delete)
- `follows`: 3 policies (public read, authenticated insert, follower delete)
- `notifications`: 3 policies (owner read/update/delete)
- `shelves`: 4 policies (public read, owner write/update/delete)
- `user_books`: 4 policies (public read, owner write/update/delete)

### Check triggers exist:
```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('profiles', 'follows')
ORDER BY event_object_table, trigger_name;
```

**Expected result:** Should see:
- `update_profiles_updated_at` on `profiles` (BEFORE UPDATE)
- `create_follow_notification` on `follows` (AFTER INSERT)
- `remove_follow_notification_trigger` on `follows` (AFTER DELETE)

### Check functions exist:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_updated_at_column', 'notify_on_follow', 'remove_follow_notification')
ORDER BY routine_name;
```

**Expected result:** 3 rows (all functions listed)

### Test notification trigger:
```sql
-- Insert a test follow (replace UUIDs with real user IDs from your auth.users table)
-- This should automatically create a notification
-- You can find user IDs with: SELECT id, email FROM auth.users LIMIT 5;

-- Example test (use real UUIDs from your database):
-- INSERT INTO follows (follower_id, following_id)
-- VALUES ('uuid-of-user-1', 'uuid-of-user-2');

-- Then check if notification was created:
-- SELECT * FROM notifications WHERE type = 'follow';

-- Clean up test:
-- DELETE FROM follows WHERE follower_id = 'uuid-of-user-1';
```

---

## Step 5: Mark Phase 1 Tasks Complete

Once all verifications pass:

1. Open `docs/social/tasks/phase-01.md`
2. Check off all tasks in the **Tasks** section
3. Check off all items in the **Testing Checklist** section

---

## Troubleshooting

### Error: "relation already exists"
- One of the tables already exists from a previous run
- Solution: Drop the existing table first, or modify the script to use `CREATE TABLE IF NOT EXISTS`

### Error: "policy already exists"
- A policy with that name already exists
- Solution: Drop the old policy first with `DROP POLICY IF EXISTS "policy_name" ON table_name;`

### Error: "function already exists"
- A function with that name already exists
- Solution: The script already uses `CREATE OR REPLACE FUNCTION`, so this shouldn't happen. If it does, drop the function first.

### Realtime not working
- Make sure you toggled "Enable Realtime" in Database → Replication
- Check that the toggle stayed green after clicking
- Try refreshing the page and checking again

### RLS blocking queries
- Make sure you're testing with an authenticated user (not anonymous)
- Check that the policies are correctly applied with the verification queries above
- For debugging, you can temporarily disable RLS: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;` (re-enable after debugging)

---

## Next Steps

After completing Phase 1 setup:

✅ Database foundation is complete
➡️ Move to **Phase 2**: Type Definitions & Query Functions ([docs/social/tasks/phase-02.md](../docs/social/tasks/phase-02.md))
