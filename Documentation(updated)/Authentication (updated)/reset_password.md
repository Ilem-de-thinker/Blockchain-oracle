# Reset Password

Completes the password recovery process by setting a new password using a token and UID.

**URL**: `/api/auth/reset-password/`
**Method**: `POST`
**Authentication**: Not Required

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `uidb64` | `string` | Yes | The base64 encoded user ID (obtained from forgot-password). |
| `token` | `string` | Yes | The password reset token (obtained from forgot-password). |
| `new_password` | `string` | Yes | The new password for the account. |

### Example Request

```json
{
    "uidb64": "MQ",
    "token": "as12dk-af123-token-example",
    "new_password": "newStrongPassword456!"
}
```

## Success Response

**Code**: `200 OK`

```json
{
    "message": "Password reset successfully."
}
```

## Error Responses

- `400 Bad Request`: If the token is invalid, expired, or the data is malformed.
  ```json
  {
      "error": "Invalid token."
  }
  ```
