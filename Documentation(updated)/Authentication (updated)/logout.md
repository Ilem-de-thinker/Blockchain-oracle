# User Logout

Invalidates the current user's authentication token.

**URL**: `/api/auth/logout/`
**Method**: `POST`
**Authentication**: Required (`Bearer`)

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh` | `string` | Yes | The refresh token to be blacklisted. |

### Example Request

```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Success Response

**Code**: `200 OK`

```json
{
    "message": "Logged out successfully"
}
```

## Error Responses

- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
