# BetterReads MVP — Product Requirements Document

**Status:** APPROVED
**Created:** 2026-02-08
**Last Updated:** 2026-02-08

---

## 1. Problem Statement

Goodreads is the dominant book tracking platform, but it has stagnated. Avid readers — people who read 20+ books a year — are stuck with a platform that has:

- A dated, cluttered UI that hasn't meaningfully changed in over a decade
- Slow, clunky navigation that makes simple tasks frustrating
- Poor book discovery that doesn't surface relevant recommendations

There is no modern, fast, well-designed alternative for readers who just want to track what they're reading and find their next great book.

## 2. Vision

BetterReads is a modern Goodreads alternative built for avid readers. It should feel like what Goodreads would be if it were built today — fast, beautiful, and focused on the core reading experience.

**Design Direction:** Inspired by Literal and StoryGraph — clean, book-focused, modern.

## 3. Goals (MVP)

- **Book Search** — Users can search for any book using the Google Books API (primary) supplemented by Open Library API, and see clean, relevant results
- **Shelves** — Users can organize books into shelves. Three defaults ("Read", "Currently Reading", "Want to Read") are created on signup, and users can create, rename, and delete custom shelves
- **Ratings** — Users can rate books on a half-star scale (0.5 to 5); ratings are displayed across the app
- **Recommendations** — Users see personalized book recommendations (UI built now, algorithm TBD — will be refined post-MVP)
- **User Accounts** — Users can sign up, log in, and have their shelves persisted via Supabase
- **Modern UI** — The interface should feel fast, polished, and contemporary — a clear upgrade over Goodreads
- **Speed** — Page transitions and interactions should feel instant

## 4. Non-Goals (NOT in MVP)

- Social features (following users, activity feeds, shared lists)
- Written reviews (ratings are in MVP, but text reviews are not)
- Reading stats or annual summaries
- Mobile app (responsive web only)
- Import from Goodreads

## 5. Target User

**Avid readers** who:
- Read 15-50+ books per year
- Currently use Goodreads but are frustrated with the experience
- Want a clean, fast tool to track their reading
- Value good design and modern UX

## 6. User Stories

### Authentication
- As a new user, I can create an account so my reading data is saved
- As a returning user, I can log in and see my shelves exactly as I left them
- As a user, I can log out securely

### Book Search
- As a user, I can search for books by title or author
- As a user, I can see search results with cover image, title, author, rating, and publication year
- As a user, I can click on a search result to see more details about a book

### Book Detail
- As a user, I can view a book's detail page with cover image, title, author, description, page count, and publication info
- As a user, I can add a book to one of my shelves from the detail page
- As a user, I can change which shelf a book is on
- As a user, I can remove a book from my shelves

### Shelves
- As a user, I start with three default shelves: "Read", "Currently Reading", "Want to Read"
- As a user, I can create custom shelves with my own names
- As a user, I can rename or delete custom shelves (default shelves cannot be deleted)
- As a user, I can see how many books are on each shelf
- As a user, I can click into a shelf and see all books on it with their cover images, titles, and my ratings
- As a user, I can quickly move a book between shelves

### Ratings
- As a user, I can rate a book from 0.5 to 5 stars in half-star increments on the book detail page
- As a user, I can see my rating displayed on the book detail page, in my library, and in search results
- As a user, I can change or remove my rating at any time

### Recommendations
- As a user, I see a "Recommended for You" section on the Discover/Explore page
- As a user, I can see why a book was recommended (e.g., "Because you liked X")
- As a user, I can add a recommended book to a shelf directly from the recommendations view
- *Note: Recommendation algorithm is TBD. MVP will use placeholder/simple logic. The UI and data model must be built to support a real algorithm later.*

### Dark Mode
- As a user, the app automatically matches my browser/OS theme preference (light or dark)
- As a user, I can manually toggle between light and dark mode
- As a user, my theme preference persists across sessions

### Navigation & UX
- As a user, I experience fast page loads and smooth transitions
- As a user, the interface is clean, modern, and easy to navigate on both desktop and mobile browsers

## 7. Acceptance Criteria

### Must pass to ship:
- [ ] User can sign up with email and password
- [ ] User can log in and log out
- [ ] User can search for books and see relevant results
- [ ] User can view a book detail page
- [ ] User can add a book to a shelf
- [ ] User can move a book between shelves
- [ ] User can remove a book from a shelf
- [ ] User can view default shelves and custom shelves with book counts
- [ ] User can create, rename, and delete custom shelves
- [ ] User can rate a book 0.5-5 stars in half-star increments
- [ ] User can see their ratings in library, search, and book detail
- [ ] User can change or remove a rating
- [ ] Recommendations UI displays books with reasoning labels
- [ ] User can add a recommended book to a shelf
- [ ] Book cover images are displayed from API data wherever books appear
- [ ] Dark mode auto-detects browser preference (prefers-color-scheme)
- [ ] User can manually toggle light/dark mode
- [ ] Theme preference persists (localStorage)
- [ ] All pages are responsive (mobile + desktop)
- [ ] Page loads feel fast (< 1s for navigation)
- [ ] UI is modern, clean, and visually polished

## 8. Technical Decisions

- **Frontend:** Next.js (App Router) with TypeScript and Tailwind CSS
- **Auth + Database:** Supabase (Postgres + Auth bundled)
- **Book Data:** Google Books API (primary) + Open Library API (supplemental, no key required)
- **Hosting:** Vercel

## 9. Design Direction

**Reference:** See `docs/mvp/design-vision.html` for the full interactive visual mockup.

**Aesthetic:** "Modern Literary" — inspired by Literal and StoryGraph but with the crispness of Linear/Raycast. Clean whites, vibrant emerald accents, punchy amber for ratings. Feels like a modern software product that loves books.

### Typography
- **Display / Headings:** Fraunces (variable serif) — soft, literary, distinctive
- **Body / UI:** Bricolage Grotesque — modern, characterful sans-serif

### Color Palette
| Token         | Hex       | Usage                          |
|---------------|-----------|--------------------------------|
| Surface       | `#F8FAFC` | Page background                |
| White         | `#FFFFFF` | Card/section background        |
| Emerald       | `#059669` | Primary accent, buttons, logo  |
| Green         | `#10B981` | Hover states, vibrant accents  |
| Green Light   | `#D1FAE5` | Active tabs, subtle highlights |
| Amber         | `#F59E0B` | Star ratings, warm accent      |
| Slate 900     | `#0F172A` | Headings, primary text         |
| Slate 600     | `#475569` | Body text, descriptions        |
| Slate 400     | `#94A3B8` | Metadata, placeholders         |
| Slate 200     | `#E2E8F0` | Dividers, input borders        |

### Dark Mode Palette
| Token         | Hex              | Usage                          |
|---------------|------------------|--------------------------------|
| Background    | `#020617`        | Page background                |
| Surface       | `#0F172A`        | Section/card background        |
| Card          | `#1E293B`        | Elevated card background       |
| Emerald       | `#10B981`        | Primary (brighter for dark)    |
| Green Hover   | `#34D399`        | Hover states                   |
| Green Light   | `rgba(16,185,129,0.12)` | Translucent highlights |
| Amber         | `#FBBF24`        | Star ratings (brighter)        |
| Text Primary  | `#F1F5F9`        | Headings, primary text         |
| Text Secondary| `#94A3B8`        | Body text                      |
| Text Tertiary | `#64748B`        | Metadata, placeholders         |
| Border        | `#334155`        | Dividers, input borders        |

**Theme Behavior:** Auto-detect via `prefers-color-scheme` on first visit. Manual toggle available. Preference saved to `localStorage`.

### Key Screens
1. **Landing Page** — Hero with book cover collage, "Your reading life, beautifully organized" headline, feature strip
2. **Auth (Login/Signup)** — Split layout: green panel with literary quote + form panel
3. **Library / Shelves** — App nav with search, shelf tabs with counts, book cover grid with star ratings
4. **Search Results** — List cards with cover image, title, author, description, star rating, "+ Add to shelf" action
5. **Book Detail** — Large cover image with shelf action buttons, interactive star rating, metadata bar, full description
6. **Discover / Recommendations** — Horizontal scroll rows of recommended books with reasoning labels ("Because you liked X"), each with cover image, rating, and quick-add action

### Cover Images
- All book displays use the actual cover image from the Google Books / Open Library API
- Covers use a 2:3 aspect ratio with rounded corners and a realistic book shadow
- A gradient placeholder is shown while covers load or if no image is available

### Design Principles
- Book covers are the primary visual element — large, prominent, with realistic shadow
- Subtle grain texture overlay for tactile warmth
- Staggered fade-in animations on page load
- Pill-shaped buttons and tabs (border-radius: 999px)
- Generous whitespace — content breathes

---

*This PRD is a living document. It will be updated as decisions are made and requirements are refined.*
