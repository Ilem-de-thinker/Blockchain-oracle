# Forgot Password

Initiates the password recovery process by providing the user's email.

**URL**: `/api/auth/forgot-password/`
**Method**: `POST`
**Authentication**: Not Required

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | The email address associated with the account. |

### Example Request

```json
{
    "email": "john@example.com"
}
```

## Success Response

**Code**: `200 OK`

```json
{
    "message": "Password reset email sent if a user with this email exists.",
    "uid": "MQ",
    "token": "as12dk-af123-token-example"
}
```

> [!NOTE]
> In a production environment, the `uid` and `token` would be sent via email rather than returned in the response. They are returned here for development/testing purposes.

## Error Responses

- `400 Bad Request`: If data is invalid (e.g., email not provided or invalid format).
  ```json
  {
      "email": ["This field is required."]
  }
  ```
