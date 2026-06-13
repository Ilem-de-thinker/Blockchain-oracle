# Blockchain Oracle Platform — Vue.js Design Prompt

## Overview

Design and prototype a **professional, modern** educational platform called **Blockchain Oracle** using **Vue.js 3 (Composition API, `<script setup>`, Pinia, Vue Router)**. This is a **design-only phase** — no API integration yet. Use mock data, static pages, and simulated states. The design should feel premium, polished, and ready for production.

The platform serves **5+ roles**: Student/User, Tutor, Admin, Super Admin, Influencer, and Contributor. Each role has its own dedicated dashboard with role-specific pages, analytics, and features.

---

## Core Design Principles

1. **Theme System**: 3 complete themes — Light, Dark, Ocean (dark blue/teal variant). Use CSS custom properties for all colors (`--color-bg`, `--color-text`, `--color-primary`, `--color-surface`, `--color-border`, `--color-muted`, `--color-amber`, `--color-emerald`). Every component must be theme-aware.

2. **Typography**: Clean, readable, modern. Inter or similar sans-serif. Consistent hierarchy. Body text min 16px on mobile. Standardized `leading-relaxed`, `tracking-wide` for labels/controls.

3. **Layout**: Responsive. Desktop sidebar navigation, mobile bottom nav or collapsible sidebar. Max-width constrained content areas. Consistent padding (px-4 mobile, px-10 desktop).

4. **Animations**: Subtle Framer Motion-style transitions (page transitions, sidebar toggle, modal enter/exit, hover states, confetti on completion). Use Vue Transitions and VueUse Motion or GSAP.

5. **Spacing & Grid**: Consistent 4px/8px spacing system. Card-based layouts for dashboards. Grid/list view toggles where appropriate.

6. **Icons**: Consistent icon set throughout (Lucide or Phosphor icons).

7. **Glassmorphism/Backdrop Blur**: Use `backdrop-blur` for navbars, modals, floating elements where appropriate.

8. **Color Palette per Theme**:
   - **Light**: White bg, slate/gray text, indigo/blue primary accents
   - **Dark**: Near-black bg, light text, indigo/teal accents
   - **Ocean**: Deep navy bg, light text, teal/cyan accents

---

## All Pages & Dashboards

### Public & Auth Pages (no sidebar)

| Page | Route | Key Elements |
|------|-------|-------------|
| Landing/Home | `/` | Hero, featured courses, stats, testimonials, CTA |
| Login | `/auth/login` | Email + password form, Google OAuth button, forgot password link |
| Register | `/auth/register` | Multi-step form (name, email, password, role USER/TUTOR), referral code field |
| Forgot Password | `/auth/forgot-password` | Email input, success message |
| Reset Password | `/auth/reset-password` | New password + confirm, token hidden |
| NIN KYC Verification | `/auth/kyc` | NIN input, verification status, verified badge |
| Onboarding Fee (NYSC) | `/auth/onboarding` | Paystack payment initiation, status, "Pay Now" CTA |
| Payment Callback | `/payment/callback` | Processing spinner, success/error state |

### Student Dashboard (`/dashboard`)

Layout: Sidebar nav, top header bar with search + notifications + profile avatar.

| Page | Route | Key Features |
|------|-------|-------------|
| **My Courses** | `/dashboard/courses` | Grid of enrolled courses with progress bars, status badges (In Progress, Completed, Not Started), search + status filter + pagination |
| **All Courses** | `/dashboard/courses/all` | Course catalog grid/list with search, category/level filters, sort, pagination; enrollment status badges; "Continue" vs "Enroll" button |
| **Course Player** ⭐ | `/dashboard/course/:id` | **See dedicated section below** |
| **Progress** | `/dashboard/progress` | Tabbed: "Courses" (list with completion %) + "Insights" (charts: weekly effort, quiz performance, category distribution) |
| **Transactions** | `/dashboard/transactions` | Table with search, status/type filters, pagination |
| **Events** | `/dashboard/events` | Event cards list with search + type/status filters + pagination |
| **My Registrations** | `/dashboard/registrations` | Registered events list, search + filter + pagination |
| **Notifications** | `/dashboard/notifications` | Filter (all/unread), type filter, search, preferences modal |
| **Certificates** | `/dashboard/certificates` | Grid of earned certificates with download buttons |
| **Support Tickets** | `/dashboard/support` | Ticket list + create ticket form + chat thread per ticket |
| **Profile** | `/dashboard/profile` | Editable form: name, email, phone, address, LGA, state, country, bio, profile picture upload |
| **Settings** | `/dashboard/settings` | Tabs: Profile / Security / Notification Preferences |

### Tutor Dashboard (`/tutor`)

Layout: Sidebar nav with tutor-specific items.

| Page | Route | Key Features |
|------|-------|-------------|
| **Dashboard Overview** | `/tutor` | KPI cards (total courses, students, revenue, avg rating), charts (enrollment funnel, monthly revenue, completion rate) |
| **My Courses** | `/tutor/courses` | Course management table: title, students, revenue, rating, status. Search + filters + grid/list toggle |
| **Create Course Wizard** | `/tutor/courses/create` | Multi-step: 1. Basic info (title, desc, thumbnail, fees) 2. Modules & Materials 3. Quiz creation 4. Review & Publish |
| **Edit Course** | `/tutor/courses/:id/edit` | Same form as create but pre-populated |
| **Course Students** | `/tutor/courses/:id/students` | Student list with progress, quiz scores, engagement |
| **Quizzes** | `/tutor/quizzes` | Quiz list with search + course/module filters. Create/edit quiz forms |
| **Students** | `/tutor/students` | Searchable student directory |
| **Analytics** | `/tutor/analytics` | Revenue, ratings breakdown, drop-off analysis, event stats, quiz stats |
| **Settings** | `/tutor/settings` | Tabs: Profile / Security / Notification Preferences / System |
| **Profile** | `/tutor/profile` | Editable profile form |

### Admin Dashboard (`/admin`)

Layout: Sidebar nav with admin-specific items.

| Page | Route | Key Features |
|------|-------|-------------|
| **Platform Dashboard** | `/admin` | KPI row (users, courses, revenue, MAU, completion rate, avg rating, open tickets), charts (user growth, enrollment trends, revenue by category, rating distribution) |
| **Users** | `/admin/users` | User table with search, role/status filters, grid/list toggle, pagination. Create user button |
| **Create User** | `/admin/users/create` | Form with role selector (all roles), email, name, password |
| **User Detail** | `/admin/users/:id` | Profile view, edit form, enrollment history, transactions |
| **Courses** | `/admin/courses` | Course table with search, category/level/status filters, sort, grid/list toggle. Create course, verify, publish actions |
| **Create Course** | `/admin/courses/create` | Full course creation wizard (same as tutor) |
| **Edit Course** | `/admin/courses/:id/edit` | Pre-populated course form |
| **NYSC Enrollment** | `/admin/nysc-enrollment` | Stats card, user list (non-NYSC), "Enroll as NYSC" action, enrolled tab, search + pagination |
| **Events** | `/admin/events` | Event list with search + type/status filters + pagination. Create/Edit/Delete |
| **Create Event** | `/admin/events/create` | Event form: title, desc, date, type (online/in-person), location/url, fees, capacity, organizers, image |
| **Edit Event** | `/admin/events/:id/edit` | Pre-populated event form |
| **Event Applications** | `/admin/events/:id/applications` | Applications list, approve/reject actions |
| **Notifications** | `/admin/notifications` | Notification list with filter (all/unread), type filter, pagination. Send notification button |
| **Send Notification** | `/admin/notifications/send` | Target selector (all/students/tutors/individual/course), title, message, optional CTA |
| **Send Email** | `/admin/notifications/email` | Email composer: subject, message, user_ids, action_text, action_url |
| **Reviews** | `/admin/reviews` | Review table with course/user/rating/status filters, sort, pagination |
| **Reports** | `/admin/reports` | Tabbed: Platform / Users / Courses / Revenue / Events / Ratings — each with relevant charts + time range selector |
| **Transactions** | `/admin/transactions` | Full transaction table with search, status/type filters, pagination |
| **Support Tickets** | `/admin/support` | All tickets with status filter, assign, update status, chat messaging |
| **Global Settings** | `/admin/settings` | Key-value settings editor (maintenance mode, platform fee, etc.) |
| **Profile** | `/admin/profile` | Editable profile form |
| **Tutor's Courses** | `/admin/tutors/:id/courses` | View/manage a specific tutor's courses |

### Super Admin (`/super-admin`)

Same as Admin plus:
- Create Admin users
- Access to all admin features
- Seed AI context documents
- System utilities

### Influencer Dashboard (`/influencer`)

| Page | Route | Key Features |
|------|-------|-------------|
| **Campaigns** | `/influencer/campaigns` | Tabbed: Overview / Links / History / Charts. Shows referral code, stats, performance |
| **Analytics** | `/influencer/analytics` | Tabbed: Overview / Monthly / Codes / Referees / Charts. Conversion funnel, referee activity, earnings trends |
| **Referral Codes** | `/influencer/codes` | Active code display, refresh code button, code history |
| **Referees** | `/influencer/referees` | Referee list with search, purchase history |
| **Payouts** | `/influencer/payouts` | Accumulated, pending, received amounts; payout history |
| **Code Analytics** | `/influencer/code-analytics` | Per-code referee counts, conversion rates, earnings |
| **Settings** | `/influencer/settings` | Profile + notification preferences |
| **Profile** | `/influencer/profile` | Editable form |

### Contributor Dashboard (`/contributor`)

| Page | Route | Key Features |
|------|-------|-------------|
| **Dashboard Overview** | `/contributor` | KPI cards (total created, active users, this month, conversion), charts (user growth, role distribution, geography) |
| **Create Users** | `/contributor/create-users` | Bulk user creation form (add multiple rows: name, email, role, LGA, country). Per-user or CSV upload |
| **My Users** | `/contributor/my-users` | Table of created users with search |
| **Referral Code** | `/contributor/code` | Permanent referral code display |
| **Analytics** | `/contributor/analytics` | User growth, activity status, geographic distribution, role breakdown |
| **Settings** | `/contributor/settings` | Profile + notification preferences |

---

## ⭐ Course Player — FOCUS SECTION

This is the **most important** component. The course player should feel like a premium learning experience (think Udemy, Coursera quality, but better).

### Layout
- **Left sidebar**: Syllabus sidebar (collapsible on mobile, toggleable on desktop)
- **Right content area**: The main material display
- **Top bar**: Course title, progress percentage bar, close/back button
- **Desktop**: Sidebar always visible (can be toggled)
- **Mobile**: Sidebar slides in as overlay, bottom bar with prev/next

### Syllabus Sidebar States for Each Material
| State | Icon | Color | Click Behavior |
|-------|------|-------|---------------|
| Completed | CheckCircle2 | Green | Navigate (review) |
| Active | Filled circle | Primary (indigo) | Current view |
| Available (not started) | None or unlocked | Default text | Navigate |
| Payment-locked | Lock / TriangleAlert | Amber/Orange | Blocked — toast "Payment Required" |
| Prerequisite-locked | Lock | Muted/Slate | Blocked — toast "Complete previous lesson first" |

### Content Types

#### 1. Video Player (White-Label)
- YouTube embeds with **branding masked** (no YouTube logo, no "Watch on YouTube", no related videos)
- Custom control bar: Play/Pause, progress scrubber, volume, playback speed, fullscreen
- Transcript area below (theme-aware, readable)
- Loading/skeleton state

#### 2. PDF Viewer
- Full theme integration (no hardcoded slate colors)
- Text selection layer (selectable, searchable text)
- Zoom controls (+/- , percentage display, fit to width)
- Page navigation (prev/next, page number input)
- Mobile: Pinch-to-zoom, swipe to change pages, double-tap to zoom
- Toolbar auto-hides on scroll
- 44x44px minimum touch targets

#### 3. Text/Markdown Content
- Theme-aware prose rendering (Tiptap or similar)
- Standardized line-height (`leading-relaxed`), font-medium
- Max-width constrained (`max-w-4xl`) for readability
- Responsive padding

### Completion Flow
- "Mark as Complete" button always clickable (no artificial timer)
- On click: confetti animation, API call, button changes to "Completed" (green, disabled)
- Reading progress bar shown as **informational only** (not a gate)
- Next material auto-suggests or auto-navigates after short delay

### Keyboard Shortcuts
- `n` or ArrowRight: Next material (if unlocked)
- `p` or ArrowLeft: Previous material
- Show shortcut hints in UI

### Progress Display
- Header bar shows: `completedMaterials / totalMaterials` with progress percentage
- Progress is source-of-truth from completed lessons array
- No fake timers, no attention span metrics

### Quiz Integration
- Quiz button at end of module materials
- Quiz page: 5 random questions, option selection, submit
- Results page: score, correct/incorrect breakdown, pass/fail status
- If passed: confetti, next module unlocks
- If failed: retry button, best score displayed

### States to Cover
- Loading: Skeleton screens for sidebar + content area
- Error: Material failed to load, offline indicator
- Empty: No materials in module
- Edge cases: First material (always accessible), last material in course, revisiting completed material

---

## Shared Components & Patterns

### Layout Components
- **AppSidebar**: Role-aware navigation items, collapsible, mobile drawer, active state
- **TopHeader**: Search bar, notification bell with badge, profile avatar dropdown
- **PageContainer**: Consistent padding, max-width, breadcrumbs
- **DashboardShell**: Sidebar + header + content area layout

### UI Components (all theme-aware)
- **KpiCard**: Icon, label, value, trend indicator (up/down), colored accent
- **DataTable**: Sortable columns, row actions dropdown, loading skeleton, empty state
- **SearchInput**: With debounce, clear button, icon prefix
- **FilterBar**: Horizontal filter chips with dropdowns, clear all
- **Pagination**: Page numbers, prev/next, total count
- **Tabs**: Underline or pill style, animated indicator
- **Modal/Dialog**: Backdrop blur, enter/exit animation, trap focus, close on escape
- **Toast**: Success, error, warning, info variants; auto-dismiss; stackable
- **Badge**: Status variants (success, warning, error, info, neutral)
- **Button**: Primary, secondary, outline, ghost, danger variants; loading spinner; icon support
- **Card**: Hover elevation, border, padding variants
- **FormInput**: With label, error state, helper text, icon support
- **Select**: Custom styled, searchable where needed
- **FileUpload**: Drag & drop zone, preview, progress, remove
- **ProgressBar**: Animated, color variants, percentage label
- **Skeleton**: Pulse animation for loading states
- **EmptyState**: Illustration + message + CTA
- **Avatar**: With status dot, fallback initials
- **DropdownMenu**: Click/toggle, item icons, dividers
- **Tooltip**: On hover, delayed show
- **Toggle/Switch**: For settings
- **Checkbox/Radio**: Custom styled

### Chart Components (using Chart.js, ApexCharts, or similar)
- **BarChart**: Vertical/horizontal, stacked, responsive
- **LineChart**: With tooltips, gradients, responsive
- **PieChart / DonutChart**: With legend, center label
- **ScatterChart**: For course performance matrix
- **FunnelChart**: For enrollment/conversion funnels
- **Heatmap**: For activity tracking

### Form Patterns (each with loading, validation, error, success states)
- **Standard Form**: Label, input, validation error, submit button
- **Multi-Step Wizard**: Step indicator (numbered/check marks), back/next, data persistence in store
- **Bulk Entry Form**: Dynamic row adding/removing (contributor create users)
- **Search + Filter Form**: Inline filters with clear/reset

---

## Key Design Patterns

### 1. List + Search + Filter + Pagination (used on 15+ pages)
```
[SearchInput] [FilterChips] [Grid/List Toggle]
[DataTable or CardGrid] — loading skeleton → populated → empty state
[Pagination]
```
Filters persist in store (search query, active filters, page, sort order, view mode).

### 2. Tabbed Interface (used on 8+ pages)
```
[Tabs] animated underline/pill
[ContentPanel] per tab — each can be a full sub-page
```
Active tab persists.

### 3. Dashboard KPI + Charts
```
[SummaryCards] row of KPI cards
[MainChart] primary visualization
[SecondaryCharts] grid of 2-3 smaller charts
[DetailTable] drill-down data
```

### 4. Course Player Layout
```
[TopBar] — close, course title, progress bar
[Sidebar Syllabus] — | [Content Area]
[BottomBar mobile] — prev/next, menu toggle
```

### 5. Support Chat
```
[TicketList] left panel — | [ChatThread] right panel
Messages: user bubbles vs admin bubbles
Status badge, assignee info
```

### 6. Notification Management
```
[FilterBar] — all/unread, type filter, search
[NotificationList] — avatar + title + message + time + read/unread indicator
[Actions] — mark read, delete
[Preferences] — modal with toggle switches
```

---

## State Management (Pinia Stores)

Design these stores (no API calls yet — use mock data):

- **`useAuthStore`**: user object, tokens (mocked), login/logout actions, role
- **`useThemeStore`**: active theme (light/dark/ocean), toggle action
- **`useCourseStore`**: courses list, enrolled courses, current course, materials, progress
- **`usePlayerStore`**: active material, sidebar state, completed lessons, quiz state
- **`useFilterStore`**: per-page search/filter/sort/pagination state (for persistence)
- **`useNotificationStore`**: notifications list, filter, unread count
- **`useEnrollmentStore`**: enrollments, module access, payment status
- **`useEventStore`**: events list, registrations
- **`useSupportStore`**: tickets, current ticket, messages
- **`useAnalyticsStore`**: per-role KPIs, chart data
- **`useUiStore`**: sidebar collapsed, modals, toasts, loading states

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| < 768px (mobile) | Single column, bottom nav or hamburger menu, slide-over sidebar, full-width content |
| 768-1024px (tablet) | Collapsible sidebar, 2-column grids |
| > 1024px (desktop) | Full sidebar visible, multi-column layouts, max-width constrained content |

---

## Performance & UX Details

- Route-level code splitting with `defineAsyncComponent`
- Transition animations between routes (`<RouterView v-slot>` with transition)
- Loading states for every async operation
- Empty states with helpful CTAs for every list
- Error boundaries for widget-level failures
- Consistent 200-300ms transition durations
- No layout shift during loading (skeleton dimensions match content)
- `useLocalStorage`-style persistence for: forms, wizard steps, active tabs, filters, sidebar state
- Keyboard accessibility: tab order, aria labels, focus trapping in modals

---

## Design Vibe

- **Professional**: Clean lines, generous whitespace, consistent spacing
- **Modern**: Subtle shadows, backdrop blur, micro-interactions, smooth transitions
- **Premium**: High-quality feel, white-label video, polished PDF viewer, coherent typography
- **Educational**: Clear hierarchy, progress visibility, encouraging feedback (confetti, badges)
- **Nigerian Market Context**: Paystack integration, NIN KYC, NYSC onboarding, LGA/state/country address fields