# Phase 3: Profile View Pages

## Status: NOT STARTED

## Tasks

### Profile View Page Structure
- [ ] Create `src/app/(app)/profile/[username]/page.tsx` (Server Component)
- [ ] Fetch profile by username using getProfileByUsername()
- [ ] Return notFound() if profile doesn't exist
- [ ] Fetch follow counts (getFollowerCount, getFollowingCount)
- [ ] Fetch reading stats (getReadingStats)
- [ ] Fetch reading goal for current year (getReadingGoal)
- [ ] Fetch favorite books (getFavoriteBooks)
- [ ] Get current user's ID from session
- [ ] Check if current user follows this profile (isFollowing)
- [ ] Pass all data to profile components

### Loading & Error States
- [ ] Create `src/app/(app)/profile/[username]/loading.tsx` with skeleton UI
- [ ] Create `src/app/(app)/profile/[username]/not-found.tsx` with 404 message
- [ ] Add error boundary handling for profile fetch failures

### SEO & Metadata
- [ ] Implement `generateMetadata()` for profile pages
- [ ] Set page title: "[Display Name] (@username) | BetterReads"
- [ ] Set description from bio or default text
- [ ] Add Open Graph tags (og:title, og:description, og:image)
- [ ] Add Twitter Card meta tags

### Profile Components - Header
- [ ] Create `src/components/profile/ProfileHeader.tsx` (Client Component)
- [ ] Display avatar placeholder (colored circle with initials)
- [ ] Display display_name (large, bold)
- [ ] Display @username (smaller, muted)
- [ ] Display bio (if exists)
- [ ] Display location (if exists, with icon)
- [ ] Show follower count as clickable button
- [ ] Show following count as clickable button
- [ ] Include FollowButton slot (shown for other users' profiles)
- [ ] Include "Edit Profile" button slot (shown for own profile)
- [ ] Style with Tailwind, support dark mode

### Profile Components - Stats
- [ ] Create `src/components/profile/ProfileStats.tsx` (Server Component)
- [ ] Display "X books read"
- [ ] Display "Y currently reading"
- [ ] Display "Z want to read"
- [ ] Use consistent formatting and spacing
- [ ] Make stats optionally clickable (link to shelf views - Phase 2 feature)

### Profile Components - Favorite Books
- [ ] Create `src/components/profile/FavoriteBooks.tsx` (Server Component)
- [ ] Display section heading: "Favorite Books"
- [ ] Render grid of up to 5 favorite books
- [ ] Show book cover image (use Next.js Image component)
- [ ] Show book title on hover
- [ ] Link each book to `/books/[id]` detail page
- [ ] Handle empty state: "No favorite books yet" (if own profile: "Add favorites in Edit Profile")
- [ ] Responsive grid (5 on desktop, 3 on tablet, 2 on mobile)

### Profile Components - Reading Goal
- [ ] Create `src/components/profile/ReadingGoal.tsx` (Server Component)
- [ ] Display section heading: "2026 Reading Goal"
- [ ] Show "X/Y books read" text
- [ ] Render progress bar (filled to X/Y percentage)
- [ ] Calculate progress from reading goal and reading stats
- [ ] Handle no goal state: Empty state or prompt to set goal (if own profile)
- [ ] Style progress bar with gradient or solid color

### Profile Components - Shelves
- [ ] Create `src/components/profile/ProfileShelves.tsx` (Server Component)
- [ ] Display section heading: "Shelves"
- [ ] List user's shelves (Want to Read, Currently Reading, Read at minimum)
- [ ] Show book count for each shelf
- [ ] Show first 4 book covers from each shelf
- [ ] Link shelf name to filtered shelf view (future feature - just show for now)
- [ ] Handle empty shelves gracefully

## Testing Checklist

- [ ] Profile page loads successfully with valid username
- [ ] Profile page shows 404 for non-existent username
- [ ] Loading skeleton displays while profile fetches
- [ ] All profile data displays correctly (name, username, bio, location, stats)
- [ ] Follower and following counts are accurate
- [ ] Favorite books display with correct covers and links
- [ ] Reading goal shows accurate progress (matches books in "Read" shelf)
- [ ] Reading goal progress bar fills to correct percentage
- [ ] Empty states display when no favorites or no goal set
- [ ] Shelves section shows all user shelves with counts
- [ ] ProfileHeader shows "Edit Profile" button on own profile
- [ ] ProfileHeader shows FollowButton on other users' profiles (Phase 4 will implement)
- [ ] Page is responsive (mobile, tablet, desktop viewports)
- [ ] Dark mode works correctly on all components
- [ ] SEO metadata appears in page source (title, description, OG tags)
- [ ] All links navigate correctly (books, shelves)
- [ ] Images load with proper lazy loading
- [ ] No console errors or warnings

## Notes

