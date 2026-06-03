# Admin: Create User

Allows a Super Admin to create a user account with any role.

**URL**: `/api/auth/admin/create-user/`
**Method**: `POST`
**Authentication**: Required (`Bearer`)
**Role Restricted**: `SUPER_ADMIN` only.

## Request Body

Identical to the [Public Registration Body](./register.md), but allows all roles:

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | Unique email address (Used for login). |
| `password` | `string` | Yes | Account password. |
| `full_name` | `string` | Yes | User's full name. |
| `role` | `string` | Yes | One of: `USER`, `TUTOR`, `SUPER_ADMIN`, `ADMIN`, `INFLUENCER`. |

### Example Request

```json
{
    "password": "secureAdminPassword789!",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "ADMIN"
}
```

## Success Response

**Code**: `201 Created`

```json
{
    "username": "adminadmin5678",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "ADMIN"
}
```

## Error Responses

- `400 Bad Request`: Invalid data.
  ```json
  {
      "email": ["user with this email already exists."]
  }
  ```
- `401 Unauthorized`: Authentication credentials missing.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not a `SUPER_ADMIN`.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
