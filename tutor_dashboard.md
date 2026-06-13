# Tutor Dashboard — Full Documentation

## Overview

The Tutor Workspace is the instructor dashboard at `/tutor/*`. Role-gated via `ProtectedRoute` requiring `UserRole.INSTRUCTOR`. All pages are lazy-loaded with `Suspense` and wrapped in `SharedDashboardLayout`.

**Routes file:** `pages/tutor/TutorRoutes.tsx` (23 routes)  
**Auth guard:** `ProtectedRoute` with `allowedRoles={[UserRole.INSTRUCTOR]}`  
**Fallback (unauthorized):** `/dashboard`

---

## Pages

### 1. Tutor Dashboard Home (`/tutor`)
**File:** `pages/tutor/TutorDashboardHome.tsx`

**Purpose:** Main landing page — stats cards, revenue/enrollment/funnel/quiz charts, recent courses, upcoming events.

**API Calls (parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourses()` | `src/api/courses` | Load all courses (filter by ownership) |
| `eventsApi.getEvents(1, pageSize)` | `src/api/events` | Load events (filter by ownership) |
| `authApi.getProfile()` | `src/api/auth` | Get tutor profile for ownership filtering |
| `analyticsApi.getTutorDashboard()` | `src/api/analytics` | Dashboard metrics (enrollments per course) |
| `analyticsApi.getTutorRevenue('month')` | `src/api/analytics` | Monthly revenue data |
| `analyticsApi.getTutorQuizStats()` | `src/api/analytics` | Quiz pass/fail stats |
| `analyticsApi.getTutorEnrollmentFunnel()` | `src/api/analytics` | Enrollment funnel stages |

**Components Rendered:**
- `WelcomeBanner` from `@/components/dashboard/WelcomeBanner`
- `Chart` (line chart for revenue, bar charts for enrollments/funnel, pie chart for quiz)
- `Badge`, `Link`

**Features:**
- Welcome greeting with tutor's first name
- **4 Stat cards** — My Courses count, Published count, Events count, Drafts count (computed dynamically)
- **Revenue Trends** — line chart (last 6 months)
- **Student Signups** — bar chart (monthly enrollment counts)
- **Course Lifecycle Funnel** — bar chart (enrollment stages)
- **Global Quiz Metrics** — pie chart (pass/fail) with total/passed counters
- **Recent Courses** — last 4 updated (with material counts)
- **Upcoming Sessions** — next 4 events (with registration/capacity)
- Filters courses/events by tutor ownership via profile comparison
- Loading states per section

---

### 2. Courses (`/tutor/courses`)
**File:** `pages/tutor/TutorCoursesPage.tsx`

**Purpose:** Course management listing — search, filter, sort, publish/unpublish.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourses(page, pageSize, category, level, search, ordering, isPublished)` | `src/api/courses` | Paginated course list |
| `coursesApi.togglePublish(courseId)` | `src/api/courses` | Publish/unpublish toggle |
| `authApi.getProfile()` | `src/api/auth` | Filter courses by tutor ownership |

**Components Rendered:**
- `Table`, `Badge`, `Button`, `Input`, `Progress`
- Filter panel with animated expand

**Features:**
- Loads all courses, filters to tutor-owned via profile comparison
- **Summary stats** — Published count, Draft count, total Modules, total Materials
- **Search** by title/description/category
- **Filter panel** — status (published/draft), category, level (Beginner/Intermediate/Advanced), ordering
- **Striped table** — thumbnail, title, category/level, published/draft badge, verified badge, price, modules/materials counts with readiness progress bar, date
- **Inline publish/unpublish** with verification check

---

### 3. Create Course (`/tutor/courses/create`)
**File:** `pages/tutor/TutorCreateCoursePage.tsx`

**Purpose:** Thin wrapper around admin's `CreateCoursePage`.

**API Calls:** None directly (delegated to admin component)

---

### 4. Edit Course (`/tutor/courses/:id/edit`)
**File:** `pages/tutor/TutorEditCoursePage.tsx`

**Purpose:** Thin wrapper around admin's `EditCoursePage`.

**API Calls:** None directly (delegated to admin component)

---

### 5. Course Detail (`/tutor/courses/:id`)
**File:** `pages/tutor/TutorCourseDetailPage.tsx`

**Purpose:** Comprehensive course detail — info, curriculum, enrollments, analytics (dashboard, funnel, quiz stats, ratings).

**API Calls (parallel):**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourse(id)` | `src/api/courses` | Main course data |
| `coursesApi.getCourseEnrollments(id, page, pageSize)` | `src/api/courses` | Enrollment list |
| `coursesApi.togglePublish(id)` | `src/api/courses` | Publish/unpublish |
| `analyticsApi.getTutorDashboard()` | `src/api/analytics` | Dash metrics (filtered per course) |
| `analyticsApi.getTutorEnrollmentFunnel()` | `src/api/analytics` | Funnel data (filtered per course) |
| `analyticsApi.getTutorQuizStats()` | `src/api/analytics` | Quiz stats (filtered per course) |
| `analyticsApi.getTutorRatings()` | `src/api/analytics` | Ratings (filtered per course) |
| `quizzesApi.getQuizzes(moduleId)` | `src/api/quizzes` | Quizzes per module |

**Components Rendered:**
- `Badge`, `Button`, `Progress`, `Chart` (bar chart for funnel, pie chart for quiz)

**Features:**
- Publish/draft badge with toggle button
- Price, modules count, enrollments, completion rate
- Quiz pass rate, avg rating, reviews, submissions
- Curriculum readiness progress bar
- Expandable module listings with materials/quiz links
- Recent learners sidebar
- Analytics: enrollment funnel bar chart, quiz performance pie chart, ratings summary

---

### 6. Course Materials (`/tutor/courses/:id/materials`)
**File:** `pages/tutor/TutorCourseMaterialsPage.tsx`

**Purpose:** Wrapper around admin's `MaterialsPage`.

**API Calls:** None directly (delegated to admin component)

---

### 7. Delete Course (`/tutor/courses/:id/delete`)
**File:** `pages/tutor/TutorCourseDeletePage.tsx`

**Purpose:** Confirmation page for deleting a course.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourse(id)` | `src/api/courses` | Load course for display |
| `coursesApi.deleteCourse(id)` | `src/api/courses` | Delete course |

**Components Rendered:**
- `Button` (destructive + outline), `useToast`

**Features:**
- Loads course title, shows warning card
- "Permanently Delete" triggers delete
- "Keep Course" navigates back
- Success/error toasts, redirect to course list

---

### 8. Quizzes (`/tutor/quizzes`)
**File:** `pages/tutor/TutorQuizzesPage.tsx`

**Purpose:** Quiz listing with search, course/module filters, navigation to results.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `quizzesApi.getQuizzes()` | `src/api/quizzes` | All quizzes |
| `coursesApi.getCourses(1, 100)` | `src/api/courses` | Courses with modules for context |

**Components Rendered:**
- `Table`, `Badge`, `Button`, `Input`, `useLocalStorage`, `useToast`

**Features:**
- Search across quiz/course/module names
- Filter by course + module
- **Summary stats** — Total Quizzes, unique Modules, Submissions
- **Results table** — Quiz title, course/module badges, question count, created date, Results link
- "New Quiz" requires course selected
- State persisted in localStorage

---

### 9. Create Quiz (`/tutor/courses/:courseId/quiz/create`)
**File:** `pages/tutor/TutorCreateQuizPage.tsx`

**Purpose:** Full quiz creation form with question builder.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourses()` | `src/api/courses` | Course dropdown |
| `coursesApi.getModules(courseId)` | `src/api/courses` | Module dropdown |
| `quizzesApi.createQuiz(quizData)` | `src/api/quizzes` | Create quiz with questions |

**Components Rendered:**
- `QuestionBuilder` from `components/quiz/QuestionBuilder`
- `Button`, `Input`, `Textarea`, `Badge`, `useLocalStorage`

**Features:**
- Pre-selects course/module from URL params
- Form and questions persisted in localStorage
- Dynamic question list: add/remove, each with `QuestionBuilder`
- Validation: course/module/title required, questions must have text, ≥2 options, ≥1 correct
- On success: resets form, navigates after 1.5s
- Info note: "5 randomized per attempt, 60% to unlock next module"

---

### 10. Quiz Results (`/tutor/quizzes/:quizId/results` and `/tutor/courses/:courseId/quiz/:quizId/results`)
**File:** `pages/tutor/TutorQuizResultsPage.tsx`

**Purpose:** Detailed quiz results — aggregate stats, sortable student performance table.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `quizzesApi.getQuiz(quizId)` | `src/api/quizzes` | Quiz metadata |
| `quizzesApi.getQuizResults(quizId)` | `src/api/quizzes` | All student results |

**Features:**
- Breadcrumb navigation
- Header: quiz title, description, module badge
- **Stats cards** — Total Attempts, Average Score (color-coded), Highest/Lowest scores
- **Student table** — sortable (Date/Score/Name), ascending/descending toggle
- Color-coded scores (≥80% green, ≥60% yellow, <60% red)
- Performance bars per student

---

### 11. Students (`/tutor/students`)
**File:** `pages/tutor/TutorStudentsPage.tsx`

**Purpose:** Comprehensive student management — enrollment list, search/filter, progress modal with analytics, send notifications.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourses(1, 100)` | `src/api/courses` | Course list for filter |
| `coursesApi.getCourseEnrollments(courseId, 1, 100)` | `src/api/courses` | Enrollments per course |
| `coursesApi.getCourse(courseId)` | `src/api/courses` | Course info (in modal) |
| `coursesApi.getCourseProgress(courseId)` | `src/api/courses` | Student progress (in modal) |
| `quizzesApi.getQuizResults(quizId)` | `src/api/quizzes` | Quiz results (in modal) |

**Components/Modals Rendered:**
- `StudentProgressModal` (inline custom modal)
- `SendNotificationModal` from `../admin/components/SendNotificationModal`
- `Chart` (pie chart for quiz performance in modal)
- `Card`, `Badge`, `Button`, `Input`

**Features:**
- **Student search** by name/email
- **Course filter** dropdown
- **Broadcast button** — send notification to all or course-filtered students
- **Enriched table** — avatar, name, email, course badge, enrollment date, actions (Message, View Analytics, View Progress)
- **StudentProgressModal** — student info, course progress bar, per-module completion, quiz performance pie chart, recent attempts (last 5)

---

### 12. Analytics (`/tutor/analytics`)
**File:** `pages/admin/pages/TutorAnalyticsPage.tsx`

**Purpose:** Full analytics dashboard (shared from admin).

**API Calls:** `analyticsApi.getTutorDashboard`, `analyticsApi.getTutorRevenue`, `analyticsApi.getTutorQuizStats`, `analyticsApi.getTutorEnrollmentFunnel`, `analyticsApi.getTutorRatings`

---

### 13. Notifications (`/tutor/notifications`)
**File:** `pages/tutor/TutorNotificationsPage.tsx`

**Purpose:** Notification management — list, filter, send modal, mark-as-read, delete.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `notificationsApi.getNotifications(page, pageSize, unreadOnly)` | `src/api/notifications` | Paginated list |
| `notificationsApi.markAsRead(id)` | `src/api/notifications` | Mark single read |
| `notificationsApi.markAllAsRead()` | `src/api/notifications` | Mark all read |
| `notificationsApi.deleteNotification(id)` | `src/api/notifications` | Delete notification |

**Components/Modals Rendered:**
- `Pagination`
- `SendNotificationModal` (with `userRole="TUTOR"`)

**Features:**
- "Send Notification to Students" button opens modal
- Filter: All / Unread
- Mark All Read (appears when unread > 0)
- Type-colored icons
- Unread amber highlight
- Pagination (15 per page)

---

### 14. Profile (`/tutor/profile`)
**File:** `pages/tutor/TutorProfilePage.tsx`

**Purpose:** Wrapper around `WorkspaceProfilePage` with "Tutor" role.

**API Calls:** None (delegated to `WorkspaceProfilePage`)

---

### 15. Settings (`/tutor/settings`)
**File:** `pages/tutor/TutorSettingsPage.tsx`

**Purpose:** Wrapper around `WorkspaceSettingsPage` with "Tutor" role.

---

### 16. Shared Pages
| Route | File | Purpose |
|-------|------|---------|
| `/tutor/notifications/:id` | `pages/shared/NotificationDetailPage.tsx` | Notification detail |
| `/tutor/support` | `pages/shared/SupportPage.tsx` | Support tickets |
| `/tutor/community` | `pages/dashboard/pages/CommunityPage.tsx` | Community page |

---

## Data Flow

1. **Course CRUD:** Create (admin wrapper) → Edit (admin wrapper) → Detail (analytics + enrollment) → Delete (confirmation page)
2. **Quiz Creation:** Select course → Select module → Build questions via `QuestionBuilder` → Create → Results visible per student
3. **Student Monitoring:** Student list → Progress modal → Per-module completion, quiz performance, recent attempts
4. **Notification:** Send via modal to individual students or broadcast to course → Students receive and can reply
