# In-App Notifications API

Retrieves, updates read status, or sends new in-app notifications.

## 1. List Notifications

Retrieves a list of notifications sent specifically to the authenticated user.

**URL**: `/api/notifications/`
**Method**: `GET`
**Authentication**: Required (`Bearer`)

### Success Response

**Code**: `200 OK`

```json
[
  {
    "id": 45,
    "sender": 12,
    "sender_username": "admin_user",
    "recipient": 127,
    "title": "Course Enrollment Successful",
    "message": "You have successfully enrolled in Python 101.",
    "notification_type": "course_purchase",
    "is_read": false,
    "created_at": "2026-04-10T15:30:00Z"
  }
]
```

---

## 2. Mark as Read

Updates the specified notification status to `is_read: true`.

**URL**: `/api/notifications/{id}/read/`
**Method**: `PATCH`
**Authentication**: Required (`Bearer`)

### Success Response

**Code**: `200 OK`

```json
{
    "id": 45,
    "is_read": true,
    "created_at": "2026-04-10T15:30:00Z"
}
```

---

## 3. Send Notification

Sends a targeted notification (for Admins and Tutors).

**URL**: `/api/notifications/send/`
**Method**: `POST`
**Authentication**: Required (Tutor/Admin)

> [!NOTE]
> **Tutors** are restricted to targeting students (`role: 'USER'`) or individuals.

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `target` | `string` | Yes | Target group: `all`, `students`, `tutors`, `individual`, `course`. |
| `title` | `string` | Yes | Subject of the notification. |
| `message` | `string` | Yes | Body content. |
| `recipient_id`| `int` | Conditionally | Required if `target` is `individual`. |
| `course_id` | `int` | Conditionally | Required if `target` is `course`. |
| `notification_type` | `string` | No | One of the allowed types (Defaults to `general`). |

### Example Requests

**Group Target:**
```json
{
    "target": "students",
    "title": "New Assignment",
    "message": "Please review the new materials in your dashboard."
}
```

**Individual Target:**
```json
{
    "target": "individual",
    "recipient_id": 12,
    "title": "Private Message",
    "message": "This is sent only to user 12."
}
```

**Course Target:**
```json
{
    "target": "course",
    "course_id": 5,
    "title": "Class Canceled",
    "message": "The session for Python 101 today is postponed."
}
```

### Success Response

**Code**: `201 Created`

```json
{
    "detail": "Notification sent to 150 users."
}
```

### Error Responses

**Code**: `400 Bad Request`
```json
{
    "detail": "recipient_id is required for individual target."
}
// OR
{
    "detail": "course_id is required for course target."
}
```

**Code**: `403 Forbidden`
```json
{
    "detail": "Tutors can only send to students or individuals."
}
// OR
{
    "detail": "Tutors can only send notifications to students."
}
// OR
{
    "detail": "You can only target courses you teach."
}
```

**Code**: `404 Not Found`
```json
{
    "detail": "Course not found."
}
// OR
{
    "detail": "No recipients found for the specified target."
}
```

---

## 4. Delete Notification

Removes a specific notification from the database.

**URL**: `/api/notifications/{id}/delete/`
**Method**: `DELETE`
**Authentication**: Required (Admin only)

**Code**: `204 No Content`

---

## 5. Notify Tutor

Allows a student to send a direct notification to the tutor of a course they are enrolled in. The Course ID is automatically included in the title for the tutor's convenience.

**URL**: `/api/notifications/notify-tutor/`
**Method**: `POST`
**Authentication**: Required (Authenticated User)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `course_id` | `int` | Yes | ID of the course. |
| `title` | `string` | Yes | Subject of the message. |
| `message` | `string` | Yes | Body content. |

> [!NOTE]
> The system automatically prefixes the title: `[Course ID: {id}] {original_title}`.

### Success Response

**Code**: `201 Created`
```json
{
    "detail": "Notification sent to the tutor."
}
```

### Error Responses

**Code**: `403 Forbidden`
```json
{
    "detail": "You must be enrolled in this course to notify the tutor."
}
```

---

## 6. Notify Admin

Allows any user to send a notification to all platform administrators.

**URL**: `/api/notifications/notify-admin/`
**Method**: `POST`
**Authentication**: Required (Authenticated User)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `course_id` | `int` | No | Optional ID of a course to reference. |
| `title` | `string` | Yes | Subject of the message. |
| `message` | `string` | Yes | Body content. |

> [!NOTE]
> If `course_id` is provided, the title is automatically prefixed: `[Course ID: {id}] {original_title}`.

### Success Response

**Code**: `201 Created`
```json
{
    "detail": "Notification sent to admins."
}
```
