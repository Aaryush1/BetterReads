# Phase 6: Polish & QA

## Status: NOT STARTED

## Overview
Final pass on responsiveness, animations, loading states, error handling, and overall quality. After this phase, the MVP is ready to ship.

## Tasks

### Loading States
- [ ] Add skeleton loaders for:
  - [ ] Search results (list of placeholder cards)
  - [ ] Library book grid (grid of placeholder covers)
  - [ ] Book detail page (cover + text placeholders)
  - [ ] Discover recommendation rows (horizontal scroll of placeholder cards)
- [ ] Use Suspense boundaries where appropriate for streaming SSR

### Error Handling
- [ ] Global error boundary (`src/app/error.tsx`) with friendly error UI
- [ ] Not found page (`src/app/not-found.tsx`)
- [ ] Book not found state on detail page (if API returns 404)
- [ ] Search error state (API failure → "Something went wrong, try again")
- [ ] Network error handling for shelf operations (toast notification)

### Animations & Transitions
- [ ] Page load staggered fade-in animations (matching design vision)
- [ ] Book card hover lift effect (`translateY(-6px)`)
- [ ] Search result card hover slide effect (`translateX(4px)`)
- [ ] Smooth shelf tab transitions
- [ ] Star rating hover preview animation
- [ ] Button hover/active state transitions
- [ ] Theme toggle smooth transition (CSS transition on background-color, color)

### Responsive Design
- [ ] Test and fix all pages at breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide)
- [ ] Landing page: stack hero text above book collage on mobile
- [ ] Auth pages: hide green side panel on mobile, full-width form
- [ ] Navbar: collapse to hamburger menu on mobile
- [ ] Library grid: 2 columns on mobile, 3-4 on tablet, 5-6 on desktop
- [ ] Search results: stack cover above text on mobile
- [ ] Book detail: stack cover above info on mobile
- [ ] Discover: horizontal scroll works with touch on mobile

### Image Optimization
- [ ] Configure `next.config.ts` with remote image patterns for Google Books and Open Library domains
- [ ] Use `next/image` for all cover images with proper `sizes` attribute
- [ ] Ensure gradient placeholder shows while images load (`placeholder="blur"` or CSS fallback)

### Performance
- [ ] Verify page loads under 1 second (Lighthouse check)
- [ ] Debounce search input (300ms)
- [ ] Lazy load images below the fold
- [ ] Check bundle size — ensure no unnecessary dependencies

### Accessibility
- [ ] All interactive elements are keyboard navigable
- [ ] Star rating is accessible (aria-labels, keyboard support)
- [ ] Color contrast meets WCAG AA in both light and dark mode
- [ ] Images have alt text
- [ ] Form inputs have labels

### Final Cleanup
- [ ] Remove any placeholder/mock data
- [ ] Verify all environment variables are documented
- [ ] Update README with setup instructions (Supabase project creation, env vars, API key)
- [ ] Run `npm run build` — ensure no TypeScript errors
- [ ] Run `npm run lint` — ensure no ESLint errors

## Testing Checklist
- [ ] All acceptance criteria from PRD pass (see `docs/mvp/prd.md` Section 7)
- [ ] Lighthouse performance score > 90
- [ ] No console errors in browser
- [ ] All pages render correctly at 375px width
- [ ] All pages render correctly at 1440px width
- [ ] Dark mode looks correct on every page
- [ ] Tab through entire app with keyboard — no traps
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes

## Notes
- This phase is about quality, not features. No new functionality — just making everything solid.
- Refer back to `docs/mvp/design-vision.html` for visual reference during QA.
- After this phase, update `CLAUDE.md` with any new patterns or conventions established during development.
