# Change Password

Allows a user to change their account password

**URL**: `/api/auth/change-password/`
**Method**: `POST`
**Authentication**: Required (`Bearer`)

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `current_password` | `string` | Yes | Current password |
| `new_password` | `string` | Yes | New Password |

### Example Request

```json
{
    "current_password": "password",
    "new_password": "newpassword"
}
```

## Success Response

**Code**: `201 Created`

```json
{
    "message": "Password changed successfully."
}

```

## Error Response

**Code**: `400 Bad Request`

```json
{
    "error": "Current password is incorrect."
}
```

