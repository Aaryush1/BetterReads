# Phase 2: Authentication

## Status: NOT STARTED

## Overview
Implement sign up, log in, log out, and route protection. After this phase, users can create accounts and access protected pages. Unauthenticated users are redirected to login.

## Tasks

### Auth Pages
- [ ] Build login page (`src/app/login/page.tsx`) matching design vision: split layout with green panel + literary quote + form
- [ ] Build signup page (`src/app/signup/page.tsx`) with same layout, "Create account" form
- [ ] Build shared AuthForm component (email + password inputs, submit button, toggle link between login/signup)
- [ ] Handle form submission with Supabase client:
  - [ ] `signInWithPassword()` for login
  - [ ] `signUp()` for signup
- [ ] Display inline error messages (invalid credentials, email taken, weak password)
- [ ] Redirect to `/library` on successful auth

### Middleware & Route Protection
- [ ] Create `src/middleware.ts`:
  - [ ] Create Supabase server client
  - [ ] Call `getUser()` to check session
  - [ ] Refresh session tokens in cookies
  - [ ] Redirect unauthenticated users from protected routes to `/login`
  - [ ] Redirect authenticated users from `/login` and `/signup` to `/library`
- [ ] Define route matchers for protected paths (`/library`, `/search`, `/book/:id`, `/discover`)

### Logout
- [ ] Add logout action to Navbar avatar (dropdown or direct button)
- [ ] Call `supabase.auth.signOut()`, redirect to `/`

### User Context
- [ ] Create a way to access the current user in server components (via Supabase server client in each page)
- [ ] Display user initial in Navbar avatar

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
