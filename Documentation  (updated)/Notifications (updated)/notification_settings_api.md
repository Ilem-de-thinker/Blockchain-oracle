# Notification Settings API

This API allows users to manage their notification preferences, including email, course updates, event reminders, marketing emails, and push notifications.

## Endpoints

| URL | Method | Auth | Description |
|---|---|---|---|
| `/api/notifications/settings/` | `GET` | Bearer | Retrieve the authenticated user's notification settings. |
| `/api/notifications/settings/` | `PUT/PATCH` | Bearer | Update notification preferences. |

---

## 1. Retrieve Settings

**URL**: `GET /api/notifications/settings/`

**Success Response (200 OK):**
```json
{
    "email_notifications": true,
    "course_updates": true,
    "event_reminders": true,
    "marketing_emails": true,
    "push_notifications": true
}
```

## 2. Update Settings

**URL**: `PATCH /api/notifications/settings/`

**Example Request (Turning off marketing emails):**
```json
{
    "marketing_emails": false
}
```

**Success Response (200 OK):**
```json
{
    "email_notifications": true,
    "course_updates": true,
    "event_reminders": true,
    "marketing_emails": false,
    "push_notifications": true
}
```

---

## Implementation Details

- **Auto-Creation**: Notification settings are automatically created for every new user upon registration via a post-save signal.
- **Access Control**: Users can only retrieve and update their own settings.
- **Default Values**: All notification types are enabled (`true`) by default.
