# Phase 5: Follow System

## Status: NOT STARTED

## Tasks

### Follow Button Component
- [ ] Create `src/components/profile/FollowButton.tsx` (Client Component)
- [ ] Accept props: userId, initialFollowState (boolean), followerCount
- [ ] Show "Follow" button when not following
- [ ] Show "Following" button when following
- [ ] Implement optimistic updates (instant UI change before server confirms)
- [ ] Use `useTransition` for loading state
- [ ] Call followUser or unfollowUser Server Action on click
- [ ] Update local state optimistically
- [ ] Rollback state if action fails (show error toast/message)
- [ ] Disable button during request
- [ ] Update follower count optimistically
- [ ] Add hover state on "Following" button showing "Unfollow"

### Follow Server Actions
- [ ] Add `followUser(userId)` to `src/app/(app)/profile/actions.ts`
  - Get current user from session
  - Validate user is authenticated
  - Prevent self-follows (throw error if userId === currentUser.id)
  - Call followUser query function
  - Handle duplicate follow error gracefully (already following)
  - Revalidate profile path
  - Return success or error
- [ ] Add `unfollowUser(userId)` to actions
  - Get current user from session
  - Validate user is authenticated
  - Call unfollowUser query function
  - Revalidate profile path
  - Return success or error

### Integrate Follow Button
- [ ] Update ProfileHeader component to include FollowButton
- [ ] Show FollowButton only when viewing another user's profile (not own)
- [ ] Pass userId and current follow state to FollowButton
- [ ] Pass follower count for optimistic updates

### Followers List
- [ ] Create `src/components/profile/FollowersList.tsx` (Server Component wrapper)
- [ ] Fetch followers using getFollowers query (paginated, 20 per page)
- [ ] Create `src/components/profile/FollowersListClient.tsx` (Client Component)
- [ ] Display list of users with avatar, display_name, username
- [ ] Link each user to their profile page
- [ ] Show FollowButton for each user (if not viewing own profile)
- [ ] Implement "Load More" pagination button
- [ ] Handle empty state: "No followers yet"
- [ ] Show loading state while fetching

### Following List
- [ ] Create `src/components/profile/FollowingList.tsx` (Server Component wrapper)
- [ ] Fetch following using getFollowing query (paginated, 20 per page)
- [ ] Create `src/components/profile/FollowingListClient.tsx` (Client Component)
- [ ] Display list of users (same UI as FollowersList)
- [ ] Show "Following" button for each (clicking unfollows)
- [ ] Implement "Load More" pagination
- [ ] Handle empty state: "Not following anyone yet"

### Followers/Following Modal or Page
- [ ] Create modal component or separate page for followers/following lists
- [ ] Add click handler to follower count in ProfileHeader
- [ ] Add click handler to following count in ProfileHeader
- [ ] Open modal/navigate to page showing appropriate list
- [ ] Add tabs or toggle to switch between "Followers" and "Following"
- [ ] Close modal on outside click or ESC key (if modal)
- [ ] Ensure accessible (keyboard navigation, focus trap)

## Testing Checklist

- [ ] Follow button appears on other users' profiles
- [ ] Follow button does not appear on own profile
- [ ] Clicking "Follow" changes button to "Following" instantly (optimistic)
- [ ] Follower count increments immediately when following
- [ ] Following action completes successfully on server
- [ ] Notification is created for followed user (from Phase 1 trigger)
- [ ] Clicking "Following" (or "Unfollow" on hover) unfollows user
- [ ] Follower count decrements immediately when unfollowing
- [ ] Unfollowing action completes successfully on server
- [ ] Cannot follow yourself (button hidden on own profile)
- [ ] Attempting self-follow via direct action call fails gracefully
- [ ] Duplicate follow attempts handled gracefully (no error shown to user)
- [ ] Follow/unfollow actions rollback on server error
- [ ] Error message displayed if follow/unfollow fails
- [ ] Button shows loading state (disabled, spinner) during action
- [ ] Followers list displays correct users
- [ ] Following list displays correct users
- [ ] Pagination works (Load More button loads next page)
- [ ] Clicking user in list navigates to their profile
- [ ] Follow buttons in lists work correctly
- [ ] Following user from list updates counts in real-time
- [ ] Empty states display when no followers or following
- [ ] Follower/following counts in ProfileHeader are clickable
- [ ] Modal/page opens showing correct list (followers or following)
- [ ] Can switch between Followers and Following views
- [ ] Modal closes on ESC key or outside click
- [ ] Lists are responsive (mobile, tablet, desktop)
- [ ] Dark mode works correctly

## Notes

