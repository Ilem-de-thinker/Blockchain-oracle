# User Login

Authenticates a user and returns an API token.

**URL**: `/api/auth/login/`
**Method**: `POST`
**Authentication**: Not Required

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | User's email address. |
| `password` | `string` | Yes | User's password. |

### Example Request

```json
{
    "email": "john@example.com",
    "password": "strongPassword123!"
}
```

## Success Response

**Code**: `200 OK`

```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "full_name": "John Doe",
        "phone_number": "+1234567890",
        "address": "123 Oracle St, Web3 City",
        "role": "USER",
        "user_category": "user",
        "onboarding_fee": false,
        "bio": null,
        "profile_picture": null,
        "can_verify": true,
        "is_verified": false,
        "verification_status": "unverified"
    }
}
```

## Error Responses

- `401 Unauthorized`: Invalid credentials.
  ```json
  {
      "error": "Invalid Credentials"
  }
  ```
