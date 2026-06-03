# Token Refresh

Obtain a new Access Token using a valid Refresh Token.

**URL**: `/api/auth/token/refresh/`
**Method**: `POST`
**Authentication**: Not Required (Refresh Token is in the body)

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `refresh` | `string` | Yes | The refresh token obtained during login. |

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
    "access": "new_access_token_string..."
}
```

## Error Responses

- `401 Unauthorized`: If the refresh token is invalid or expired.
  ```json
  {
      "detail": "Token is invalid or expired",
      "code": "token_not_valid"
  }
  ```
