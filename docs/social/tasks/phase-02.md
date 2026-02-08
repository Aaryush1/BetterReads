# Phase 2: Type Definitions & Query Functions

## Status: NOT STARTED

## Tasks

### Type Definitions
- [ ] Create `src/types/profile.ts`
- [ ] Define `Profile` interface (id, user_id, username, display_name, bio, location, avatar_url, favorite_genres, created_at, updated_at)
- [ ] Define `UserFavorite` interface (id, user_id, book_id, book_data, order_position, created_at)
- [ ] Define `ReadingGoal` interface (id, user_id, year, target_books, created_at)
- [ ] Define `ReadingStats` interface (books_read, currently_reading, want_to_read)
- [ ] Create `src/types/follow.ts`
- [ ] Define `Follow` interface (id, follower_id, following_id, created_at)
- [ ] Define `FollowWithProfile` interface (extends Follow with profile data)
- [ ] Create `src/types/notification.ts`
- [ ] Define `NotificationType` type ('follow' | 'like' | 'comment' | 'mention')
- [ ] Define `Notification` interface (id, user_id, type, actor_id, entity_id, read, created_at)
- [ ] Define `NotificationWithActor` interface (extends Notification with actor profile)
- [ ] Export all types from `src/types/index.ts`

### Query Functions - Profiles
- [ ] Create `src/lib/supabase/queries/profiles.ts`
- [ ] Implement `getProfileByUsername(username: string)` - fetch profile with join to auth.users
- [ ] Implement `getProfileByUserId(userId: string)` - fetch profile by user_id
- [ ] Implement `createProfile(userId, username, displayName)` - insert new profile
- [ ] Implement `updateProfile(userId, updates)` - update profile fields
- [ ] Implement `getReadingStats(userId)` - count books in each shelf (read, currently_reading, want_to_read)
- [ ] Implement `getFavoriteBooks(userId)` - get user_favorites ordered by order_position
- [ ] Implement `addFavoriteBook(userId, bookId, bookData, position)` - insert favorite
- [ ] Implement `removeFavoriteBook(userId, bookId)` - delete favorite
- [ ] Implement `reorderFavorites(userId, bookIds)` - update order_position for multiple favorites
- [ ] Implement `getReadingGoal(userId, year)` - get goal and calculate progress from books_shelves
- [ ] Implement `setReadingGoal(userId, year, targetBooks)` - upsert reading goal

### Query Functions - Follows
- [ ] Create `src/lib/supabase/queries/follows.ts`
- [ ] Implement `followUser(followerId, followingId)` - insert follow record
- [ ] Implement `unfollowUser(followerId, followingId)` - delete follow record
- [ ] Implement `isFollowing(followerId, followingId)` - return boolean
- [ ] Implement `getFollowerCount(userId)` - count where following_id = userId
- [ ] Implement `getFollowingCount(userId)` - count where follower_id = userId
- [ ] Implement `getFollowers(userId, page?, limit?)` - paginated list with profile data
- [ ] Implement `getFollowing(userId, page?, limit?)` - paginated list with profile data

### Query Functions - Notifications
- [ ] Create `src/lib/supabase/queries/notifications.ts`
- [ ] Implement `getNotifications(userId, limit?)` - get recent notifications with actor profile data
- [ ] Implement `getUnreadCount(userId)` - count where read = false
- [ ] Implement `markAsRead(notificationId)` - update read = true
- [ ] Implement `markAllAsRead(userId)` - update all user notifications to read = true
- [ ] Implement `deleteNotification(notificationId)` - delete single notification

## Testing Checklist

- [ ] All TypeScript types compile without errors
- [ ] Profile queries return correct data shape matching type definitions
- [ ] createProfile inserts new profile successfully
- [ ] updateProfile updates only specified fields
- [ ] getReadingStats returns accurate counts from books_shelves table
- [ ] getFavoriteBooks returns favorites in correct order
- [ ] addFavoriteBook enforces max 5 favorites in application logic
- [ ] getReadingGoal calculates progress correctly based on books added to "Read" shelf
- [ ] followUser creates follow record and returns success
- [ ] followUser prevents duplicate follows (handled by unique constraint)
- [ ] unfollowUser removes follow record
- [ ] isFollowing returns true when following, false when not
- [ ] getFollowerCount and getFollowingCount return accurate numbers
- [ ] getFollowers and getFollowing return paginated results with profile data
- [ ] getNotifications returns notifications with actor profile data joined
- [ ] getUnreadCount returns accurate count of unread notifications
- [ ] markAsRead updates single notification
- [ ] markAllAsRead updates all user notifications
- [ ] All queries respect RLS policies (no unauthorized access)

## Notes

