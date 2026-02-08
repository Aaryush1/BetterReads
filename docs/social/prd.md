# PRD: Social Features — Phase 1 (Profiles & Follow System)

**Status:** DRAFT (Awaiting Approval)
**Created:** 2026-02-08
**Owner:** Product

---

## Problem Statement

BetterReads currently exists as a personal reading tracker with no social features. Users can search books, manage shelves, and rate books — but they're doing it alone.

Readers want to:
- **Connect with other readers** who share similar tastes
- **Discover what friends are reading** and get recommendations from trusted sources
- **Share their reading journey** and engage with a community around books

Without social features, BetterReads lacks the community aspect that makes platforms like Goodreads, Literal, and StoryGraph engaging for long-term use.

---

## Goals (Phase 1)

**In Scope:**
1. **User Profiles** — Create public profile pages where users can showcase their reading identity
   - Bio & location (optional)
   - Reading statistics (books read, currently reading, want to read counts)
   - Public shelves display
   - Favorite books & genres
   - Reading goals & challenges (e.g., "24/50 books read in 2026")
2. **Follow System** — Enable users to follow other readers
   - Public follow model (instant, no approval required)
   - Follower/following counts and lists
   - Follow/unfollow actions
3. **In-App Notifications** — Notify users of social activity
   - Notification bell icon in navbar with unread count
   - Notification center dropdown showing recent activity
   - Phase 1: Notify on new followers only (more notification types in future phases)
4. **Navigation** — Add profile access to navbar
   - "Profile" link in main navbar for quick access to your own profile
   - Clicking on usernames elsewhere in the app navigates to their profile

**Success Metrics:**
- 40%+ of active users create a profile within first week of launch
- Average user follows 5+ other readers
- 20%+ of users set a reading goal

---

## Non-Goals (Phase 1)

**Explicitly Out of Scope:**
- ❌ **Activity Feed** — Timeline showing what people you follow are reading (Phase 2)
- ❌ **Social Reviews & Comments** — Public reviews with likes/comments (Phase 2)
- ❌ **Discovery Features** — Book-based discovery, user search, suggested follows, import from external services (Phase 2)
- ❌ **Social Interactions** — Likes, comments, shares on activity (Phase 3)
- ❌ **Content Moderation** — Block, report, comment moderation (Phase 3)
- ❌ **Email Notifications** — Email digests of social activity (Future)
- ❌ **Private Profiles** — All profiles are public by default (may add privacy controls later)
- ❌ **Direct Messaging** — One-on-one chat between users (Future consideration)

---

## User Stories

### As a reader, I want to...
1. **Create my profile** so other readers can learn about me and my reading tastes
   - Given: I'm logged in
   - When: I navigate to my profile page
   - Then: I can edit my bio, location, favorite books, genres, and reading goal

2. **View another reader's profile** so I can see what they're reading and if we have similar tastes
   - Given: I'm on a book detail page and see that "Sarah Jones" rated this book 5 stars
   - When: I click on "Sarah Jones"
   - Then: I'm taken to her profile showing her bio, shelves, reading stats, and favorite books

3. **Follow other readers** so I can build a network of people whose reading activity I care about
   - Given: I'm viewing another user's profile
   - When: I click "Follow"
   - Then: I'm now following them, the button changes to "Following", their follower count increments, and they receive a notification

4. **See who follows me** so I can discover readers interested in my taste and potentially follow them back
   - Given: I'm on my own profile
   - When: I click on my "Followers" count
   - Then: I see a list of users who follow me, with options to view their profiles or follow them back

5. **Get notified when someone follows me** so I'm aware of new connections and can engage
   - Given: Another user just followed me
   - When: I look at the notification bell in the navbar
   - Then: I see a red badge with unread count, and clicking it shows "User X started following you"

6. **Set and track a reading goal** so I can motivate myself and show my progress publicly
   - Given: I'm editing my profile
   - When: I set a goal of "50 books in 2026"
   - Then: My profile shows "24/50 books read in 2026" with a progress bar

---

## Acceptance Criteria

### Profile Features
- [ ] Users can create/edit profile with bio (max 500 chars), location, favorite genres
- [ ] Users can select up to 5 favorite books to display prominently on profile
- [ ] Users can set an annual reading goal (books per year) that auto-tracks against their shelves
- [ ] Profile displays accurate reading stats: # books read, # currently reading, # want to read
- [ ] Profile shows user's public shelves (Want to Read, Currently Reading, Read by default; custom shelves if added)
- [ ] Profiles are accessible via clean URL: `/profile/[username]` or `/u/[username]`
- [ ] Usernames are unique, URL-safe, and validated (alphanumeric + underscores/hyphens only)
- [ ] Profile page is responsive and matches BetterReads design system (Tailwind, Fraunces/Bricolage fonts, dark mode support)

### Follow System
- [ ] Users can follow/unfollow from any profile page (except their own)
- [ ] Follow button shows current state: "Follow" (if not following), "Following" (if already following)
- [ ] Clicking "Following" unfollows (with optional confirmation)
- [ ] Profile pages show follower count and following count as clickable links
- [ ] Clicking follower/following count opens a modal or page showing the list of users
- [ ] User lists show avatar (or initials), display name, username, and quick follow/unfollow action
- [ ] Following is instant (no approval required)
- [ ] Users cannot follow themselves

### Notifications
- [ ] Notification bell icon appears in navbar for logged-in users
- [ ] Bell shows red badge with unread count when notifications exist
- [ ] Clicking bell opens a dropdown notification center
- [ ] Notifications show: "User X started following you" with timestamp and link to their profile
- [ ] Clicking a notification marks it as read
- [ ] "Mark all as read" option clears all unread notifications
- [ ] Notifications are stored in database and persist across sessions
- [ ] Notification center handles empty state gracefully ("No new notifications")

### Navigation & UX
- [ ] "Profile" link added to main navbar (visible when logged in)
- [ ] Clicking "Profile" in navbar takes user to their own profile (`/profile/[current-user]`)
- [ ] All username displays throughout the app (book ratings, shelf activity, etc.) are clickable links to profiles
- [ ] Profile pages have meta tags for SEO and Open Graph sharing
- [ ] Loading states for profile fetch, follow actions, and notifications
- [ ] Error states for profile not found (404), network errors, etc.

### Database & API
- [ ] `profiles` table created with columns: `id`, `user_id` (FK to auth.users), `username`, `display_name`, `bio`, `location`, `avatar_url`, `created_at`, `updated_at`
- [ ] `user_favorites` table for favorite books (many-to-many: `user_id`, `book_id`, `order`)
- [ ] `user_genres` table for favorite genres (many-to-many: `user_id`, `genre`, `order`)
- [ ] `reading_goals` table: `user_id`, `year`, `target_books`, `created_at`
- [ ] `follows` table: `follower_id`, `following_id`, `created_at` with unique constraint
- [ ] `notifications` table: `id`, `user_id`, `type`, `actor_id`, `entity_id`, `read`, `created_at`
- [ ] API route or Server Action for creating/updating profile
- [ ] API route or Server Action for follow/unfollow
- [ ] API route or Server Action for fetching notifications and marking as read
- [ ] Supabase RLS policies: users can read all profiles, edit only their own; users can follow anyone; users can read only their own notifications

### Testing
- [ ] Unit tests for profile validation logic (username uniqueness, bio length, etc.)
- [ ] Integration tests for follow/unfollow flow
- [ ] Integration tests for notification creation and retrieval
- [ ] Manual QA: Create profile, follow users, check notifications, test on mobile viewport
- [ ] Edge case testing: Very long bios, special characters in usernames, rapid follow/unfollow

---

## Open Questions

1. **Username vs Display Name**
   - Should users have both a unique username (for URLs) and a separate display name (for UI)?
   - Or just one "username" field that serves both purposes?
   - **Recommendation:** Both — `username` for URLs (immutable or rare changes), `display_name` for UI (can change freely)

2. **Profile Avatars**
   - Should Phase 1 include avatar uploads, or use initials/default avatars?
   - Avatar storage via Supabase Storage?
   - **Recommendation:** Default to initials in colored circle (like GitHub). Avatar upload can be Phase 1.5 or Phase 2.

3. **Reading Goal Granularity**
   - Should goals be annual only, or allow monthly/quarterly goals?
   - Should we auto-calculate progress based on "Read" shelf, or let users manually update?
   - **Recommendation:** Annual goals only for Phase 1, auto-calculate from "Read" shelf date-added timestamps.

4. **Follower Notifications Frequency**
   - Should we batch follower notifications (e.g., "User X and 3 others followed you"), or send one per follow?
   - **Recommendation:** Individual notifications for now (simpler). Batching can be added if volume becomes high.

5. **Profile Discoverability Before Phase 2**
   - Without user search or suggested follows in Phase 1, how do users find profiles?
   - **Options:**
     - Show "Readers who rated this book" on book detail pages (book-based discovery stub)
     - Show a global "Recently Active Users" list somewhere
     - Wait until Phase 2 for discovery
   - **Recommendation:** Add "Readers who rated this book" list on book detail page as minimal discovery

---

## Dependencies

- **Database migrations** — New tables for profiles, follows, notifications, etc.
- **Supabase RLS policies** — Ensure proper permissions for profile visibility and follows
- **Design assets** — Profile page layout, notification UI, follow button states
- **Existing features** — Profiles will pull data from existing `books_shelves` and `books_ratings` tables

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Spam follows** | Users annoyed by fake accounts following them | Phase 1: Accept risk. Phase 3: Add block/report features |
| **Username squatting** | Desirable usernames taken by inactive users | Reserve common terms (admin, support, etc.), allow username changes once per 30 days |
| **Performance at scale** | Profile pages slow with large follower counts | Paginate follower/following lists, add indexes on `follows` table |
| **Privacy concerns** | Some users don't want public profiles | Phase 1: Accept that all profiles are public. Future: Add privacy settings |

---

## Timeline Estimate

**Phase 1 Target:** 3-4 weeks
- Week 1: Database schema, migrations, API setup
- Week 2: Profile pages (view + edit), follow system
- Week 3: Notifications system, navbar integration
- Week 4: Polish, testing, QA

---

## Next Steps

1. **User Approval** — Review this PRD and confirm scope for Phase 1
2. **Technical Plan** — Create `docs/social/plan.md` with architecture decisions and data models
3. **Task Breakdown** — Break Phase 1 into sequential tasks in `docs/social/tasks/phase-01.md`
4. **Implementation** — Follow the task list, update checkboxes as work completes
