# Contributor Dashboard API

This documentation outlines the endpoints available for users with the `CONTRIBUTOR` role.

## 1. Check Referral Code

Retrieves the active referral code. Contributor codes do not expire.

**URL**: `/api/contributor/check-code/`
**Method**: `GET`
**Authentication**: Required (Contributor)

### Success Response

**Code**: `200 OK`

```json
{
    "referral_code": "BLK-ORL-A12-8U2",
    "created_at": "2026-04-01T10:00:00Z",
    "expires_at": null,
    "is_permanent": true
}
```

---

## 2. Bulk User Creation

Allows contributors to create multiple users at once. Their active referral code is automatically attached to each user.

**URL**: `/api/contributor/bulk-create/`
**Method**: `POST`
**Authentication**: Required (Contributor)

### Request Body

```json
{
    "users": [
        {
            "full_name": "Student One",
            "email": "student1@example.com",
            "role": "USER",
            "lga": "Lagos Island",
            "country": "Nigeria"
        },
        {
            "full_name": "Tutor Test",
            "email": "tutor@test.com",
            "role": "TUTOR",
            "lga": "Alimosho",
            "country": "Nigeria"
        }
    ]
}
```

### Success Response

**Code**: `201 Created` (if at least one user was created) or `200 OK` (if no new users were created)

```json
{
    "message": "Bulk creation completed. Created: 1, Skipped: 1.",
    "created_users": [
        {
            "id": 15,
            "username": "student1student4567",
            "email": "student1@example.com"
        }
    ],
    "skipped_users": [
        {
            "email": "tutor@test.com",
            "reason": "Email already exists"
        }
    ]
}
```

---

## 3. My Created Users

Returns a list of all users created using the contributor's referral codes.

**URL**: `/api/contributor/my-users/`
**Method**: `GET`
**Authentication**: Required (Contributor)

### Success Response

**Code**: `200 OK`

```json
{
    "total_count": 1,
    "created_users": [
        {
            "id": 15,
            "username": "student1student4567",
            "email": "student1@example.com",
            "full_name": "Student One",
            "date_joined": "2026-04-08T10:30:00Z",
            "referred_by": "BLK-ORL-A12-8U2"
        }
    ]
}
```
