# Dashboard State Persistence Plan

This document outlines which dashboard pages should persist user state across browser refreshes using `useLocalStorage`. Pages are grouped by priority based on impact of data loss.

## Already Persisted

| Page | Route(s) | What's Persisted |
|------|----------|------------------|
| SupportPage | `/dashboard/support`, `/admin/support`, etc. | Selected ticket ID |
| CreateCourseWizard | `/admin/courses/create`, `/super-admin/courses/create` | Form data + current wizard step |
| CoursePlayerPage | `/dashboard/course/:id` | Sidebar open state |

---

## Priority 1 — Multi-step Forms & Wizards

Data loss here is most painful — users invest significant time filling in multiple fields across steps or rows.

### 1. TakeQuizPage (`/dashboard/quiz/:quizId/take`)

**What to persist:** Current question index, answers array, attempt state.

A student taking a quiz could lose all progress on refresh. Persisting the in-progress answers and current question prevents forced restarts.

### 2. TutorCreateQuizPage (`/tutor/courses/:courseId/quiz/create`)

**What to persist:** Quiz metadata (title, description, course/module selection) + full questions array with options/answers.

Building a quiz with multiple questions is time-consuming. A refresh should restore all created questions and their configurations.

### 3. ContributorCreateUsersPage (`/contributor/create-users`)

**What to persist:** Users list array (name, email, role, LGA, country for each row).

Bulk user creation involves adding multiple rows of data. Losing this on refresh forces re-entry of all rows.

### 4. EditCoursePage (`/admin/courses/:id/edit`, `/super-admin/courses/:id/edit`, `/tutor/courses/:id/edit`)

**What to persist:** All form fields (title, description, fees, category, level, thumbnail, publish status).

Course edits can be lengthy. Persisting the form prevents loss of unsaved changes.

### 5. CreateEventPage / EditEventPage (`/admin/events/create`, `/admin/events/:id/edit`, etc.)

**What to persist:** All form fields (title, description, date, type, location, fees, capacity, organizers, image).

Event creation/editing involves many fields across a single form. Persist to avoid losing all input on accidental navigation.

### 6. CreateUserPage / SuperAdminCreateUserPage (`/admin/users/create`, `/super-admin/users/create`)

**What to persist:** Form data (username, email, full_name, password, phone, role, active status).

User creation forms have multiple required fields. Persist to survive refresh.

### 7. AdminSendNotificationsPage / AdminEmailNotificationsPage (`/admin/notifications/send`, `/admin/notifications/email`)

**What to persist:** Target type (individual/course/all), recipient/course selection, title, message body, email subject/body.

Notification/email composition can involve significant text. Unsaved drafts should persist.

### 8. ProfilePage / WorkspaceProfilePage (all dashboards)

**What to persist:** Form fields (name, email, phone, address, country/state/city, bio), editing mode toggle.

Profile forms are present across all roles (`/dashboard/profile`, `/admin/profile`, `/tutor/profile`, etc.). Persisting prevents loss of profile edits.

---

## Priority 2 — Tabbed Interfaces

Active tab position should survive refresh so users return to the same view.

### 1. SettingsPage / WorkspaceSettingsPage (all dashboards)

**What to persist:** Active tab (profile / security / notification preferences / system).

Present across every role (`/dashboard/settings`, `/admin/settings`, `/tutor/settings`, `/influencer/settings`, `/contributor/settings`). Users frequently switch between tabs; the active one should persist.

### 2. ProgressPage (`/dashboard/progress`)

**What to persist:** Active tab ("Courses" / "Insights").

Student progress page has two tabbed views. The active tab should persist so students return to their last view.

### 3. ReportsPage (`/admin/reports`, `/super-admin/reports`)

**What to persist:** Active report tab (platform / users / courses / revenue / events / ratings) + time range selection.

Admin reports have multiple tabs and a time range selector. Both should persist across refresh.

### 4. InfluencerCampaignsPage (`/influencer/campaigns`)

**What to persist:** Active tab (overview / links / history / charts).

Campaign workspace has multiple tabbed views. Active tab should survive refresh.

### 5. InfluencerAnalyticsPage (`/influencer/analytics`)

**What to persist:** Active tab (overview / monthly / codes / referees / charts).

Analytics page with deep tab navigation. Active tab should persist.

---

## Priority 3 — Search / Filter / Pagination

Users browsing lists benefit from returning to the same page, search, and filter state.

### 1. AllCoursesPage (`/dashboard/courses/all`)

**What to persist:** Search query, category filter, level filter, sort ordering, current page, show filters toggle.

Course catalog with 4+ filter dimensions. Users browse extensively; losing filters on refresh is frustrating.

### 2. CoursesPage (`/dashboard/courses`)

**What to persist:** Search query, status filter, current page, show filters toggle.

Enrolled courses list with search and status filter. Pagination and search should persist.

### 3. CourseListingPage (`/admin/courses`, `/super-admin/courses`)

**What to persist:** Search query, category/level/status filters, sort ordering, view mode (grid/list), current page, filter panel open state.

Course management with comprehensive filtering. Losing all filters on refresh forces re-configuration.

### 4. UsersPage (`/admin/users`, `/super-admin/users`)

**What to persist:** Search query, role filter, status filter, view mode (grid/list), current page, show filters toggle.

User management with role/status filters and view mode. All filter state should persist.

### 5. TransactionsPage (`/dashboard/transactions`)

**What to persist:** Search query, status filter, type filter, current page, show filters toggle.

Transaction history with multiple filter dimensions. Users often need to review transactions across sessions.

### 6. EventsPage (`/dashboard/events`, `/admin/events`, `/super-admin/events`)

**What to persist:** Search query, type/status filter, current page, show filters toggle.

Events browsing with search and filter. Pagination and filters should persist.

### 7. NotificationsPage (student: `/dashboard/notifications`)

**What to persist:** Filter (all/unread), type filter, search query, current page, show filters/show search/show preferences modal toggles.

Notifications with multiple view options and modals. Filter/search state should survive refresh.

### 8. AdminNotificationsPage / SuperAdminNotificationsPage (`/admin/notifications`, `/super-admin/notifications`)

**What to persist:** Filter (all/unread), type filter, current page, send notification modal open state.

Admin notification list with filters. Filter state should persist.

### 9. TutorQuizzesPage (`/tutor/quizzes`)

**What to persist:** Search query, course filter, module filter, show filters toggle.

Quiz management with course/module drill-down filters. All filter state should persist.

### 10. ReviewManagementPage (`/admin/reviews`, `/super-admin/reviews`)

**What to persist:** Course filter, user filter, rating filter, status filter, sort ordering, current page.

Review management with 4+ filter dimensions. All filter/sort/pagination state should persist.

### 11. MyRegistrationsPage (`/dashboard/registrations`)

**What to persist:** Search query, filter, current page, show filters toggle.

Event registrations list with search and filter. Pagination should persist.

### 12. TutorStudentsPage (`/tutor/students`)

**What to persist:** Search query.

Student list with search. Search query should persist.

### 13. ContributorMyUsersPage (`/contributor/my-users`)

**What to persist:** Search query.

Created users list with search. Search query should persist.

---

## Implementation Pattern

All persistence uses the existing `useLocalStorage<T>` hook at `@/hooks/useLocalStorage`:

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Replace useState with useLocalStorage
const [formData, setFormData] = useLocalStorage<FormType>('unique_key', initialValue);
const [currentStep, setCurrentStep] = useLocalStorage('unique_key_step', 0);
```

**Key:** Use a unique localStorage key per page (e.g., `course_create_wizard_data`). Clear on successful submit to avoid stale data on next visit.
