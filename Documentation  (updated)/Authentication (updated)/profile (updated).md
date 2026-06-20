# User Profile

Retrieves or updates the authenticated user's profile information.

**URL**: `/api/auth/profile/`
**Method**: `GET`, `PATCH`
**Authentication**: Required (`Bearer`)

> [!NOTE]
> `username`, `role`, `active_referral_code`, and `id` are **read-only** fields and cannot be modified via `PATCH`.

## GET Request

Retrieves the current user's profile.

### Success Response

**Code**: `200 OK`

```json
{
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone_number": "+1234567890",
    "address": "123 Oracle St, Web3 City",
    "lga": "Main LGA",
    "state": "Lagos",
    "country": "Nigeria",
    "role": "USER",
    "user_category": "user",
    "onboarding_fee": false,
    "bio": "Blockchain enthusiast.",
    "profile_picture": "http://localhost:8000/media/profile_pics/john.jpg",
    "referred_by": "BLK-ORL-A12-8U2",
    "active_referral_code": "BLK-ORL-B56-9Z2",
    "can_verify": true,
    "is_verified": false,
    "verification_status": "unverified"
}
```

## PATCH Request

Updates specific fields of the user's profile.

### Request Body (Optional Fields)

- `email`
- `full_name`
- `phone_number`
- `address`
- `lga`
- `state`
- `country`
- `bio`
- `profile_picture` (Multipart/form-data) — *Note: Use the dedicated [Profile Picture Update](./profile_picture%20(updated).md) endpoint for better management.*

### Example Request

```json
{
    "bio": "Updated bio content.",
    "country": "Nigeria"
}
```

### Success Response

**Code**: `200 OK` (Returns updated user object)

## Error Responses

- `400 Bad Request`: If invalid data is provided in the PATCH request.
  ```json
  {
      "email": ["Enter a valid email address."]
  }
  ```
- `401 Unauthorized`: Authentication required.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```

---

# Other User's Profile

Retrieves the profile information of another user by their unique ID.

**URL**: `/api/auth/users/{id}/profile/`
**Method**: `GET`
**Authentication**: Required (`Bearer`)
**Access**: Any authenticated user.

## GET Request

### Success Response

**Code**: `200 OK`

```json
{
    "id": 5,
    "username": "janedoe",
    "email": "jane@example.com",
    "full_name": "Jane Doe",
    "phone_number": "+1234567891",
    "role": "TUTOR",
    "bio": "Expert Blockchain Tutor",
    "profile_picture": "https://cloudinary.com/...",
    "tutor_rating": 4.8,
    "student_rating": 5.0,
    "can_verify": true,
    "is_verified": true,
    "verification_status": "verified"
}
```

## Error Responses

- `401 Unauthorized`: Authentication required.
- `404 Not Found`: If no user exists with the provided ID.
  ```json
  {
      "detail": "Not found."
  }
  ```
