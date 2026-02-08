# Phase 7: Polish & QA

## Status: NOT STARTED

## Tasks

### Visual Polish
- [ ] Add loading skeletons for all async components (profile page, lists, notifications)
- [ ] Add empty states for all lists (no followers, no following, no favorites, no notifications)
- [ ] Add error states for failed queries (network error, server error, profile not found)
- [ ] Ensure consistent spacing and typography across all new pages
- [ ] Add smooth transitions for follow button state changes
- [ ] Add hover states for all interactive elements (buttons, links, cards)
- [ ] Polish notification center design (shadows, borders, spacing, animations)
- [ ] Add slide-in animation for notification center dropdown
- [ ] Add fade-in animations for profile sections
- [ ] Review dark mode on all new pages and components
- [ ] Ensure color consistency with existing design system
- [ ] Test on mobile viewport and adjust spacing/sizing as needed
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport (wide screens)

### Accessibility
- [ ] Add ARIA labels to all icon buttons (follow, notification bell, edit, etc.)
- [ ] Ensure all interactive elements are keyboard accessible (Tab navigation)
- [ ] Test screen reader compatibility (VoiceOver on Mac, NVDA on Windows)
- [ ] Ensure color contrast meets WCAG AA standards (use contrast checker)
- [ ] Add visible focus indicators for all focusable elements
- [ ] Implement focus trap for notification center dropdown
- [ ] Test keyboard navigation for notification center (arrow keys, Enter, ESC)
- [ ] Add skip links if needed for main content
- [ ] Ensure form labels are properly associated with inputs
- [ ] Add descriptive alt text for avatar images (when implemented)

### Edge Cases & Error Handling
- [ ] Handle username with edge case characters (underscores, hyphens, numbers)
- [ ] Handle very long bios (test with 500 character bio)
- [ ] Handle profile with 0 books/followers/following (empty states)
- [ ] Handle rapid follow/unfollow clicks (debounce or disable during request)
- [ ] Handle network failures gracefully (show error message, retry option)
- [ ] Handle profile load failure (show error page with "Go Back" or "Try Again" button)
- [ ] Handle invalid username in URL (show 404 page)
- [ ] Handle following someone who has blocked you (future: for now just succeed)
- [ ] Test with slow 3G network (throttle in Chrome DevTools)
- [ ] Test with offline mode (show appropriate error)
- [ ] Handle Realtime subscription disconnection (reconnect automatically)
- [ ] Handle notification center open when new notification arrives (auto-update list)

### Performance Optimization
- [ ] Verify all database queries have proper indexes
- [ ] Check Server Components aren't over-fetching data (select only needed columns)
- [ ] Ensure Realtime subscription doesn't cause memory leaks (proper cleanup)
- [ ] Test profile page load time (should be < 2 seconds on good connection)
- [ ] Test notification center render performance with 100+ notifications
- [ ] Optimize book cover images with Next.js Image component (proper sizes, formats)
- [ ] Use Next.js image optimization for favorite books (srcset, WebP)
- [ ] Check bundle size hasn't increased dramatically (run build, check size)
- [ ] Implement code splitting if notification components are large
- [ ] Use loading="lazy" for images below the fold

### Manual QA Testing - User Flows
- [ ] **Create New Account**
  - Sign up with new email
  - Verify no profile exists initially
  - Navigate to edit profile
  - Fill in display name, username, bio, location
  - Add favorite genres (select 3-5)
  - Search and add favorite books (add 5)
  - Set reading goal (50 books in 2026)
  - Save profile
  - Verify redirect to profile page
  - Verify all data displays correctly
- [ ] **View Own Profile**
  - Navigate to `/profile/[myusername]`
  - Verify all sections display: header, stats, favorite books, reading goal, shelves
  - Verify "Edit Profile" button shows (not "Follow" button)
  - Click "Edit Profile" and verify it goes to edit page
- [ ] **View Another User's Profile**
  - Navigate to another user's profile (use test account or create second account)
  - Verify follow button shows (not "Edit Profile")
  - Verify all sections display correctly
- [ ] **Follow Flow**
  - From another user's profile, click "Follow"
  - Verify button changes to "Following" instantly
  - Verify follower count increments
  - Verify notification appears in bell (check other account)
  - Click bell icon and verify notification shows correctly
  - Click notification and verify it navigates to follower's profile
  - Verify notification marked as read
- [ ] **Unfollow Flow**
  - From profile you're following, click "Following" (or "Unfollow" on hover)
  - Verify button changes to "Follow" instantly
  - Verify follower count decrements
  - Check other account: notification should disappear
- [ ] **Followers/Following Lists**
  - Click on follower count
  - Verify modal/page opens with followers list
  - Verify correct users display
  - Click on a user and verify navigation to their profile
  - Go back and click following count
  - Verify following list displays
  - Follow a user from the list
  - Verify button changes to "Following"
- [ ] **Edit Profile**
  - Go to edit profile page
  - Update bio, location, genres
  - Remove a favorite book
  - Add a new favorite book
  - Change reading goal
  - Save changes
  - Verify redirect to profile with updated data
- [ ] **Notifications**
  - Have another user follow you
  - Verify bell badge shows unread count
  - Click bell and verify notification center opens
  - Verify notification displays with correct text and timestamp
  - Click "Mark all as read"
  - Verify badge disappears
  - Verify notification styling changes (no longer bold/highlighted)

### Cross-Browser Testing
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Mobile Safari (iPhone)
- [ ] Test on Chrome Mobile (Android)
- [ ] Verify no browser-specific bugs or styling issues

### Device Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android phone (Chrome)
- [ ] Test on iPad (Safari)
- [ ] Test on desktop (1920x1080 and larger)
- [ ] Test on laptop (1440x900)
- [ ] Verify responsive design works on all viewports

### Dark Mode Testing
- [ ] Test profile view page in dark mode
- [ ] Test profile edit page in dark mode
- [ ] Test notification center in dark mode
- [ ] Test followers/following lists in dark mode
- [ ] Verify all colors have sufficient contrast
- [ ] Verify no white/light flashes on page load

### Final Checks
- [ ] No console errors in browser
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] All ESLint warnings addressed
- [ ] All tasks in Phase 1-6 marked complete
- [ ] All testing checklists in Phase 1-6 complete
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Check accessibility audit (no critical violations)
- [ ] Verify all links work (no 404s)
- [ ] Verify all images load correctly
- [ ] Verify all forms submit successfully
- [ ] Verify all server actions handle errors

### Documentation
- [ ] Update CLAUDE.md if any new patterns/conventions added
- [ ] Add comments to complex query functions
- [ ] Document any non-obvious RLS policies
- [ ] Update README if needed (mention social features)

## Testing Checklist

- [ ] All loading states render correctly across all pages
- [ ] All empty states render correctly and are helpful
- [ ] All error states render correctly with actionable messages
- [ ] Dark mode works perfectly on all new pages and components
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Accessibility checks pass (WCAG AA compliance)
- [ ] All edge cases handled gracefully (no crashes or broken UI)
- [ ] Performance is acceptable (fast loads, no lag, smooth animations)
- [ ] Manual QA checklist 100% complete
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari, Mobile)
- [ ] Device testing complete (iPhone, Android, iPad, Desktop)
- [ ] Dark mode testing complete
- [ ] No console errors or warnings in any browser
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] Lighthouse scores 90+ (Performance, Accessibility, Best Practices, SEO)
- [ ] All Phase 1-6 tasks and testing checklists complete

## Notes

