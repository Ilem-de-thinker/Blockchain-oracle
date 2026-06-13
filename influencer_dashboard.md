# Influencer Dashboard — Full Documentation

## Overview

The Influencer Workspace is for users who promote the platform via referral codes and earn commissions. Role-gated via `ProtectedRoute` requiring `UserRole.INFLUENCER`. All pages are lazy-loaded with `Suspense` and wrapped in `SharedDashboardLayout` with `ErrorBoundary`.

**Routes file:** `pages/influencer/InfluencerRoutes.tsx` (10 routes)  
**Auth guard:** `ProtectedRoute` with `allowedRoles={[UserRole.INFLUENCER]}`  
**Fallback (unauthorized):** `/dashboard`  
**User source:** Read from `localStorage` via `getCurrentUser()`

---

## Pages

### 1. Influencer Dashboard (`/influencer`)
**File:** `pages/influencer/InfluencerDashboard.tsx`

**Purpose:** Main landing page — referral performance overview, earnings, referral code management, referee network, analytics charts.

**API Calls (parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `influencerApi.getDashboardSummary()` | `src/api/influencer` | Dashboard KPIs |
| `influencerApi.getRefereeList()` | `src/api/influencer` | Referred users list |
| `influencerApi.getConversionFunnel()` | `src/api/influencer` | Funnel data |
| `influencerApi.getRefereeActivity()` | `src/api/influencer` | Active/inactive referees |
| `influencerApi.getCodeTrends()` | `src/api/influencer` | Monthly code performance |
| `influencerApi.refreshReferralCode()` | `src/api/influencer` | Generate new code |
| `coursesApi.getCourses()` | `src/api/courses` | Published courses count |
| `eventsApi.getEvents(1, 100)` | `src/api/events` | Published events count |

**Components Rendered:**
- `WelcomeBanner` from `@/components/dashboard/WelcomeBanner`
- `Card`, `Badge`, `Button`, `Input`, `ReportActions`
- `Doughnut`, `Bar`, `Line` charts (react-chartjs-2)
- Filter panel, Quick Access links

**Features:**
- **3 Metric cards** — Total Referees, Total Purchases, Courses Live
- **Referral code** — copy to clipboard + refresh button
- **Payout summary** — Total Earnings, Pending, Received
- **Referral network** — searchable/filterable referee list (all / last 30 days)
- **Monthly performance stats**
- **Conversion Funnel** bar chart
- **Referee Activity** doughnut chart
- **Code Performance Trends** line chart
- **Quick Access** — Analytics, Profile, Notifications, Settings
- **Browse Courses / Events** action buttons

---

### 2. Campaigns (`/influencer/campaigns`)
**File:** `pages/influencer/InfluencerCampaignsPage.tsx`

**Purpose:** Central hub for managing referral campaigns — tabs for Overview, Links & Codes, History, Charts.

**API Calls (parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `influencerApi.getReferralCode()` | `src/api/influencer` | Active code info |
| `influencerApi.getCodeAnalytics()` | `src/api/influencer` | Per-code analytics |
| `influencerApi.getRefereeSummary()` | `src/api/influencer` | Referee summary |
| `influencerApi.getConversionFunnel()` | `src/api/influencer` | Funnel data |
| `influencerApi.getRefereeActivity()` | `src/api/influencer` | Activity stats |
| `influencerApi.getCodeTrends()` | `src/api/influencer` | Code trends |
| `influencerApi.getCodePurchases()` | `src/api/influencer` | Code purchases |
| `influencerApi.refreshReferralCode()` | `src/api/influencer` | Refresh code |

**Components Rendered:**
- `Table`, `ReportActions`, `Doughnut`, `Line`, `Bar` charts
- Tabbed UI (persisted in localStorage: `influencer_campaigns_tab`)
- Quick share buttons (WhatsApp, X/Twitter, Email)
- Copy-to-clipboard

**Features:**
- **Overview tab** — Active referral link, code, validity days, quick share
- **Links & Codes tab** — All codes with status/expiry/referee counts
- **History tab** — Code history with referee/purchase/earnings per code
- **Charts tab** — Code performance bar chart, conversion funnel, monthly trends
- Refresh Code with confirmation
- Compact stats: total referees, active codes, current code

---

### 3. Analytics (`/influencer/analytics`)
**File:** `pages/influencer/InfluencerAnalyticsPage.tsx`

**Purpose:** Comprehensive performance analytics — overview, monthly stats, code performance, all referees, charts.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `influencerApi.getPerformanceAnalytics()` | `src/api/influencer` | Combined endpoint (primary) |
| `influencerApi.getRefereeSummary()` | `src/api/influencer` | Fallback |
| `influencerApi.getRefereeList()` | `src/api/influencer` | Fallback |
| `influencerApi.getCodeAnalytics()` | `src/api/influencer` | Fallback |
| `influencerApi.getDashboardSummary()` | `src/api/influencer` | Fallback |
| `influencerApi.getRefereePurchases()` | `src/api/influencer` | Fallback |
| `influencerApi.getConversionFunnel()` | `src/api/influencer` | Fallback |
| `influencerApi.getRefereeActivity()` | `src/api/influencer` | Fallback |
| `influencerApi.getCodeTrends()` | `src/api/influencer` | Fallback |
| `influencerApi.getEnhancedDashboardSummary()` | `src/api/influencer` | Enhanced charts |
| `influencerApi.getEarningsTrend()` | `src/api/influencer` | Earnings line chart |
| `influencerApi.getCodeEarnings()` | `src/api/influencer` | Code earnings bar |
| `influencerApi.getCampaignComparison()` | `src/api/influencer` | Campaign comparison |

**Components Rendered:**
- `Card`, `Badge`, `Table`, `ReportActions`, `ThemeLink`, `StatCard`
- `Doughnut`, `Bar`, `Line` charts
- Tabbed navigation (persisted in localStorage: `influencer_analytics_tab`)
- Mobile select dropdown for tabs

**Features:**
- **Two-tier data fetching** — tries `getPerformanceAnalytics()` first, falls back to 8 individual calls
- **Always fetches** — enhanced dashboard, earnings trend, code earnings, campaign comparison
- **Tabs** — Overview, Monthly Stats, Code Performance, All Referees, Charts
- **Overview** — StatCards (Referees/Purchases/Earnings/This Month), Payout Summary, Active Code
- **Monthly Stats** — monthly breakdown with growth/conversion, Best Month, Avg Monthly
- **Codes tab** — code performance list
- **Referees tab** — all referrals list
- **Charts tab** — Monthly Earnings line, Earnings by Code bar, Campaign Comparison
- Smart fallback for chart data
- `formatCurrency` (NGN), `calculateGrowth`, `formatPercent` helpers

---

### 4. Earnings (`/influencer/earnings`)
**File:** `pages/influencer/InfluencerEarningsPage.tsx`

**Purpose:** Commission and payout tracking — totals, monthly trend, code earnings, referee purchases, payout explanation.

**API Calls (parallel via `Promise.allSettled`):**
| Function | Source | Purpose |
|----------|--------|---------|
| `influencerApi.getPayoutSummary()` | `src/api/influencer` | Accumulated/pending/received |
| `influencerApi.getRefereeSummary()` | `src/api/influencer` | Referee counts |
| `influencerApi.getRefereeList()` | `src/api/influencer` | Referee details |
| `influencerApi.getRefereePurchases()` | `src/api/influencer` | Purchases by referees |
| `influencerApi.getCodePurchases()` | `src/api/influencer` | Purchases by code |
| `influencerApi.getEarningsTrend()` | `src/api/influencer` | Monthly trend |
| `influencerApi.getCodeEarnings()` | `src/api/influencer` | Code earnings |

**Components Rendered:**
- `Table`, `ReportActions`, `Bar`, `Line` charts
- "How Payouts Work" info section

**Features:**
- **Large total earnings** display card
- **Summary grid** — Total Referees, Pending, Received
- **Monthly Earnings Trend** — line chart with dual Y-axes (earnings + referees)
- **Earnings by Code** — bar chart (earnings/referees/purchases per code)
- **Referee Purchases table** — user, email, course, amount, date, status
- **Purchases by Code table** — code, referee, course, commission, date
- **Referees table** — name, email, code used, joined date
- **How Payouts Work** — 20% commission, auto-processing, real-time tracking
- NGN currency formatting

---

### 5. Assets (`/influencer/assets`)
**File:** `pages/influencer/InfluencerAssetsPage.tsx`

**Purpose:** Placeholder/marketing kit — static list of downloadable promotional assets (not yet live).

**API Calls:** None

**Features:**
- Static placeholder page
- Hardcoded asset names: Brand kit, Launch posters, Event banners, Video snippets
- Grid layout of asset cards
- Note: "Asset-library routing is ready even though the asset API and downloads are not live yet."

---

### 6. Notifications (`/influencer/notifications`)
**File:** `pages/influencer/InfluencerNotificationsPage.tsx`

**Purpose:** Paginated notification list with filtering, mark-as-read, delete.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `notificationsApi.getNotifications(page, pageSize, unreadOnly)` | `src/api/notifications` | Paginated list |
| `notificationsApi.markAsRead(id)` | `src/api/notifications` | Mark single read |
| `notificationsApi.markAllAsRead()` | `src/api/notifications` | Mark all read |
| `notificationsApi.deleteNotification(id)` | `src/api/notifications` | Delete notification |

**Components Rendered:**
- `Pagination`

**Features:**
- 15 items per page
- Filter: All / Unread
- Optimistic UI for mark-as-read and delete
- Type-colored icons (course/event/payment/achievement/system)
- Unread count display
- External action URL support
- Empty state: "You're all caught up!"

---

### 7. Profile (`/influencer/profile`)
**File:** `pages/influencer/InfluencerProfilePage.tsx`

**Purpose:** Profile with referral code management — view active code, days remaining, generate new code.

**API Calls:**
| Function | Source | Purpose |
|----------|--------|---------|
| `influencerApi.getReferralCode()` | `src/api/influencer` | Code info + history |
| `influencerApi.refreshReferralCode()` | `src/api/influencer` | Generate new code |

**Components Rendered:**
- `WorkspaceProfilePage` from `../../components/account/WorkspaceProfilePage`
- `Card`, `Badge`, `Button`, `useToast`

**Features:**
- Active code prominently displayed
- Creation/expiry dates with days-remaining badge
- Red badge when ≤7 days remaining
- "Generate New Code" button with loading state
- Past codes list with expired badges
- Success/error toasts

---

### 8. Settings (`/influencer/settings`)
**File:** `pages/influencer/InfluencerSettingsPage.tsx`

**Purpose:** Thin wrapper around `WorkspaceSettingsPage` with "Influencer" role.

**API Calls:** None (delegated)

---

### 9. Shared Pages
| Route | File | Purpose |
|-------|------|---------|
| `/influencer/notifications/:id` | `pages/shared/NotificationDetailPage.tsx` | Notification detail |
| `/influencer/support` | `pages/shared/SupportPage.tsx` | Support tickets |
| `/influencer/community` | `pages/dashboard/pages/CommunityPage.tsx` | Community page |

---

## API Endpoints Overview (Influencer-specific)

**Source file:** `src/api/influencer.ts` (17 functions)

| Function | HTTP | Endpoint | Purpose |
|----------|------|----------|---------|
| `getReferralCode()` | GET | `/api/influencer/check-code/` | Current code + history |
| `refreshReferralCode()` | POST | `/api/influencer/refresh-code/` | Generate new code |
| `getCodeAnalytics()` | GET | `/api/influencer/code-analytics/` | Per-code referee counts |
| `getRefereeSummary()` | GET | `/api/influencer/referee-summary/` | Monthly referee breakdown |
| `getRefereeList()` | GET | `/api/influencer/referees/` | All referred users |
| `getPayoutSummary()` | GET | `/api/influencer/payouts/` | Accumulated/pending/received |
| `getDashboardSummary()` | GET | `/api/influencer/dashboard/` | Consolidated dashboard |
| `getEnhancedDashboardSummary()` | GET | `/api/influencer/charts/dashboard-summary/` | Enhanced with conversion |
| `getRefereePurchases()` | GET | `/api/influencer/referee-purchases/` | Purchases by referees |
| `getCodePurchases()` | GET | `/api/influencer/code-purchases/` | Purchases by code |
| `getConversionFunnel()` | GET | `/api/influencer/conversion-funnel/` | Funnel stages |
| `getRefereeActivity()` | GET | `/api/influencer/referee-activity/` | Active vs inactive |
| `getCodeTrends()` | GET | `/api/influencer/code-trends/` | Monthly signups per code |
| `getEarningsTrend()` | GET | `/api/influencer/charts/earnings-trend/` | Monthly earnings |
| `getCodeEarnings()` | GET | `/api/influencer/charts/code-earnings/` | Earnings by code |
| `getCampaignComparison()` | GET | `/api/influencer/charts/campaign-comparison/` | Campaign comparison |
| `getPerformanceAnalytics()` | GET | `/api/influencer/charts/performance-analytics/` | Combined analytics |

---

## Data Flow

1. **Referral Flow:** Get referral code → Share via WhatsApp/X/Email → User registers with code → Referee appears in list → Purchase generates commission → Earnings tracked
2. **Code Refresh:** Old code expires → New code generated → Old codes in history with stats
3. **Analytics:** Dashboard summary → Referee activity → Conversion funnel → Code trends → Monthly earnings → Campaign comparison
4. **Payout:** Referee purchases → Commission calculated (20%) → Accumulated earnings → Pending → Received
