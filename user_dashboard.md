# User Dashboard — Full Documentation

## Overview

The User Dashboard is the student/learner workspace at `/dashboard/*`. It is role-gated via `StudentRoute` (requires `UserRole.LEARNER`). All pages are wrapped in `SharedDashboardLayout` with an `ErrorBoundary`.

**Routes file:** `pages/dashboard/DashboardRoutes.tsx`  
**Layout:** `SharedDashboardLayout` from `components/layout`  
**Auth guard:** `StudentRoute` from `components/ProtectedRoute`

---

## Pages

### 1. Dashboard Home (`/dashboard`)
**File:** `pages/dashboard/pages/DashboardHome.tsx`

**Purpose:** Main landing page — overview of learning activity, metrics, announcements, continue learning, recommended courses, and upcoming events.

**API Calls (all in parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getEnrollments()` | `src/api/courses` | Get user's enrollments |
| `coursesApi.getCourses(1, 10)` | `src/api/courses` | Get course catalog (for recommendations) |
| `eventsApi.getEvents(1, 5)` | `src/api/events` | Get upcoming events |
| `notificationsApi.getNotifications(1, 3, false, 'system')` | `src/api/notifications` | Get system announcements |
| `analyticsApi.getStudentDashboardSummary()` | `src/api/analytics` | Dashboard KPIs |
| `analyticsApi.getStudentActivity(7)` | `src/api/analytics` | Last 7 days activity |
| `analyticsApi.getStudentQuizSummary()` | `src/api/analytics` | Quiz pass/fail stats |
| `analyticsApi.getStudentCourseProgress()` | `src/api/analytics` | Course leaderboard |
| `analyticsApi.getStudentEnrollmentSummary()` | `src/api/analytics` | Enrollment by category |
| `analyticsApi.getStudentEventSummary()` | `src/api/analytics` | Event participation stats |

**Components/Modals Rendered:**
- `WelcomeBanner` from `@/components/dashboard/WelcomeBanner`
- `Chart` (line chart for activity, pie chart for quiz pass rate)
- `ThemeLink`, `ButtonLink`, `Button`, `Badge`, `Progress`
- Announcements carousel with auto-rotation (8s interval)
- Course Leaderboard section, Enrollment Summary chips, Event Participation cards

**Features:**
- **Announcement carousel** — cycles through system notifications with gradient backgrounds and action URLs
- **4 Metric cards** — Overall Completion %, Active Courses, Completed, Quizzes Passed (from `dashboardSummary`), with fallback to calculated metrics
- **Weekly Activity chart** — line chart of daily minutes studied (last 7 days)
- **Quiz Pass Rate chart** — pie chart of passed vs failed
- **Course Leaderboard** — top 5 courses by completion % with animated progress bars
- **Enrollment Summary** — chips showing enrollment counts per category
- **Event Participation** — upcoming vs past event counts
- **Active Learning** — up to 2 in-progress enrollments with progress bars, play button
- **Recommended courses** — up to 4 published courses user is not enrolled in, with thumbnail/tutor/price
- **Quick Workspace** — grid links to Achievements, Growth, Payments, Certificates
- **Upcoming Events** — list of next 3 events with date/time/type

---

### 2. My Courses (`/dashboard/courses`)
**File:** `pages/dashboard/pages/CoursesPage.tsx`

**Purpose:** Lists user's enrolled courses with search, filter by status, progress tracking, and balance payment.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getEnrollments(page, pageSize, filters)` | `src/api/courses` | Paginated enrollments with search/status filters |
| `coursesApi.payBalance(enrollmentId)` | `src/api/courses` | Pay outstanding balance |

**Components/Modals Rendered:**
- `Pagination` from `components/ui/Pagination`
- `Progress`, `Badge`, `Button`, `Input`
- `useToast` for notifications
- `useLocalStorage` for persisting search/filter/page state

**Features:**
- **3 stat cards** — In Progress count, Completed count, Balance Due count
- **Search** by course title (debounced 400ms)
- **Filter panel** — All / In Progress / Completed with animated toggle
- **Card grid** per enrollment: status badge, course info, thumbnail, description, progress bar, payment status (Fully Paid / Outstanding Balance with Pay button)
- **Pay Balance** — calls `coursesApi.payBalance()`, redirects to Paystack authorization URL
- **Pagination** (12 per page)
- State persisted in localStorage: search, status filter, page number, filter visibility

---

### 3. Course Catalog (`/dashboard/courses/all`)
**File:** `pages/dashboard/pages/AllCoursesPage.tsx`

**Purpose:** Browse all available courses with advanced filters, course detail modal, and enrollment flow with payment plans and referral codes.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourses(page, pageSize, category, level, search, ordering)` | `src/api/courses` | Paginated course catalog |
| `coursesApi.getEnrollments(1, 100)` | `src/api/courses` | Check which courses user is enrolled in |
| `coursesApi.enroll(courseId, installmentPlan, referralCode, callbackUrl)` | `src/api/courses` | Enroll in course |

**Components/Modals Rendered:**
- **Course Detail Modal** — full course info, instructor bio, curriculum, price, enroll button
- **Enrollment Modal** — fee breakdown (registration/tuition/certificate), payment plan selector (FULL/20%/40%/60%), referral code input, proceed button
- `Pagination`, `Badge`, `Button`, `Input`, `Progress`, `Star`

**Features:**
- **3 stat cards** — Visible Programs, Beginner Friendly, Already Enrolled
- **Search** by title/topic/category (debounced 400ms)
- **Advanced filter panel** — Category dropdown (7 options), Level dropdown (Beginner/Intermediate/Advanced), Sort dropdown (Newest/A-Z/Price low-high/Price high-low)
- **Card grid** per course: badges (Enrolled/Level/Verified), title, instructor, thumbnail, description, rating stars, price, materials count, progress bar (if enrolled), balance display
- **Course Detail Modal** — full course preview with curriculum, instructor info, rating, cost display
- **Enrollment Modal** — fee breakdown, payment plan selector, referral code input, proceeds to Paystack
- State persisted in localStorage across all filter/search/page settings

---

### 4. Course Player (`/dashboard/course/:id`)
**File:** `src/apps/dashboard/pages/CoursePlayerPage.tsx` (804 lines)

**Purpose:** Full interactive course player — consumes materials sequentially module-by-module with prerequisite locking, payment-locked modules, quiz integration, progress tracking, reviews, and tutor messaging.

**Architecture Overview:**

The Course Player is composed of **4 inner components** orchestrated by `CoursePlayerPage`:
| Component | File | Role |
|-----------|------|------|
| `CoursePlayerShell` | `src/apps/dashboard/components/CoursePlayerShell.tsx` | Top-level shell — header bar with course title, progress bar, streak counter, fullscreen toggle, sidebar toggle |
| `SyllabusSidebar` | `src/apps/dashboard/components/SyllabusSidebar.tsx` | Right sidebar — module/material list with lock states, quiz buttons, progress footer, expandable course info sections |
| `ContentStage` | `src/apps/dashboard/components/ContentStage.tsx` | Main content area — renders video/PDF/text material, tabs (Lesson/About Tutor/Message Tutor/Reviews), Mark as Complete button |
| `QuizView` | `src/apps/dashboard/components/QuizView.tsx` | Full quiz-taking experience — timer, anti-cheat, question navigation, result submission |

---

**API Calls:**

| Function | Source | Purpose |
|----------|--------|---------|
| `coursesApi.getCourse(id)` | `src/api/courses` | Load course metadata (title, tutor, modules, price) |
| `coursesApi.getEnrollments()` | `src/api/courses` | Check if user is enrolled |
| `coursesApi.getModuleAccessStatus(enrollmentId)` | `src/api/courses` | Get payment-lock state per module |
| `coursesApi.getModules(courseId)` | `src/api/courses` | Get all modules with their materials |
| `coursesApi.getCourseProgress(courseId)` | `src/api/courses` | Get saved progress percentages |
| `coursesApi.enroll(courseId, plan, refCode, callbackUrl)` | `src/api/courses` | Enroll user (if not enrolled) |
| `coursesApi.payBalance(enrollmentId)` | `src/api/courses` | Pay outstanding balance |
| `progressApi.markMaterialComplete(materialId)` | `src/api/progress` | Mark material as completed |
| `quizzesApi.getQuiz(quizId)` | `src/api/quizzes` | Load quiz metadata |
| `quizzesApi.startQuizAttempt(quizId)` | `src/api/quizzes` | Start a quiz attempt — returns randomized questions |
| `quizzesApi.submitQuizAttempt(attemptId, answers)` | `src/api/quizzes` | Submit answers — returns score |
| `quizzesApi.getMyQuizResults()` | `src/api/quizzes` | Get past quiz results |
| `reviewsApi.getCourseReviews(courseId)` | `src/api/reviews` | Load course reviews |
| `reviewsApi.createReview(courseId, data)` | `src/api/reviews` | Submit a review |
| `notificationsApi.notifyTutor(data)` | `src/api/notifications` | Send message to tutor |

---

**Features — Complete Breakdown:**

#### A. Material Progression & Locking System (2-layer locking)

**Layer 1: Prerequisite Lock (sequential material ordering)**
- All materials across all modules are **flattened into a single sequential list** sorted by `module.order` then `material.order` (via `flattenMaterials()`)
- `isMaterialAccessible(materialId)` — the core lock check:
  ```ts
  const idx = materials.findIndex(m => m.id === materialId);
  if (idx <= 0) return true; // first material always accessible
  const prevMaterial = materials[idx - 1];
  return completedLessons.includes(prevMaterial.id) || !!prevMaterial.is_completed;
  ```
- When user clicks a locked material: toast `"Complete the previous lesson first."` — does not navigate
- Same check in `handleMaterialSelect()` before allowing navigation
- **Keyboard shortcuts** (arrow right / `N` key) also enforce this — if next material is locked, shows `"Complete the current lesson first."`
- Arrow left / `P` key always works for going back to completed materials

**Layer 2: Payment Lock (module-level)**
- `coursesApi.getModuleAccessStatus(enrollmentId)` returns per-module `is_locked` state
- `SyllabusSidebar.isModuleLocked(moduleId)` checks if a module requires additional payment
- If a module is payment-locked:
  - All materials inside show a **Lock icon** (amber background + `Lock` component)
  - A warning banner shows: `"Payment Required — Pay balance to unlock"`
  - Clicking any material in that module: toast `"This module requires additional payment. Please clear your balance."`
  - Quiz button is hidden

**Visual states per material in sidebar (5 states):**
1. **Active (current)** — indigo background, filled circle icon, bold text
2. **Completed** — green checkmark circle, hover green background
3. **Payment-locked** — amber lock icon, amber border, "Locked" badge
4. **Prerequisite-locked** — grey lock icon, muted text, `opacity-50`, cursor-not-allowed
5. **Available (unstarted)** — grey icon with type indicator (video/pdf/text)

#### B. CoursePlayerShell (Header Bar)
- **Exit button** — `<ArrowLeft>` with text, calls `window.history.back()`
- **Course title** — truncated with responsive max-width
- **Progress bar** — animated spring motion, emerald gradient bar with percentage
- **Streak counter** — hidden on small screens, shows flame icon + count
- **Fullscreen toggle** — `document.documentElement.requestFullscreen()` / `exitFullscreen()`
- **Sidebar toggle** — indigo when active, toggles `sidebarOpen` state, state persisted in localStorage

#### C. SyllabusSidebar (Right Panel)
- **Module accordion** — expandable sections with animated chevron; expanded state persisted per course in localStorage
- **Materials list** — scrollable list with type icons, lock states, active/completed indicators
- **Quiz button** — appears at end of module **only after all materials in that module are completed**; links to `/dashboard/course/:courseId/quiz/:quizId`
- **Progress footer** — animated progress bar showing `completedCount/totalMaterials`, certificate earned state with confetti-style gradient
- **Expandable sections** (collapsible):
  - **About Tutor** — avatar, name, email, bio
  - **Message Tutor** — inline form with subject/message, calls `notificationsApi.notifyTutor`, success feedback
  - **Reviews** — list of reviews with star ratings, inline review form at bottom

#### D. ContentStage (Main Content Area)
- **Material renderer** — switches on `material.type`:
  - `video` → `<VideoPlayer>` (custom UI component)
  - `pdf` → `<PDFViewer>` (custom UI component)
  - `text` → `<TiptapRenderer>` (rich text via Tiptap editor)
  - Unknown → "Unknown material type"
- **Tab system** — 4 tabs persistent across materials:
  - **Lesson** — renders the actual material content
  - **About Tutor** — `ExtraSections.AboutTutor` component
  - **Message Tutor** — inline message form (same as sidebar)
  - **Reviews** — `ExtraSections.Reviews` component with star ratings
- **Reading progress** — for non-video materials, tracks scroll position as percentage bar; auto-updates via `requestAnimationFrame` + `ResizeObserver`
- **Mark as Complete button** — emerald colored with 3D shadow effect:
  - On click: fires confetti animation, calls `progressApi.markMaterialComplete(materialId)`
  - Refreshes enrolled state (`refreshEnrolledState`) + course data
  - Shows success toast with completion message: material saved / module completed / course completed
  - If API fails: **optimistic rollback** — removes material from completed list
  - Disabled once completed, shows green checkmark

#### E. QuizView (Full Quiz Mode)
- Replaces entire course player when `activeQuizId` is set
- **Intro screen** — quiz title, question count, time limit, start button
- **Active quiz** — single question at a time with option selection, progress dots, timer countdown
- **Anti-cheat system**:
  - Tracks `visibilitychange` and `window.blur` events → increments `shameCount`
  - After 2 violations → sets status to `'cheating'` and terminates quiz
- **Timer** — auto-submits when time runs out
- **Submission** — `quizzesApi.submitQuizAttempt(attemptId, answers)` → refreshes enrolled state + course data
- **Result screen** — score display with confetti

#### F. Unenrolled View
When user is not enrolled, shows a full course preview page with:
- Course thumbnail/image
- Stats grid (modules, level, category, price)
- Installment plan selector (100% / 60% / 40%)
- Referral code input
- Enroll Now button → calls `coursesApi.enroll` → redirects to Paystack

#### G. Balance Payment Banner
If enrolled with outstanding balance, shows an amber banner at the top:
- Alert triangle icon, balance amount, "Pay Now" button
- Calls `coursesApi.payBalance` → redirects to Paystack

#### H. Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `B` / `S` | Toggle sidebar |
| `F` | Toggle fullscreen |
| `N` / `→` | Next material (if not locked) |
| `P` / `←` | Previous material |
| `Space` / `K` | Play/pause video |

---

**Data Flow — Material Progression:**

```
User completes Material #1
  ↓
progressApi.markMaterialComplete(materialId=1)
  ↓
API returns { detail, module_completed?, course_completed? }
  ↓
refreshEnrolledState() — re-fetches modules, progress, quiz results
  ↓
completedLessons now includes Material #1
  ↓
isMaterialAccessible(Material #2) → true (prev is completed)
  ↓
User can now click Material #2 in sidebar
  ↓
Keyboard 'N' / '→' now navigates to Material #2 instead of showing warning
```

**State Persistence:**
- Current material ID → localStorage (`course_player_material_id_{courseId}`)
- Sidebar open state → localStorage (`course_player_sidebar_open`)
- Module accordion expanded states → localStorage (`course_sidebar_modules_{courseId}`)

---

### 5. Dashboard Quiz (`/dashboard/course/:id/quiz/:quizId`)
**File:** `pages/dashboard/pages/QuizPage.tsx`

**Purpose:** Takes a quiz within a specific course module.

**API Calls:** `quizzesApi.startQuizAttempt`, `quizzesApi.submitQuizAttempt`

**Components Rendered:** `QuizView`, `QuizRules`, `QuizHistory`

---

### 6. Quiz List (`/dashboard/quizzes`)
**File:** `pages/dashboard/pages/QuizListPage.tsx`

**Purpose:** Lists all available/attempted quizzes.

**API Calls:** `quizzesApi.getMyQuizResults`

---

### 7. Take Quiz (`/dashboard/quiz/:quizId/take`)
**File:** `pages/dashboard/pages/TakeQuizPage.tsx`

**Purpose:** Standalone quiz-taking page with timer, question navigation, and submission.

**API Calls:** `quizzesApi.startQuizAttempt`, `quizzesApi.submitQuizAttempt`

---

### 8. Profile (`/dashboard/profile`)
**File:** `pages/dashboard/pages/ProfilePage.tsx`

**Purpose:** View and edit personal profile, upload avatar, manage location info, view stats and ratings, KYC verification status.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `authApi.getProfile()` | `src/api/auth` | Load user profile |
| `authApi.updateProfile(data)` | `src/api/auth` | Save profile edits |
| `authApi.uploadProfilePicture(file)` | `src/api/auth` | Upload avatar |
| `usersApi.getUserRatingProfile(id)` | `src/api/users` | Load tutor/student ratings |
| `coursesApi.getEnrollments()` | `src/api/courses` | Calculate learning stats |
| `countriesApi.getCountries()` | `src/api/countries` | Country dropdown |
| `countriesApi.getStates(country)` | `src/api/countries` | State dropdown |
| `countriesApi.getStateCities(country, state)` | `src/api/countries` | City/LGA dropdown |

**Components/Modals Rendered:**
- `SearchableSelect` from `components/ui/searchable-select`
- `Button`, `Badge`, `Input`
- Camera button for avatar upload
- Verification banner linking to KYC page

**Features:**
- **Profile header** — gradient banner, avatar with upload, verification badge (blue rosette)
- **Identity Verification section** — prompts unverified users to complete NIN KYC
- **Referral Code display** — shows active code with copy-to-clipboard button
- **Edit mode toggle** — switch between view/edit; fields: first name, last name, email, phone, user type, country/state/city (SearchableSelect), address, bio
- **Stats cards** — Courses completed, learning hours, certificates, student rating
- **Ratings section** — tutor rating and student rating from `ratingProfile`
- State persisted in localStorage: edit mode, form data

---

### 9. Settings (`/dashboard/settings`)
**File:** `pages/dashboard/pages/SettingsPage.tsx`

**Purpose:** Thin wrapper around `WorkspaceSettingsPage` configured for "Learner" role.

**API Calls:** None (delegated to `WorkspaceSettingsPage`)

**Features:** Account profile, security, notification preferences, workspace appearance settings.

---

### 10. KYC Verification (`/dashboard/kyc`)
**File:** `pages/dashboard/pages/KYCPage.tsx`

**Purpose:** Identity verification using National Identification Number (NIN).

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `authApi.getProfile()` | `src/api/auth` | Check current verification status |
| `authApi.verifyKYC({ type: 'NIN', id_number })` | `src/api/auth` | Submit NIN for verification |

**Features:**
- Checks if already verified on mount
- NIN input (11-digit validation)
- Loading/success/error states
- Success screen with confirmation message
- Already-verified screen with shield check

---

### 11. Progress & Analytics (`/dashboard/progress`)
**File:** `pages/dashboard/pages/ProgressPage.tsx`

**Purpose:** Learning analytics dashboard with activity chart, quiz summary, enrollment timeline, course-level analytics via modal.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `progressApi.getProgress()` | `src/api/progress` | Overall learning progress |
| `analyticsApi.getStudentActivity(days)` | `src/api/analytics` | Daily activity minutes |
| `analyticsApi.getStudentQuizSummary()` | `src/api/analytics` | Quiz pass/fail stats |
| `analyticsApi.getStudentEnrollmentTimeline()` | `src/api/analytics` | Monthly enrollment timeline |

**Components/Modals Rendered:**
- `Chart` (line chart for activity, pie chart for quiz, line chart for timeline)
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `CourseAnalyticsModal` from `components/dashboard/CourseAnalyticsModal`
- `useLocalStorage` for active tab persistence

**Features:**
- **Tabbed interface** — Courses tab, Analytics tab
- **Activity chart** — line chart of daily minutes (7-day default, toggleable)
- **Quiz summary** — pass/fail pie chart with total attempts
- **Enrollment timeline** — monthly enrollment bar/line chart
- **Course-level analytics** — click any course to open `CourseAnalyticsModal` with detailed stats
- Activity days toggle (7/14/30)

---

### 12. Events (`/dashboard/events`)
**File:** `pages/dashboard/pages/EventsPage.tsx`

**Purpose:** Browse, filter, search events and register.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `eventsApi.getEvents(page, pageSize, type)` | `src/api/events` | Paginated events list |
| `eventsApi.getMyRegistrations()` | `src/api/events` | User's event registrations |
| `eventsApi.registerForEvent(eventId, callbackUrl)` | `src/api/events` | Register for event |

**Components/Modals Rendered:**
- `Pagination`, `Badge`, `Button`, `Input`

**Features:**
- **Filter tabs** — All / Workshop / Webinar / Conference
- **Search** by event title/speaker
- **Filter panel** — type and registration status filters
- **Event cards** — image, title, date/time, type badge, speaker, location (online/in-person), capacity bar, registered badge
- **Register button** — calls `registerForEvent`, redirects to Paystack if payment required
- **Pagination** (12 per page)

---

### 13. Event Detail (`/dashboard/events/:id`)
**File:** `pages/dashboard/pages/EventDetailPage.tsx`

**Purpose:** Full event details page with registration status, action buttons, and registration management.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `eventsApi.getEvent(id)` | `src/api/events` | Event details |
| `eventsApi.getMyRegistrations(1, 100)` | `src/api/events` | Check user registration |
| `eventsApi.registerForEvent(eventId, callbackUrl)` | `src/api/events` | Register/pay for event |

**Components/Modals Rendered:**
- `Button`, `Badge`, `ThemeLink`, `ButtonLink`
- Registration status card with application status badges
- Payment info card if registration requires payment

**Features:**
- **Event info** — title, category badge, date/time, location, capacity, speaker, description, image
- **Registration status** — Not Registered / Pending / Accepted / Rejected with appropriate badges
- **Register/Cancel actions** — register button (with payment flow if paid event)
- **Payment details** — amount, transaction reference, payment date
- **Registration management** — status display with creator info timestamps

---

### 14. My Registrations (`/dashboard/registrations`)
**File:** `pages/dashboard/pages/MyRegistrationsPage.tsx`

**Purpose:** Lists all event registrations with status tracking.

**API Calls:** `eventsApi.getMyRegistrations(page, pageSize)`

**Components/Modals Rendered:** `Pagination`, `Badge`, `Button`

**Features:**
- Paginated list of all registrations
- Status badges (pending/accepted/rejected)
- Links to event detail pages

---

### 15. Registration Detail (`/dashboard/registrations/:id`)
**File:** `pages/dashboard/pages/RegistrationDetailPage.tsx`

**Purpose:** Detailed view of a single event registration.

**API Calls:** `eventsApi.getRegistrationDetail(id)`

---

### 16. Enrollment Detail (`/dashboard/enrollment/:id`)
**File:** `pages/dashboard/pages/EnrollmentDetailPage.tsx`

**Purpose:** Detailed enrollment information page.

**API Calls:** `coursesApi.getEnrollment(id)`

---

### 17. Transactions (`/dashboard/transactions`)
**File:** `pages/dashboard/pages/TransactionsPage.tsx`

**Purpose:** Payment history with search, filters, spending chart, and transaction details.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `ordersApi.getMyTransactions(page, pageSize, status, type)` | `src/api/orders` | Paginated transactions |
| `analyticsApi.getStudentSpendingHistory('month')` | `src/api/analytics` | Monthly spending data |

**Components/Modals Rendered:**
- `Table`, `Badge`, `Button`, `Input`, `Chart` (bar chart for spending)
- `Pagination`

**Features:**
- **Spending chart** — bar chart of last 12 months spending
- **Search** by transaction reference or description
- **Filter panel** — status (completed/pending/failed) and type filters
- **Transaction table** — reference, type, description, amount, status badge, date
- **Row click** — navigates to transaction detail
- **Pagination** (12 per page)

---

### 18. Transaction Detail (`/dashboard/transactions/:reference`)
**File:** `pages/dashboard/pages/TransactionDetailPage.tsx`

**Purpose:** Detailed view of a single transaction.

**API Calls:** `ordersApi.getMyTransactionByReference(reference)`

**Features:**
- Full transaction info display
- Status indicators
- Amount breakdown
- Timestamps

---

### 19. Payment Verify (`/dashboard/payment/verify/:reference`)
**File:** `pages/dashboard/pages/PaymentVerifyPage.tsx`

**Purpose:** Handles payment verification after redirect from Paystack.

**API Calls:** `ordersApi.verifyTransaction(reference)`

**Features:**
- Verifies payment
- Shows success/failure state
- Redirects to appropriate page after verification

---

### 20. Certificates (`/dashboard/certificates`)
**File:** `pages/dashboard/pages/CertificatesPage.tsx`

**Purpose:** View and download earned course certificates.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `certificatesApi.getMyCertificates()` | `src/api/certificates` | List earned certificates |
| `certificatesApi.downloadEnrollmentCertificate(id, options)` | `src/api/certificates` | Download certificate PDF |

**Components/Modals Rendered:**
- `Badge`, `Button`, `Input`
- `useToast` for notifications

**Features:**
- **Search** by course/tutor name
- **Email copy toggle** — checkbox to request email delivery
- **Certificate cards** — course title, tutor name, issue date, earned badge
- **Download button** — triggers PDF download, shows loading state per certificate
- Empty state when no certificates

---

### 21. Notifications (`/dashboard/notifications`)
**File:** `pages/dashboard/pages/NotificationsPage.tsx`

**Purpose:** Notification list with read/unread filtering and mark-as-read.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `notificationsApi.getNotifications(page, pageSize, unreadOnly)` | `src/api/notifications` | Paginated notifications |
| `notificationsApi.markAsRead(id)` | `src/api/notifications` | Mark single as read |
| `notificationsApi.markAllAsRead()` | `src/api/notifications` | Mark all as read |

**Components/Modals Rendered:** `Pagination`

**Features:**
- Filter toggle: All / Unread
- Mark All Read button
- Icon per notification type (course/event/payment/achievement/system)
- Unread highlight
- Open link marks as read
- Delete notification
- Pagination

---

### 22. Notification Detail (`/dashboard/notifications/:id`)
**File:** `pages/shared/NotificationDetailPage.tsx`

**Purpose:** Full notification content view.

**API Calls:** `notificationsApi.getNotification(id)`

---

### 23. Support (`/dashboard/support`)
**File:** `pages/shared/SupportPage.tsx`

**Purpose:** Support ticket system — create and track support tickets.

**API Calls:** `supportApi.getMyTickets`, `supportApi.createTicket`, `supportApi.replyToTicket`

---

### 24. Community (`/dashboard/community`)
**File:** `pages/dashboard/pages/CommunityPage.tsx`

**Purpose:** Community/social page for learners.

---

### 25. Checkout (`/dashboard/checkout`)
**File:** `pages/dashboard/pages/CheckoutPage.tsx`

**Purpose:** Checkout flow for enrollment payments.

---

### 26. Orders (`/dashboard/orders`)
**File:** `pages/dashboard/pages/OrdersPage.tsx`

**Purpose:** Order history listing.

---

### 27. Order Detail (`/dashboard/orders/:reference`)
**File:** `pages/dashboard/pages/OrderDetailPage.tsx`

**Purpose:** Detailed order view.

---

### 28. Quiz Result (`/dashboard/quiz-results/:id`)
**File:** `pages/dashboard/pages/QuizResultPage.tsx`

**Purpose:** Post-quiz result display.

---

### 29. Student My Quiz Results (`/dashboard/my-quiz-results`)
**File:** `pages/dashboard/pages/StudentMyQuizResultsPage.tsx`

**Purpose:** All quiz attempts history.

---

## Shared Components

### Dashboard Home Components
| File | Purpose |
|------|---------|
| `QuizView.tsx` | Interactive quiz taking UI |
| `QuizRules.tsx` | Quiz rules/info display |
| `QuizHistory.tsx` | Past quiz attempts list |
| `DashboardFooter.tsx` | Dashboard footer |

---

## Data Flow Patterns

1. **Enrollment Flow:** User browses catalog → opens course detail modal → opens enrollment modal → selects payment plan → provides optional referral code → redirected to Paystack → payment verification at `/dashboard/payment/verify` → enrollment confirmed
2. **Event Registration Flow:** User browses events → opens event detail → clicks Register → optionally pays → redirected to Paystack → registration confirmed
3. **Progress Tracking:** Material completion marked via `progressApi.markMaterialComplete` → updates course progress → reflected in dashboard metrics
4. **Quiz Flow:** Start attempt → answer questions → submit → view results → results stored for analytics
