# Visualization and Analytics API Documentation

This document describes all API endpoints for aggregated data and analytics dashboards across all user roles.

## Base URL
`/api/`

## Authentication
All endpoints require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

## Admin Impersonation
Admin and Super Admin users can view data for any other user by providing an extra query parameter:
| Role | Parameter |
|---|---|
| Admin viewing a Student | `?user_id=<id>` |
| Admin viewing a Tutor | `?tutor_id=<id>` |
| Admin viewing an Influencer | `?influencer_id=<id>` |
| Admin viewing a Contributor | `?contributor_id=<id>` |

---

## Student Analytics

### 1. Course Progress Leaderboard
- **URL**: `GET /api/progress/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Description**: Returns per-course completion percentages sorted descending, plus totals.

#### Example Response
```json
{
    "overall_completion": 62.5,
    "courses": [
        {
            "course_id": 3,
            "title": "Smart Contracts",
            "completion": 100.0,
            "status": "Completed"
        },
        {
            "course_id": 1,
            "title": "Blockchain Basics",
            "completion": 75.0,
            "status": "In Progress"
        },
        {
            "course_id": 5,
            "title": "DeFi Fundamentals",
            "completion": 0.0,
            "status": "Not Started"
        }
    ],
    "status_counts": {
        "completed": 1,
        "in_progress": 1,
        "not_started": 1
    }
}
```

---

### 2. Weekly Learning Effort
- **URL**: `GET /api/progress/activity/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Query Params**:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `days` | `int` | `7` | Number of past days to include |

- **Description**: Daily breakdown of materials completed and minutes studied.

#### Example Response
```json
{
    "daily": [
        {"date": "2026-05-01", "minutes": 45.5, "materials_completed": 2},
        {"date": "2026-05-02", "minutes": 0.0, "materials_completed": 0},
        {"date": "2026-05-03", "minutes": 30.0, "materials_completed": 1},
        {"date": "2026-05-04", "minutes": 60.0, "materials_completed": 3},
        {"date": "2026-05-05", "minutes": 15.0, "materials_completed": 1},
        {"date": "2026-05-06", "minutes": 20.0, "materials_completed": 1},
        {"date": "2026-05-07", "minutes": 40.0, "materials_completed": 2}
    ],
    "total_minutes": 210.5
}
```

---

### 3. Quiz Aggregated Performance
- **URL**: `GET /api/quizzes/my-results/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Query Params**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `aggregate` | `boolean` | Yes | Must be `true` to trigger the aggregated response |

- **Description**: Pass/fail summary and average quiz score for the student.

#### Example Response (`?aggregate=true`)
```json
{
    "total_attempts": 15,
    "passed": 12,
    "failed": 3,
    "average_score": 78.5
}
```

---

### 4. Student Dashboard Summary
- **URL**: `GET /api/progress/dashboard-summary/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Description**: Combined KPI summary card for the student dashboard.

#### Example Response
```json
{
    "overall_completion": 62.5,
    "total_courses": 3,
    "completed_courses": 1,
    "quizzes_passed": 12,
    "quizzes_failed": 3,
    "total_spent": 25000.0,
    "current_streak_days": 4,
    "weekly_minutes": 210.5
}
```

---

### 5. Enrollment Category Summary
- **URL**: `GET /api/enrollments/summary/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Description**: Course category distribution for pie/donut charts.

#### Example Response
```json
{
    "by_category": [
        {"category": "Technology", "count": 3},
        {"category": "Finance", "count": 2},
        {"category": "Business", "count": 1}
    ]
}
```

---

### 6. Spending History
- **URL**: `GET /api/transactions/my-history/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Query Params**:

| Parameter | Type | Description |
|---|---|---|
| `aggregate_by` | `string` | Set to `month` for monthly totals |

- **Description**: Flat list of transactions or monthly totals.

#### Example Response (no params — flat list)
```json
{
    "transactions": [
        {"date": "2026-01-15", "amount": 10000.0, "status": "SUCCESS"},
        {"date": "2026-02-03", "amount": 5000.0, "status": "SUCCESS"}
    ]
}
```

#### Example Response (`?aggregate_by=month`)
```json
{
    "monthly_spending": [
        {"month": "2026-01", "total": 10000.0},
        {"month": "2026-02", "total": 5000.0}
    ]
}
```

---

### 7. Event Participation Summary
- **URL**: `GET /api/event-applications/summary/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Description**: Breakdown of upcoming vs past events and monthly participation trends.

#### Example Response
```json
{
    "upcoming": 2,
    "past": 5,
    "by_month": [
        {"month": "2026-01", "count": 1},
        {"month": "2026-02", "count": 2},
        {"month": "2026-03", "count": 2}
    ]
}
```

---

### 8. Enrollment Timeline
- **URL**: `GET /api/enrollments/timeline/`
- **Method**: `GET`
- **Auth**: Student or Admin
- **Description**: Monthly enrollments for area/line charts.

#### Example Response
```json
{
    "monthly_enrollments": [
        {"month": "2026-01", "count": 2},
        {"month": "2026-02", "count": 1},
        {"month": "2026-03", "count": 3}
    ]
}
```

---

## Tutor Analytics

### 1. Tutor Dashboard
- **URL**: `GET /api/tutor/dashboard/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: Platform-level aggregation for all courses managed by the tutor.

#### Example Response
```json
{
    "total_courses": 5,
    "total_enrollments": 120,
    "avg_course_rating": 4.3,
    "monthly_enrollments": [
        {"month": "2026-03", "count": 20},
        {"month": "2026-04", "count": 32}
    ],
    "per_course": [
        {
            "course_id": 1,
            "title": "Blockchain Basics",
            "enrollments": 45,
            "completion_rate": 62.5
        }
    ]
}
```

---

### 2. Tutor Quiz Stats
- **URL**: `GET /api/tutor/quiz-stats/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: Pass/fail breakdown for all quiz attempts across the tutor's courses.

#### Example Response
```json
{
    "total_attempts": 80,
    "passed": 65,
    "failed": 15,
    "per_course": [
        {"course_id": 1, "passed": 30, "failed": 5},
        {"course_id": 2, "passed": 35, "failed": 10}
    ]
}
```

---

### 3. Revenue Overview
- **URL**: `GET /api/tutor/revenue/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Query Params**:

| Parameter | Type | Description |
|---|---|---|
| `aggregate_by` | `string` | Set to `month` for monthly totals only |

- **Description**: Total earnings, pending revenue, and per-course sales.

#### Example Response (no params)
```json
{
    "total_earnings": 120000.0,
    "pending": 30000.0,
    "received": 120000.0,
    "per_course": [
        {"course_id": 1, "title": "Blockchain Basics", "sales": 45000.0},
        {"course_id": 2, "title": "Smart Contracts", "sales": 75000.0}
    ]
}
```

#### Example Response (`?aggregate_by=month`)
```json
{
    "monthly_revenue": [
        {"month": "2026-03", "amount": 40000.0},
        {"month": "2026-04", "amount": 80000.0}
    ]
}
```

---

### 4. Tutor Dashboard Summary
- **URL**: `GET /api/tutor/dashboard-summary/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: KPI card data for the tutor's top-level dashboard.

#### Example Response
```json
{
    "total_courses": 5,
    "total_students": 98,
    "total_revenue": 120000.0,
    "avg_rating": 4.3,
    "active_students_this_week": 22,
    "completion_rate": 58.33
}
```

---

### 5. Enrollment Funnel
- **URL**: `GET /api/tutor/enrollment-funnel/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: Funnel stages (Enrolled → In Progress → Completed) per course.

#### Example Response
```json
{
    "funnel": [
        {"stage": "Enrolled", "count": 120},
        {"stage": "In Progress", "count": 80},
        {"stage": "Completed", "count": 45}
    ],
    "per_course": [
        {
            "course_id": 1,
            "enrolled": 45,
            "in_progress": 30,
            "completed": 20
        }
    ]
}
```

---

### 6. Course Ratings Breakdown
- **URL**: `GET /api/tutor/ratings/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: Per-course average rating and review count.

#### Example Response
```json
{
    "per_course": [
        {
            "course_id": 1,
            "title": "Blockchain Basics",
            "avg_rating": 4.5,
            "total_reviews": 18
        },
        {
            "course_id": 2,
            "title": "Smart Contracts",
            "avg_rating": 4.1,
            "total_reviews": 12
        }
    ]
}
```

---

### 7. Drop-off Analysis
- **URL**: `GET /api/tutor/dropoff-analysis/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: Module-level started vs. completed counts to identify where students drop off.

#### Example Response
```json
{
    "per_course": [
        {
            "course_id": 1,
            "modules": [
                {"module_id": 1, "title": "Introduction", "started": 45, "completed": 42},
                {"module_id": 2, "title": "Core Concepts", "started": 38, "completed": 25},
                {"module_id": 3, "title": "Advanced Topics", "started": 15, "completed": 8}
            ]
        }
    ]
}
```

---

### 8. Tutor Event Stats
- **URL**: `GET /api/tutor/event-stats/`
- **Method**: `GET`
- **Auth**: Tutor or Admin
- **Description**: Application count for each event created by the tutor.

#### Example Response
```json
{
    "events": [
        {
            "event_id": 3,
            "title": "Blockchain Bootcamp",
            "applications": 52,
            "date": "2026-06-15"
        },
        {
            "event_id": 7,
            "title": "DeFi Workshop",
            "applications": 29,
            "date": "2026-07-01"
        }
    ]
}
```

---

## Influencer Analytics

### 1. Conversion Funnel
- **URL**: `GET /api/influencer/conversion-funnel/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Description**: Shows how many referees converted to purchasers and repeat purchasers.

#### Example Response
```json
{
    "funnel": [
        {"stage": "Referees", "count": 120},
        {"stage": "Made Purchase", "count": 75},
        {"stage": "Repeat Purchase", "count": 30}
    ]
}
```

---

### 2. Referee Activity Status
- **URL**: `GET /api/influencer/referee-activity/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Description**: Active vs. inactive referees (last 30 days) per referral code.

#### Example Response
```json
{
    "active": 45,
    "inactive": 75,
    "by_code": [
        {"code": "INF-ABC123", "active": 30, "inactive": 40},
        {"code": "INF-DEF456", "active": 15, "inactive": 35}
    ]
}
```

---

### 3. Code Performance Trends
- **URL**: `GET /api/influencer/code-trends/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Description**: Monthly signup trend per referral code.

#### Example Response
```json
{
    "codes": [
        {
            "code": "INF-ABC123",
            "monthly": [
                {"month": "2026-01", "referees": 10},
                {"month": "2026-02", "referees": 18},
                {"month": "2026-03", "referees": 12}
            ]
        }
    ]
}
```

---

### 4. Monthly Earnings Trend
- **URL**: `GET /api/influencer/charts/earnings-trend/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Query Params**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `aggregate_by` | `string` | `month` | Set to `month` for monthly aggregation |
| `date_from` | `string` | None | Filter from date (YYYY-MM-DD) |
| `date_to` | `string` | None | Filter to date (YYYY-MM-DD) |

- **Description**: Shows influencer earnings, referee counts, and purchase counts over time.

#### Example Response
```json
{
    "monthly_earnings": [
        {"month": "2026-01", "amount": 15000.00, "referees": 12, "purchases": 8},
        {"month": "2026-02", "amount": 22000.00, "referees": 18, "purchases": 12},
        {"month": "2026-03", "amount": 18500.00, "referees": 15, "purchases": 10}
    ],
    "total_earnings": 55500.00,
    "average_monthly": 18500.00
}
```

---

### 5. Earnings by Referral Code
- **URL**: `GET /api/influencer/charts/code-earnings/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Query Params**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date_from` | `string` | None | Filter from date (YYYY-MM-DD) |
| `date_to` | `string` | None | Filter to date (YYYY-MM-DD) |

- **Description**: Compare which referral codes generate the most revenue and their conversion rates.

#### Example Response
```json
{
    "by_code": [
        {
            "code": "INF-ABC123",
            "earnings": 25000.00,
            "referee_count": 45,
            "purchases": 18,
            "conversion_rate": 40.0,
            "created_at": "2026-01-15",
            "expires_at": "2026-04-15",
            "is_expired": false
        },
        {
            "code": "INF-DEF456",
            "earnings": 18000.00,
            "referee_count": 30,
            "purchases": 12,
            "conversion_rate": 40.0,
            "created_at": "2026-02-01",
            "expires_at": "2026-05-01",
            "is_expired": false
        }
    ],
    "total_earnings": 43000.00
}
```

---

### 6. Campaign Comparison (Multi-Metric)
- **URL**: `GET /api/influencer/charts/campaign-comparison/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Query Params**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date_from` | `string` | None | Filter from date (YYYY-MM-DD) |
| `date_to` | `string` | None | Filter to date (YYYY-MM-DD) |
| `include_monthly` | `boolean` | `true` | Include monthly breakdown per code |

- **Description**: Single API call for multi-metric campaign comparison with monthly breakdowns.

#### Example Response
```json
{
    "campaigns": [
        {
            "code": "INF-ABC123",
            "created_at": "2026-01-15",
            "expires_at": "2026-04-15",
            "is_expired": false,
            "days_remaining": 25,
            "metrics": {
                "referees": 45,
                "purchases": 18,
                "earnings": 25000.00,
                "conversion_rate": 40.0,
                "repeat_purchases": 5
            },
            "monthly_breakdown": [
                {"month": "2026-01", "referees": 15, "purchases": 6, "earnings": 8500.00},
                {"month": "2026-02", "referees": 18, "purchases": 7, "earnings": 9500.00}
            ]
        }
    ],
    "summary": {
        "total_campaigns": 2,
        "active_campaigns": 2,
        "total_referees": 75,
        "total_purchases": 30,
        "total_earnings": 43000.00,
        "overall_conversion_rate": 40.0
    }
}
```

---

### 7. Enhanced Dashboard Summary
- **URL**: `GET /api/influencer/charts/dashboard-summary/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Description**: Consolidated KPI summary with conversion rates and performance metrics.

#### Example Response
```json
{
    "summary": {
        "total_referees": 150,
        "total_purchases": 45,
        "total_earnings": 450.00,
        "pending_payout": 150.00,
        "received_payout": 300.00,
        "conversion_rate": 30.0,
        "repeat_purchase_rate": 15.0,
        "avg_earnings_per_referee": 3.00,
        "active_codes_count": 2,
        "expired_codes_count": 1
    },
    "active_code": {
        "code": "INF-ABC123",
        "days_remaining": 25,
        "referee_count": 45,
        "code_conversion_rate": 35.0
    },
    "monthly_stats": [
        {
            "month": "2026-03",
            "new_referees": 20,
            "purchases": 8,
            "earnings": 150.00,
            "conversion_rate": 40.0
        }
    ]
}
```

---

### 8. Performance Analytics Overview
- **URL**: `GET /api/influencer/charts/performance-analytics/`
- **Method**: `GET`
- **Auth**: Influencer or Admin
- **Description**: Combined endpoint for all performance charts including funnel, activity, and trends.

#### Example Response
```json
{
    "overview": {
        "total_referees": 150,
        "total_purchases": 45,
        "total_earnings": 450.00,
        "conversion_rate": 30.0,
        "pending_payout": 150.00,
        "received_payout": 300.00
    },
    "conversion_funnel": [
        {"stage": "Referees", "count": 150},
        {"stage": "Made Purchase", "count": 45},
        {"stage": "Repeat Purchase", "count": 15}
    ],
    "referee_activity": {
        "active": 85,
        "inactive": 65,
        "by_code": [
            {"code": "INF-ABC123", "active": 30, "inactive": 15}
        ]
    },
    "code_trends": [
        {
            "code": "INF-ABC123",
            "monthly": [
                {"month": "2026-01", "referees": 10, "purchases": 4, "earnings": 60.00}
            ]
        }
    ],
    "monthly_earnings": [
        {"month": "2026-01", "amount": 150.00, "referees": 10, "purchases": 4}
    ],
    "best_performing_code": "INF-ABC123",
    "best_month": {"month": "2026-02", "earnings": 200.00}
}
```

---

## Contributor Analytics

### 1. Contributor User Analytics
- **URL**: `GET /api/contributor/analytics/`
- **Method**: `GET`
- **Auth**: Contributor or Admin
- **Description**: Total created users, role distribution, monthly growth, and per-code breakdown.

#### Example Response
```json
{
    "total_created_users": 250,
    "by_role": {
        "USER": 180,
        "TUTOR": 40,
        "INFLUENCER": 30
    },
    "monthly_growth": [
        {"month": "2026-01", "count": 30},
        {"month": "2026-02", "count": 45}
    ],
    "by_code": [
        {"code": "CON-XYZ789", "user_count": 130},
        {"code": "CON-LMN321", "user_count": 120}
    ]
}
```

---

### 2. Contributor Dashboard Summary
- **URL**: `GET /api/contributor/dashboard-summary/`
- **Method**: `GET`
- **Auth**: Contributor or Admin
- **Description**: KPI card data for the contributor dashboard.

#### Example Response
```json
{
    "total_created": 250,
    "active_users": 95,
    "by_role": {
        "USER": 180,
        "TUTOR": 40,
        "INFLUENCER": 30
    },
    "this_month": 45,
    "conversion_to_paid": 38.0
}
```

---

### 3. User Activity Status
- **URL**: `GET /api/contributor/user-activity/`
- **Method**: `GET`
- **Auth**: Contributor or Admin
- **Description**: Active vs. inactive users created by the contributor, broken down by role.

#### Example Response
```json
{
    "active": 95,
    "inactive": 155,
    "by_role": {
        "USER": {"active": 60, "inactive": 120},
        "TUTOR": {"active": 20, "inactive": 20},
        "INFLUENCER": {"active": 15, "inactive": 15}
    }
}
```

---

### 4. Geographic Distribution
- **URL**: `GET /api/contributor/geography/`
- **Method**: `GET`
- **Auth**: Contributor or Admin
- **Description**: User counts grouped by state and country.

#### Example Response
```json
{
    "by_state": [
        {"state": "Lagos", "count": 80},
        {"state": "Abuja", "count": 55}
    ],
    "by_country": [
        {"country": "Nigeria", "count": 200},
        {"country": "Ghana", "count": 50}
    ]
}
```

---

## Admin / Super Admin Analytics

### 1. Platform Dashboard
- **URL**: `GET /api/admin/dashboard/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Platform-wide overview of users, courses, revenue, and trends.

#### Example Response
```json
{
    "total_users": 5000,
    "total_courses": 120,
    "total_revenue": 5000000.0,
    "user_growth": [
        {"month": "2026-01", "count": 200},
        {"month": "2026-02", "count": 350}
    ],
    "enrollment_trends": [
        {"month": "2026-01", "count": 450},
        {"month": "2026-02", "count": 600}
    ],
    "user_role_distribution": [
        {"role": "USER", "count": 4200},
        {"role": "TUTOR", "count": 500},
        {"role": "INFLUENCER", "count": 200},
        {"role": "CONTRIBUTOR", "count": 100}
    ],
    "course_category_popularity": [
        {"category": "Technology", "enrollments": 1200},
        {"category": "Finance", "enrollments": 800}
    ]
}
```

---

### 2. Platform Quiz Stats
- **URL**: `GET /api/admin/quiz-stats/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Platform-wide quiz performance metrics.

#### Example Response
```json
{
    "total_attempts": 8500,
    "passed": 6200,
    "failed": 2300,
    "average_score": 72.4
}
```

---

### 3. Platform Summary
- **URL**: `GET /api/admin/platform-summary/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: High-level KPI row for the admin overview page.

#### Example Response
```json
{
    "total_users": 5000,
    "total_courses": 120,
    "total_revenue": 5000000.0,
    "monthly_active_users": 1200,
    "course_completion_rate": 48.33,
    "avg_platform_rating": 4.2,
    "open_support_tickets": 0,
    "pending_verifications": 5
}
```

---

### 4. Revenue by Category
- **URL**: `GET /api/admin/revenue-by-category/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Revenue and enrollment count broken down by course category.

#### Example Response
```json
{
    "by_category": [
        {"category": "Technology", "revenue": 2500000.0, "enrollments": 1200},
        {"category": "Finance", "revenue": 1500000.0, "enrollments": 800},
        {"category": "Business", "revenue": 1000000.0, "enrollments": 500}
    ]
}
```

---

### 5. User Growth by Role
- **URL**: `GET /api/admin/user-growth/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Stacked monthly growth data by user role.

#### Example Response
```json
{
    "monthly": [
        {
            "month": "2026-01",
            "USER": 150,
            "TUTOR": 20,
            "INFLUENCER": 10,
            "CONTRIBUTOR": 5,
            "ADMIN": 1,
            "SUPER_ADMIN": 0
        },
        {
            "month": "2026-02",
            "USER": 200,
            "TUTOR": 30,
            "INFLUENCER": 15,
            "CONTRIBUTOR": 8,
            "ADMIN": 0,
            "SUPER_ADMIN": 0
        }
    ]
}
```

---

### 6. Completion Trends
- **URL**: `GET /api/admin/completion-trends/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Monthly platform-wide course completion rate as a percentage.

#### Example Response
```json
{
    "monthly": [
        {"month": "2026-01", "completion_rate": 44.5},
        {"month": "2026-02", "completion_rate": 51.2},
        {"month": "2026-03", "completion_rate": 48.9}
    ]
}
```

---

### 7. Event Application Stats
- **URL**: `GET /api/admin/event-stats/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Top 10 events by applications and monthly application volume.

#### Example Response
```json
{
    "events": [
        {
            "event_id": 3,
            "title": "Blockchain Bootcamp",
            "applications": 250,
            "date": "2026-06-15"
        }
    ],
    "by_month": [
        {"month": "2026-04", "applications": 180},
        {"month": "2026-05", "applications": 320}
    ]
}
```

---

### 8. Rating Distribution
- **URL**: `GET /api/admin/rating-stats/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Average rating per course and platform-wide star distribution.

#### Example Response
```json
{
    "by_course": [
        {"course_id": 5, "title": "DeFi Fundamentals", "avg_rating": 4.8, "reviews": 42},
        {"course_id": 1, "title": "Blockchain Basics", "avg_rating": 4.5, "reviews": 88}
    ],
    "distribution": [
        {"rating": 5, "count": 320},
        {"rating": 4, "count": 210},
        {"rating": 3, "count": 80},
        {"rating": 2, "count": 20},
        {"rating": 1, "count": 5}
    ]
}
```

---

### 9. Platform Geography
- **URL**: `GET /api/admin/users/geography/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: All platform users grouped by state and country.

#### Example Response
```json
{
    "by_state": [
        {"state": "Lagos", "count": 1800},
        {"state": "Abuja", "count": 900}
    ],
    "by_country": [
        {"country": "Nigeria", "count": 4500},
        {"country": "Ghana", "count": 300},
        {"country": "Kenya", "count": 200}
    ]
}
```

---

### 10. Monthly Active Users
- **URL**: `GET /api/admin/active-users/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Count of users active (last login) in each of the last 6 months.

#### Example Response
```json
{
    "monthly": [
        {"month": "2025-12", "active": 800},
        {"month": "2026-01", "active": 950},
        {"month": "2026-02", "active": 1100},
        {"month": "2026-03", "active": 1050},
        {"month": "2026-04", "active": 1250},
        {"month": "2026-05", "active": 1200}
    ]
}
```

---

### 11. Course Performance Matrix
- **URL**: `GET /api/admin/course-performance/`
- **Method**: `GET`
- **Auth**: Admin or Super Admin
- **Description**: Enrollments vs. completion rate per course for scatter/bar charts.

#### Example Response
```json
{
    "courses": [
        {
            "course_id": 1,
            "title": "Blockchain Basics",
            "enrollments": 450,
            "completion_rate": 62.5
        },
        {
            "course_id": 2,
            "title": "Smart Contracts",
            "enrollments": 280,
            "completion_rate": 44.2
        }
    ]
}
```

---

## Error Responses

All endpoints return standard error responses:

| Code | Meaning | Example |
|---|---|---|
| `401 Unauthorized` | Missing or invalid JWT token | `{"detail": "Authentication credentials were not provided."}` |
| `403 Forbidden` | Insufficient role permissions | `{"detail": "Permission denied"}` |
| `404 Not Found` | Requested user/resource not found | `{"detail": "Not found."}` |
