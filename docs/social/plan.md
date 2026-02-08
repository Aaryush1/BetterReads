# Technical Plan: Social Features — Phase 1

**Status:** APPROVED
**Created:** 2026-02-08
**PRD:** [prd.md](./prd.md)

---

## Architecture Overview

Phase 1 adds social features to BetterReads with a focus on **profiles and following**. We'll use Next.js App Router patterns with Server Components for SEO-friendly profile pages, Server Actions for mutations, and Supabase for data storage with Row Level Security.

**Key Principles:**
- Server-first rendering for profile pages (SEO + performance)
- Progressive enhancement for client interactions (follow buttons, notifications)
- Real-time notifications via Supabase Realtime subscriptions
- Public-by-default privacy model (all profiles visible to all users)

---

## Data Model

### New Database Tables

#### `profiles`
```sql
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

  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$'),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);
```

#### `user_favorites`
```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id TEXT NOT NULL,
  book_data JSONB NOT NULL,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, book_id)
);
```

#### `reading_goals`
```sql
CREATE TABLE reading_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  target_books INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, year)
);
```

#### `follows`
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);
```

#### `notifications`
```sql
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment', 'mention');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT no_self_notify CHECK (user_id != actor_id)
);
```

---

## Component Architecture

### File Structure
```
src/
├── app/(app)/
│   ├── profile/
│   │   ├── [username]/
│   │   │   ├── page.tsx              # Profile view
│   │   │   ├── loading.tsx           # Loading skeleton
│   │   │   └── not-found.tsx         # 404
│   │   ├── edit/page.tsx             # Profile edit
│   │   └── actions.ts                # Server Actions
│   └── layout.tsx                    # Add NotificationBell to navbar
├── components/
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileStats.tsx
│   │   ├── ProfileShelves.tsx
│   │   ├── FavoriteBooks.tsx
│   │   ├── ReadingGoal.tsx
│   │   ├── FollowButton.tsx
│   │   ├── FollowersList.tsx
│   │   └── FollowingList.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationItem.tsx
│   │   └── useNotifications.ts
│   └── Navbar.tsx
├── lib/
│   └── supabase/queries/
│       ├── profiles.ts
│       ├── follows.ts
│       └── notifications.ts
└── types/
    ├── profile.ts
    ├── follow.ts
    └── notification.ts
```

---

## Key Implementation Details

### Server Actions
- `updateProfile()` - Update user profile data
- `followUser()` - Create follow relationship
- `unfollowUser()` - Delete follow relationship
- `setReadingGoal()` - Set/update reading goal

### Real-Time Notifications
- Supabase Realtime subscription on `notifications` table
- Filter by `user_id` for current user
- Auto-update unread count on INSERT events

### Database Triggers
- Auto-update `updated_at` on profile changes
- Create notification on follow (INSERT trigger)
- Delete notification on unfollow (DELETE trigger)

### RLS Policies
- Profiles: Public read, owner-only write
- Follows: Public read, authenticated insert/delete
- Notifications: Owner-only read/update

---

## Timeline

**Phase 1: 3-4 weeks**
- Week 1: Database setup, migrations, RLS policies
- Week 2: Profile pages (view + edit)
- Week 3: Follow system + notifications
- Week 4: Polish, testing, QA

---

## Next Steps

Create phased task breakdown in `docs/social/tasks/phase-01.md`
