# Phase 6: Notifications System

## Status: NOT STARTED

## Tasks

### Notification Hook
- [ ] Create `src/components/notifications/useNotifications.ts` custom hook
- [ ] Fetch user's notifications on mount using getNotifications()
- [ ] Fetch unread count using getUnreadCount()
- [ ] Set up Supabase Realtime subscription to notifications table
- [ ] Filter Realtime subscription by user_id = current user
- [ ] Listen for INSERT events on notifications table
- [ ] Add new notification to state when received
- [ ] Increment unread count when new notification arrives
- [ ] Implement markAsRead(notificationId) function
  - Call markAsRead query
  - Update notification.read = true in local state (optimistic)
  - Decrement unread count
- [ ] Implement markAllAsRead() function
  - Call markAllAsRead query
  - Update all notifications to read = true in state
  - Set unread count to 0
- [ ] Clean up Realtime subscription on unmount

### Notification Item Component
- [ ] Create `src/components/notifications/NotificationItem.tsx` (Client Component)
- [ ] Display notification content based on type (Phase 1: only 'follow' type)
- [ ] Format text: "User X started following you"
- [ ] Show actor's avatar (colored circle with initials)
- [ ] Show actor's display_name and username
- [ ] Show relative timestamp ("2 hours ago")
- [ ] Add visual indicator for unread (blue dot, bold text, different background)
- [ ] Make entire item clickable (navigate to actor's profile)
- [ ] Mark notification as read onClick
- [ ] Add hover state styling

### Notification Center Component
- [ ] Create `src/components/notifications/NotificationCenter.tsx` (Client Component)
- [ ] Use useNotifications hook for data
- [ ] Render dropdown panel (absolute positioning, high z-index)
- [ ] Add header with "Notifications" title and "Mark all as read" button
- [ ] List notifications (limit to 20 most recent)
- [ ] Each notification uses NotificationItem component
- [ ] Handle empty state: "No new notifications" with icon
- [ ] Handle loading state (skeleton or spinner)
- [ ] Close dropdown on outside click (useOnClickOutside hook)
- [ ] Close dropdown on ESC key
- [ ] Implement keyboard navigation (arrow keys to navigate, Enter to select)
- [ ] Add focus trap for accessibility
- [ ] Style with Tailwind, support dark mode

### Notification Bell Component
- [ ] Create `src/components/notifications/NotificationBell.tsx` (Client Component)
- [ ] Use useNotifications hook for unread count
- [ ] Render bell icon (use icon library or SVG)
- [ ] Show red badge with unread count if > 0
- [ ] Badge shows count if < 10, "9+" if >= 10
- [ ] Toggle NotificationCenter visibility onClick
- [ ] Add aria-label="Notifications" for accessibility
- [ ] Add aria-live="polite" to badge for screen readers
- [ ] Show loading state initially (optional: small skeleton)
- [ ] Hide bell if user not logged in

### Navbar Integration
- [ ] Update `src/components/Navbar.tsx`
- [ ] Add "Profile" link to navbar
  - Desktop: Show text "Profile"
  - Mobile: Show profile icon only
  - Link to `/profile/[currentUser.username]`
- [ ] Add NotificationBell component to navbar
- [ ] Position bell between search and user menu
- [ ] Adjust spacing for responsive layout
- [ ] Test with logged in and logged out states
- [ ] Ensure navbar doesn't break on smaller viewports

## Testing Checklist

- [ ] useNotifications hook fetches notifications on mount
- [ ] Realtime subscription connects successfully
- [ ] New follow creates notification that appears in real-time
- [ ] Unread count updates immediately when new notification arrives
- [ ] Clicking notification marks it as read
- [ ] Clicking notification navigates to actor's profile
- [ ] Read notification shows different styling (no blue dot, lighter text)
- [ ] "Mark all as read" button marks all notifications as read
- [ ] Unread count badge updates correctly (decrements on read, shows 0 when all read)
- [ ] Badge shows "9+" when unread count >= 10
- [ ] Badge hides when unread count = 0
- [ ] NotificationCenter dropdown opens on bell click
- [ ] NotificationCenter closes on outside click
- [ ] NotificationCenter closes on ESC key
- [ ] Keyboard navigation works (Tab, arrow keys, Enter)
- [ ] Focus trap keeps focus within dropdown when open
- [ ] Empty state displays when no notifications exist
- [ ] Loading state shows while fetching notifications
- [ ] Notifications list scrolls if > 20 items
- [ ] Notifications display with correct actor name and timestamp
- [ ] Relative timestamps format correctly ("just now", "5m", "2h", "3d")
- [ ] Realtime subscription cleans up on unmount (no memory leaks)
- [ ] Profile link in navbar navigates to current user's profile
- [ ] Profile link shows text on desktop, icon on mobile
- [ ] NotificationBell hidden when user logged out
- [ ] Navbar layout responsive (mobile, tablet, desktop)
- [ ] Dark mode works on bell, badge, and notification center
- [ ] ARIA labels and live regions work for screen readers

## Notes

