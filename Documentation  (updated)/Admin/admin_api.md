# Admin API Documentation

This section provides details on the administrative endpoints available for managing users and system settings.

---

## 1. User Management

These endpoints allow Admins and Super Admins to list and filter users on the platform.

### List All Users
- **Endpoint**: `GET /api/admin/users/`
- **Auth Required**: Bearer (Admin/Super Admin)
- **Description**: Returns a paginated list of all users.
- **Query Parameters**:
  - `role`: Filter by user role (e.g., `TUTOR`, `INFLUENCER`, `CONTRIBUTOR`, `ADMIN`, `USER`).
  - `search`: Search by email, full name, or username.
  - `page`: Page number for pagination.

**Example Response**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "jdoe1234",
      "email": "jdoe@example.com",
      "full_name": "John Doe",
      "phone_number": "+2348012345678",
      "role": "TUTOR",
      "profile_picture": "https://cloudinary.com/...",
      "tutor_rating": 4.5,
      "student_rating": 5.0,
      "can_verify": true,
      "is_verified": true,
      "verification_status": "verified"
    }
  ]
}
```

### Specialized User Lists
The following routes are available for targeted listing (returning the same structure as above):
- `GET /api/admin/tutors/`: Equivalent to `/api/admin/users/?role=TUTOR`
- `GET /api/admin/contributors/`: Equivalent to `/api/admin/users/?role=CONTRIBUTOR`
- `GET /api/admin/influencers/`: Equivalent to `/api/admin/users/?role=INFLUENCER`

### Retrieve, Update, or Delete a User
- **Endpoint**: `GET /api/admin/users/{id}/`
- **Endpoint**: `PATCH /api/admin/users/{id}/`
- **Endpoint**: `DELETE /api/admin/users/{id}/`
- **Auth Required**: Bearer (Admin/Super Admin)
- **Description**: Retrieve detailed information about a specific user, update user details, or permanently delete a user account.
- **Path Parameters**:
  - `id` (Integer): The unique ID of the user to retrieve, update, or delete.

**Example GET Response**:
```json
{
  "id": 1,
  "username": "jdoe1234",
  "email": "jdoe@example.com",
  "full_name": "John Doe",
  "phone_number": "+2348012345678",
  "address": "123 Main St",
  "state": "Lagos",
  "country": "Nigeria",
  "role": "TUTOR",
  "profile_picture": "https://cloudinary.com/...",
  "active_referral_code": "REF-XYZ123",
  "tutor_rating": 4.5,
  "student_rating": 5.0,
  "can_verify": true,
  "is_verified": true,
  "verification_status": "verified"
}
```

**Example PATCH Request**:
```json
{
  "full_name": "Johnathan Doe",
  "phone_number": "+2348000000000"
}
```

---

## 2. Global Settings

Manage system-wide parameters and feature flags.

### List Settings
- **Endpoint**: `GET /api/admin/settings/`
- **Auth Required**: Bearer (Admin/Super Admin)
- **Description**: Returns a list of all global settings stored in the system.

**Example Response**:
```json
[
  {
    "key": "MAINTENANCE_MODE",
    "value": "false",
    "description": "If true, site shows maintenance page"
  },
  {
    "key": "PLATFORM_FEE_PERCENT",
    "value": "5",
    "description": "The percentage commission taken from tutor earnings"
  }
]
```

### Create/Update Setting
- **Endpoint**: `POST /api/admin/settings/`
- **Endpoint**: `PATCH /api/admin/settings/{key}/`
- **Auth Required**: Bearer (Admin/Super Admin)

**Example POST Request**:
```json
{
  "key": "WELCOME_BONUS_AMOUNT",
  "value": "500",
  "description": "Amount credited to new users"
}
```

**Example PATCH Request (to `/api/admin/settings/MAINTENANCE_MODE/`)**:
```json
{
  "value": "true"
}
```

---

## 3. Existing Admin Utilities

### Create User
- **Endpoint**: `POST /api/auth/admin/create-user/`
- **Auth Required**: Bearer (Super Admin)
- **Description**: Allows manual creation of users with any role.

**Example Request**:
```json
{
  "email": "newadmin@example.com",
  "full_name": "Admin User",
  "password": "StrongPassword123!",
  "role": "ADMIN",
  "country": "Nigeria"
}
```

### Send Custom Email
- **Endpoint**: `POST /api/notifications/admin/send-email/`
- **Auth Required**: Bearer (Super Admin)
- **Description**: Send a styled HTML email to any recipient.

**Example Request**:
```json
{
  "user_ids": [1, 5, 12],
  "subject": "Platform Update",
  "message": "We have updated our terms and conditions. Please review them.",
  "action_text": "Review Now",
  "action_url": "https://blockchain-oracle.com/terms"
}
```
*Note: If `user_ids` is omitted, the email will be sent to ALL registered users.*

---

## 4. Admin Reporting & Feedback

### List User Ratings
- **Endpoint**: `GET /api/auth/admin/users/ratings/`
- **Auth Required**: Bearer (Admin/Super Admin)
- **Description**: List all users with their associated tutor and student ratings.
- **Example Response**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "jdoe1234",
      "full_name": "John Doe",
      "tutor_rating": 4.5,
      "student_rating": 5.0
    }
  ]
}
```

### List Course Reviews
- **Endpoint**: `GET /api/admin/reviews/`
- **Auth Required**: Bearer (Admin/Super Admin)
- **Description**: Retrieve all course reviews across the platform.
- **Query Parameters**:
  - `rating`: Filter by rating value (1-5).
  - `course`: Filter by course ID.
  - `user`: Filter by user ID.
  - `ordering`: Order by `created_at` or `rating`.

**Example Response**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 5,
      "user": {
        "id": 10,
        "username": "student_one",
        "full_name": "Alice Smith"
      },
      "course": 2,
      "rating": 5,
      "comment": "Excellent course! Very informative.",
      "created_at": "2026-04-27T10:00:00Z"
    }
  ]
}
```
