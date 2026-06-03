# Influencer Dashboard API

This documentation outlines the endpoints available for users with the `INFLUENCER` role to track their performance and payouts.

## 1. Check Referral Code

Retrieves the active referral code and a history of all codes generated.

**URL**: `/api/influencer/check-code/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "active_code": {
        "code": "BLK-ORL-A12-8U2",
        "created_at": "2026-04-01T10:00:00Z",
        "expires_at": "2026-05-01T10:00:00Z",
        "days_remaining": 25
    },
    "all_codes": [
        {
            "code": "BLK-ORL-A12-8U2",
            "created_at": "2026-04-01T10:00:00Z",
            "expires_at": "2026-05-01T10:00:00Z",
            "is_expired": false
        }
    ]
}
```

---

## 2. Refresh Referral Code

Generates a new referral code and expires the previous one immediately.

**URL**: `/api/influencer/refresh-code/`
**Method**: `POST`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "referral_code": "BLK-ORL-XYZ-123",
    "created_at": "2026-04-08T10:00:00Z",
    "expires_at": "2026-05-08T10:00:00Z"
}
```

---

## 3. Code Analytics

View all referral codes and the number of people referred through each specific code.

**URL**: `/api/influencer/code-analytics/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "analytics": [
        {
            "code": "BLK-ORL-A12-8U2",
            "created_at": "2026-04-01T10:00:00Z",
            "expires_at": "2026-05-01T10:00:00Z",
            "is_expired": false,
            "referee_count": 45
        }
    ]
}
```

---

## 4. Referee Summary

View total referee counts and monthly breakdowns across all codes.

**URL**: `/api/influencer/referee-summary/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "total_referees": 150,
    "referees_by_month": [
        {
            "month": "2026-04-01T00:00:00Z",
            "count": 45
        },
        {
            "month": "2026-03-01T00:00:00Z",
            "count": 105
        }
    ]
}
```

---

## 5. Referee List

Retrieves a detailed list of all users referred by the influencer (via any of their codes).

**URL**: `/api/influencer/referees/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "referees": [
        {
            "id": 12,
            "username": "jdoe_456",
            "email": "jdoe@example.com",
            "full_name": "Jane Doe",
            "date_joined": "2026-04-05T15:30:00Z",
            "referred_by": "BLK-ORL-A12-8U2"
        }
    ]
}
```

---

## 6. Payout Summary

Track accumulated, pending, and received payouts (20% share of course enrollments).

**URL**: `/api/influencer/payouts/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "total_accumulated": 450.00,
    "pending": 150.00,
    "received": 300.00
}
```

> [!NOTE]
> Payouts are automatically generated when a student you referred enrolls in a course.

---

## 7. Dashboard Summary

Consolidates all key influencer metrics into a single call for efficient dashboard loading.

**URL**: `/api/influencer/dashboard/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "summary": {
        "total_referees": 150,
        "total_purchases": 45,
        "total_earnings": 450.00,
        "pending_payout": 150.00,
        "received_payout": 300.00
    },
    "active_code": {
        "code": "BLK-ORL-A12-8U2",
        "days_remaining": 25,
        "referee_count": 45
    },
    "monthly_stats": [
        {
            "month": "2026-04",
            "new_referees": 45,
            "purchases": 12,
            "earnings": 120.00
        }
    ]
}
```

---

## 8. Referee Purchases

Detailed list of all course purchases made by students you referred.

**URL**: `/api/influencer/referee-purchases/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "results": [
        {
            "referee_id": 12,
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "course_name": "Blockchain Fundamentals",
            "amount_paid": 49.99,
            "payment_date": "2026-04-15T10:00:00Z",
            "status": "completed"
        }
    ]
}
```

---

## 9. Code Purchases

Track purchases attributed to specific referral codes to analyze which codes are performing best.

**URL**: `/api/influencer/code-purchases/`
**Method**: `GET`
**Authentication**: Required (Influencer)

### Success Response

**Code**: `200 OK`

```json
{
    "results": [
        {
            "code": "BLK-ORL-HFW-BGK",
            "referee": {
                "id": 12,
                "full_name": "Jane Doe",
                "email": "jane@example.com"
            },
            "course": {
                "id": 5,
                "name": "Blockchain Fundamentals",
                "price": 49.99
            },
            "commission": 9.99,
            "payment_date": "2026-04-15T10:00:00Z",
            "status": "completed"
        }
    ]
}
```
