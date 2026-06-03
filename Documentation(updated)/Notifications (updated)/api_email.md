# Admin Email Notifications

Allows Super Admins and Admins to send styled HTML emails to users globally or individually.

**URL**: `/api/notifications/admin/send-email/`
**Method**: `POST`
**Authentication**: Required (`Bearer`, Admin/SuperAdmin)

> [!IMPORTANT]
> This endpoint triggers immediate email delivery. Improper use with large recipient lists on Vercel may be subject to SMTP port restrictions (587).

## POST Request

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | `string` | Yes | The email subject line. |
| `message` | `string` | Yes | The main content/body of the email. |
| `user_ids` | `array of ints` | No | Optional list of user IDs to target. If omitted, sends to **all** users. |
| `action_text`| `string` | No | Text for the call-to-action button in the email. |
| `action_url` | `string` (URL) | No | Destination URL for the action button. |

### Example Request

```json
{
    "user_ids": [12, 15],
    "subject": "Platform Update",
    "message": "We've added new features to your dashboard! Check them out today.",
    "action_text": "View Dashboard",
    "action_url": "https://blockchainoracle.com/dashboard"
}
```

### Success Response

**Code**: `200 OK`

```json
{
    "detail": "Emails queued for 2 users."
}
```

## Error Responses

- `400 Bad Request`: If required fields are missing or invalid data types are provided.
  ```json
  {
      "subject": ["This field is required."]
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user does not have Admin or Super Admin privileges.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
