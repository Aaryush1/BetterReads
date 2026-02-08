# Phase 4: Profile Editing

## Status: NOT STARTED

## Tasks

### Profile Edit Page
- [ ] Create `src/app/(app)/profile/edit/page.tsx` (Server Component)
- [ ] Get current user from session
- [ ] Redirect to login if not authenticated
- [ ] Fetch current user's profile
- [ ] If no profile exists, show create profile flow
- [ ] Render ProfileEditForm component with current data

### Profile Edit Form
- [ ] Create `src/components/profile/ProfileEditForm.tsx` (Client Component)
- [ ] Create form with fields: display_name, bio, location
- [ ] Add textarea for bio (max 500 characters with counter)
- [ ] Add genre selector (checkboxes or multi-select for favorite genres)
- [ ] Use `useActionState` hook for form submission
- [ ] Show inline validation errors
- [ ] Show loading state during save (disable form, show spinner)
- [ ] Show success message after save
- [ ] Redirect to profile page after successful save

### Favorite Books Selector
- [ ] Create `src/components/profile/FavoriteBooksSelector.tsx` (Client Component)
- [ ] Show current favorite books (up to 5)
- [ ] Add search input to search for books (use Google Books API)
- [ ] Display search results in dropdown/modal
- [ ] Click book to add to favorites (max 5)
- [ ] Show "Remove" button on each favorite
- [ ] Allow drag-and-drop reordering of favorites (optional: can be manual order input)
- [ ] Save order_position when saving form

### Reading Goal Setter
- [ ] Create `src/components/profile/ReadingGoalSetter.tsx` (Client Component)
- [ ] Display current reading goal if exists
- [ ] Show input for target_books (number input)
- [ ] Year auto-set to current year (2026)
- [ ] Show current progress: "You've read X books so far this year"
- [ ] Allow updating goal
- [ ] Allow removing goal (set to null)

### Server Actions
- [ ] Create `src/app/(app)/profile/actions.ts`
- [ ] Implement `updateProfile(formData)` Server Action
  - Get current user from session
  - Validate all inputs (display_name required, bio max 500 chars, etc.)
  - Call updateProfile query function
  - Return success or error
  - Call revalidatePath('/profile/[username]')
- [ ] Implement `setReadingGoal(year, targetBooks)` Server Action
  - Validate inputs (year valid, targetBooks > 0)
  - Call setReadingGoal query function
  - Revalidate profile page
- [ ] Implement `addFavoriteBook(bookId, bookData, position)` Server Action
  - Check user has < 5 favorites
  - Insert favorite with order_position
  - Revalidate profile page
- [ ] Implement `removeFavoriteBook(bookId)` Server Action
  - Delete favorite
  - Revalidate profile page
- [ ] Implement `reorderFavorites(bookIds[])` Server Action
  - Update order_position for all provided bookIds
  - Revalidate profile page

### Navigation
- [ ] Update ProfileHeader to show "Edit Profile" button when viewing own profile
- [ ] Link button to `/profile/edit`
- [ ] Add "Cancel" button in edit form to go back to profile view

## Testing Checklist

- [ ] Profile edit page loads with current user's data pre-filled
- [ ] Can update display_name successfully
- [ ] Can update bio (up to 500 characters)
- [ ] Bio character counter updates as user types
- [ ] Bio validation prevents > 500 characters
- [ ] Can update location
- [ ] Can select/deselect favorite genres
- [ ] Genre selection updates in form
- [ ] Can search for books using search input
- [ ] Search results display correctly with cover, title, authors
- [ ] Can add book to favorites (up to 5 max)
- [ ] Cannot add more than 5 favorites (error message shown)
- [ ] Can remove favorite book
- [ ] Can reorder favorite books (drag-and-drop or manual)
- [ ] Order persists after save
- [ ] Can set reading goal (target_books input)
- [ ] Reading goal validation (must be positive number)
- [ ] Current progress displays accurately
- [ ] Can update existing reading goal
- [ ] Can remove reading goal
- [ ] Form submission shows loading state
- [ ] Success message displays after save
- [ ] Redirects to profile page after save
- [ ] Profile page shows updated data
- [ ] All server actions handle errors gracefully
- [ ] Form shows inline validation errors
- [ ] Cancel button returns to profile without saving
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Dark mode works correctly

## Notes

