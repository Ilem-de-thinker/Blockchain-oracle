# Contributor Dashboard — Full Documentation

## Overview

The Contributor Workspace is for users who can create/manage other users via referral codes. Role-gated via `ProtectedRoute` requiring `UserRole.CONTRIBUTOR`. All pages are lazy-loaded with `Suspense` and wrapped in `SharedDashboardLayout` with `ErrorBoundary`.

**Routes file:** `pages/contributor/ContributorRoutes.tsx` (10 routes)  
**Auth guard:** `ProtectedRoute` with `allowedRoles={[UserRole.CONTRIBUTOR]}`  
**Fallback (unauthorized):** `/dashboard`  
**User source:** Read from `localStorage` on each render via `getCurrentUser()`

---

## Pages

### 1. Contributor Dashboard (`/contributor`)
**File:** `pages/contributor/ContributorDashboard.tsx`

**Purpose:** Main landing page — metrics, mini charts, created users table, welcome banner.

**API Calls (parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `contributorApi.getReferralCode()` | `src/api/contributor` | Contributor's referral code |
| `contributorApi.getCreatedUsers()` | `src/api/contributor` | List of created users |
| `analyticsApi.getContributorDashboardSummary()` | `src/api/analytics` | Summary KPIs |
| `analyticsApi.getContributorAnalytics()` | `src/api/analytics` | Role distribution & growth |
| `analyticsApi.getContributorUserActivity()` | `src/api/analytics` | Active/inactive counts |

**Components Rendered:**
- `WelcomeBanner` from `@/components/dashboard/WelcomeBanner`
- `ReportActions` from `../../components/ui/ReportActions`
- `ButtonLink` from `@/components/ui/button-link`
- `Line` chart (6-month user growth), `Doughnut` chart (role distribution)
- `Button` for filter toggle

**Features:**
- **3 Metric cards** — Users Created, Active Users, This Month (with fallback to local calculation)
- **6-month user growth** line chart
- **Role distribution** doughnut chart
- **Created Users table** — 8 most recent, searchable by name/email, "Recent" filter (last 30 days)
- **Welcome banner** with Create action link
- Shows loading state as `'...'` in metric cards

---

### 2. Create Users (`/contributor/create-users`)
**File:** `pages/contributor/ContributorCreateUsersPage.tsx`

**Purpose:** Bulk user creation — dynamic form table for adding multiple users at once.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `contributorApi.bulkCreateUsers({ users })` | `src/api/contributor` | Create multiple users |
| `getErrorMessage` | `src/api/errorHandler` | Error formatting |

**Components Rendered:**
- `Button` (Add Row, Submit Users)
- Dynamic table rows with Name, Email, LGA fields
- `AlertCircle`, `CheckCircle`, `Trash2`, `Plus` icons

**Features:**
- **Dynamic table** — rows for each new user (Name, Email, LGA)
- Role defaults to "USER", country defaults to "Nigeria"
- "Add Row" appends new row; each row has delete button (minimum 1 row)
- **localStorage persistence** — in-progress list saved under `contributor_create_users_list`
- **Submit** — filters out empty rows, calls `bulkCreateUsers`
- **Success** — resets to single empty row
- **Error banner** — red background on failure

---

### 3. My Users (`/contributor/my-users`)
**File:** `pages/contributor/ContributorMyUsersPage.tsx`

**Purpose:** Full list of users created by the contributor with search.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `contributorApi.getCreatedUsers()` | `src/api/contributor` | All created users |

**Components Rendered:**
- `Button`, `ReportActions`, `Search` icon

**Features:**
- Client-side search by name/email (case-insensitive)
- Search query persisted in localStorage (`contributor_my_users_search`)
- Table: Full Name, Email, Date Joined
- Loading and empty states

---

### 4. Analytics (`/contributor/analytics`)
**File:** `pages/contributor/ContributorAnalyticsPage.tsx`

**Purpose:** Comprehensive analytics with 8 chart datasets covering user growth, activity, geography, and roles.

**API Calls (parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `analyticsApi.getContributorAnalytics()` | `src/api/analytics` | Overall analytics |
| `analyticsApi.getContributorDashboardSummary()` | `src/api/analytics` | Summary KPIs |
| `analyticsApi.getContributorUserActivity()` | `src/api/analytics` | Active/inactive by role |
| `analyticsApi.getContributorGeography()` | `src/api/analytics` | State/country distribution |

**Components Rendered:**
- `ReportActions`
- `Line` chart (monthly growth), `Doughnut` charts (role distribution, activity)
- `Bar` charts (users per code, active by role, state, country)

**Features:**
- **4 KPI cards** — Total Created, Active Users, This Month, Conversion Rate
- **8 chart datasets:**
  1. Monthly Growth line chart (12 months)
  2. Role Distribution doughnut
  3. Activity (Active vs Inactive) doughnut
  4. Per-Code bar chart
  5. Active by Role (stacked bar)
  6. Users by State bar
  7. Users by Country bar
- Conditional rendering: charts only display when data exists
- Graceful handling of individual API failures via `Promise.allSettled`

---

### 5. Notifications (`/contributor/notifications`)
**File:** `pages/contributor/ContributorNotificationsPage.tsx`

**Purpose:** Notification list with read/unread state and mark-as-read functionality.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `notificationsApi.getNotifications()` | `src/api/notifications` | Notification list |
| `notificationsApi.markAsRead(id)` | `src/api/notifications` | Mark single read |
| `notificationsApi.markAllAsRead()` | `src/api/notifications` | Mark all read |

**Features:**
- Handles both array and paginated `{ results }` responses
- **Relative time formatting** — "Just now", "X minutes ago", "Yesterday"
- Unread highlighted with blue background
- Mark All Read button
- Hover-to-reveal mark-as-read per notification
- Error state as red banner

---

### 6. Profile (`/contributor/profile`)
**File:** `pages/contributor/ContributorProfilePage.tsx`

**Purpose:** Profile view with referral code details.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `contributorApi.getReferralCode()` | `src/api/contributor` | Referral code info |

**Components Rendered:**
- `WorkspaceProfilePage` from `../../components/account/WorkspaceProfilePage`
- `Card`, `Badge` (success for permanent code)

**Features:**
- Wrapped in `WorkspaceProfilePage` with "Contributor" role label
- **Referral code** — displayed prominently in primary color
- **Creation date** — formatted via `date-fns`
- **Permanent badge** — if code is permanent, shows success badge
- **Expiration date** — shown if not permanent (or "N/A")

---

### 7. Settings (`/contributor/settings`)
**File:** `pages/contributor/ContributorSettingsPage.tsx`

**Purpose:** Thin wrapper around `WorkspaceSettingsPage` with "Contributor" role.

**API Calls:** None (delegated)

---

### 8. Shared Pages
| Route | File | Purpose |
|-------|------|---------|
| `/contributor/notifications/:id` | `pages/shared/NotificationDetailPage.tsx` | Notification detail |
| `/contributor/support` | `pages/shared/SupportPage.tsx` | Support tickets |
| `/contributor/community` | `pages/dashboard/pages/CommunityPage.tsx` | Community page |

---

## Data Flow

1. **User Creation:** Fill bulk creation form → Add rows → Submit → `bulkCreateUsers` API → Success/error feedback
2. **Analytics:** Dashboard summary + analytics APIs → 8 charts + KPI cards → User growth, role distribution, geography
3. **Referral Code:** Auto-generated for contributor → Displayed on profile → Used when creating users or by external referrals
