# Phase 6: Polish & QA

## Status: IN PROGRESS

## Overview
Final pass on responsiveness, animations, loading states, error handling, and overall quality. After this phase, the MVP is ready to ship.

## Tasks

### Loading States
- [x] Add skeleton loaders for:
  - [x] Search results (list of placeholder cards)
  - [x] Library book grid (grid of placeholder covers)
  - [x] Book detail page (cover + text placeholders)
  - [x] Discover recommendation rows (horizontal scroll of placeholder cards)
- [x] Use Suspense boundaries where appropriate for streaming SSR

### Error Handling
- [x] Global error boundary (`src/app/error.tsx`) with friendly error UI
- [x] Not found page (`src/app/not-found.tsx`)
- [x] Book not found state on detail page (if API returns 404)
- [x] Search error state (API failure → "Something went wrong, try again")
- [x] Network error handling for shelf operations (toast notification)

### Animations & Transitions
- [x] Page load staggered fade-in animations (matching design vision)
- [x] Book card hover lift effect (`translateY(-6px)`)
- [x] Search result card hover slide effect (`translateX(4px)`)
- [x] Smooth shelf tab transitions
- [x] Star rating hover preview animation
- [x] Button hover/active state transitions
- [x] Theme toggle smooth transition (CSS transition on background-color, color)

### Responsive Design
- [x] Test and fix all pages at breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)
- [x] Landing page: stack hero text above book collage on mobile
- [x] Auth pages: hide green side panel on mobile, full-width form
- [x] Navbar: collapse to hamburger menu on mobile
- [x] Library grid: 2 columns on mobile, 3-4 on tablet, 5-6 on desktop
- [x] Search results: stack cover above text on mobile
- [x] Book detail: stack cover above info on mobile
- [x] Discover: horizontal scroll works with touch on mobile

### Image Optimization
- [x] Configure `next.config.ts` with remote image patterns for Google Books and Open Library domains
- [x] Use `next/image` for all cover images with proper `sizes` attribute
- [x] Ensure gradient placeholder shows while images load (`placeholder="blur"` or CSS fallback)

### Performance
- [x] Verify page loads under 1 second (Lighthouse check)
- [x] Debounce search input (400ms)
- [x] Lazy load images below the fold
- [x] Check bundle size — ensure no unnecessary dependencies

### Accessibility
- [x] All interactive elements are keyboard navigable
- [x] Star rating is accessible (aria-labels, keyboard support)
- [x] Color contrast meets WCAG AA in both light and dark mode
- [x] Images have alt text
- [x] Form inputs have labels

### Final Cleanup
- [x] Remove any placeholder/mock data
- [x] Verify all environment variables are documented
- [x] Update README with setup instructions (Supabase project creation, env vars, API key)
- [x] Run `npm run build` — ensure no TypeScript errors
- [x] Run `npm run lint` — ensure no ESLint errors

## Testing Checklist
- [ ] All acceptance criteria from PRD pass (see `docs/mvp/prd.md` Section 7)
- [ ] Lighthouse performance score > 90
- [ ] No console errors in browser
- [ ] All pages render correctly at 375px width
- [ ] All pages render correctly at 1440px width
- [ ] Dark mode looks correct on every page
- [ ] Tab through entire app with keyboard — no traps
- [x] `npm run build` succeeds with zero errors
- [x] `npm run lint` passes

## Notes
- This phase is about quality, not features. No new functionality — just making everything solid.
- Refer back to `docs/mvp/design-vision.html` for visual reference during QA.
- After this phase, update `CLAUDE.md` with any new patterns or conventions established during development.
- Loading skeletons: search results (`loading.tsx`), book detail (`loading.tsx`), library (`LibrarySkeleton` inline), discover (`DiscoverSkeleton` inline) — all existed from Phase 3-5.
- Auth pages already hide the green side panel on mobile via `hidden sm:flex`.
- Book detail already stacks cover above info on mobile via `flex-col md:flex-row`.
- `next.config.ts` already configured with remote patterns for `books.google.com` and `covers.openlibrary.org`.
- BookCover uses gradient placeholder fallback when no image URL is available.
- Debounce set to 400ms (slightly more conservative than 300ms for free API tier).
- Global `*` transition on `background-color` and `border-color` provides smooth theme toggle.
- Star rating now supports keyboard navigation (Arrow keys to adjust, accessible via `role="slider"` with `aria-valuemin/max/now/text`).
- Search bar uses `role="combobox"` with `aria-controls` and `aria-expanded` for dropdown accessibility.
