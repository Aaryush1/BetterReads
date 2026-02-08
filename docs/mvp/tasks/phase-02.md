# Phase 2: Authentication

## Status: IN PROGRESS

## Overview
Implement sign up, log in, log out, and route protection. After this phase, users can create accounts and access protected pages. Unauthenticated users are redirected to login.

## Tasks

### Auth Pages
- [x] Build login page (`src/app/(public)/login/page.tsx`) matching design vision: split layout with green panel + literary quote + form
- [x] Build signup page (`src/app/(public)/signup/page.tsx`) with same layout, "Create account" form
- [x] Build shared AuthForm component (email + password inputs, submit button, toggle link between login/signup)
- [x] Handle form submission with server actions + Supabase server client:
  - [x] `signInWithPassword()` for login (via `src/app/(public)/login/actions.ts`)
  - [x] `signUp()` for signup (via `src/app/(public)/signup/actions.ts`)
- [x] Display inline error messages (invalid credentials, email taken, weak password) via `useActionState`
- [x] Redirect to `/library` on successful auth

### Proxy & Route Protection
- [x] Update `src/lib/supabase/middleware.ts` (used by `src/proxy.ts`):
  - [x] Create Supabase server client
  - [x] Call `getUser()` to check session
  - [x] Refresh session tokens in cookies
  - [x] Redirect unauthenticated users from protected routes to `/login`
  - [x] Redirect authenticated users from `/login` and `/signup` to `/library`
- [x] Define route matchers for protected paths (`/library`, `/search`, `/book/:id`, `/discover`)

### Logout
- [x] Add logout action to Navbar avatar (dropdown menu with email + sign out button)
- [x] Create signout API route (`src/app/auth/signout/route.ts`) — calls `supabase.auth.signOut()`, redirects to `/`

### User Context
- [x] Fetch user server-side in `(app)/layout.tsx` via Supabase server client, pass to Navbar as prop
- [x] Display user initial in Navbar avatar (first letter of email)

## Testing Checklist
- [ ] New user can sign up with email and password
- [ ] Existing user can log in
- [ ] Invalid credentials show error message
- [ ] After login, user lands on `/library`
- [ ] Visiting `/library` while logged out redirects to `/login`
- [ ] Visiting `/login` while logged in redirects to `/library`
- [ ] Logout clears session and redirects to landing page
- [ ] Session persists across page refresh (cookie-based)
- [ ] Auth pages render correctly in both light and dark mode
- [ ] Auth pages are responsive on mobile

## Notes
- For MVP, we use email/password auth only. OAuth (Google, GitHub) can be added later.
- Supabase email confirmation can be disabled in project settings for faster dev iteration, then re-enabled for production.
- Auth uses server actions with `useActionState` (React 19) for inline error display — no client-side Supabase calls for auth.
- Signout uses a server-side API route (`/auth/signout`) that calls `supabase.auth.signOut()` and redirects.
- Route protection logic lives in `src/lib/supabase/middleware.ts`, called by `src/proxy.ts` (Next.js 16 proxy convention).
- User data is fetched server-side in `(app)/layout.tsx` and passed to Navbar as a prop — no client-side auth state needed.
