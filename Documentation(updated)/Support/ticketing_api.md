# Support Ticketing API Documentation

The Support Ticketing System allows users to submit support requests (tickets) and communicate directly with administrators through a built-in chat interface.

---

## 1. Ticket Management

### List & Create Tickets (User)
- **URL**: `/api/v1/support/tickets/`
- **Method**: `GET`, `POST`
- **Authentication**: Required

**POST Request Body**:
```json
{
    "subject": "Issue with course enrollment",
    "description": "I cannot enroll in the Blockchain Basics course. It gives an error."
}
```

**Description**:
- `GET`: Retrieves a list of all tickets created by the authenticated user.
- `POST`: Creates a new ticket (default status is `pending`). Triggers an email and in-app notification to administrators.

**Success Response (GET array / POST single object)**:
```json
{
    "id": 1,
    "user": {
        "id": 5,
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@example.com",
        "profile_picture": "https://example.com/photo.jpg"
    },
    "subject": "Issue with course enrollment",
    "description": "I cannot enroll in the Blockchain Basics course. It gives an error.",
    "status": "pending",
    "assigned_to": null,
    "created_at": "2026-05-18T10:00:00Z",
    "updated_at": "2026-05-18T10:00:00Z"
}
```

### List All Tickets (Admin Only)
- **URL**: `/api/v1/support/tickets/admin/`
- **Method**: `GET`
- **Authentication**: Required (Admin/Super Admin)
- **Query Parameters**:
  - `status` (optional): Filter tickets by status (e.g., `?status=pending`, `?status=open`).
- **Description**: Returns all support tickets in the system.

**Success Response**:
```json
[
    {
        "id": 1,
        "user": {
            "id": 5,
            "username": "johndoe",
            "full_name": "John Doe",
            "email": "john@example.com",
            "profile_picture": "https://example.com/photo.jpg"
        },
        "subject": "Issue with course enrollment",
        "description": "I cannot enroll in the Blockchain Basics course. It gives an error.",
        "status": "pending",
        "assigned_to": null,
        "created_at": "2026-05-18T10:00:00Z",
        "updated_at": "2026-05-18T10:00:00Z"
    }
]
```

### Retrieve & Update Ticket
- **URL**: `/api/v1/support/tickets/{id}/`
- **Method**: `GET`, `PATCH`
- **Authentication**: Required (Ticket Owner or Admin)

**PATCH Request Body (Admin Accepting a Ticket)**:
```json
{
    "status": "open"
}
```

**Description**:
- `GET`: Fetch details of a specific ticket.
- `PATCH`: Update a ticket. If an Admin changes the status to `open`, the ticket is assigned to that Admin, and the ticket owner receives an email and in-app notification. If the status is changed to `closed`, the user is also notified.

**Success Response (GET / PATCH)**:
```json
{
    "id": 1,
    "user": {
        "id": 5,
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@example.com",
        "profile_picture": "https://example.com/photo.jpg"
    },
    "subject": "Issue with course enrollment",
    "description": "I cannot enroll in the Blockchain Basics course. It gives an error.",
    "status": "open",
    "assigned_to": {
        "id": 2,
        "username": "adminuser",
        "full_name": "Admin User",
        "email": "admin@example.com",
        "profile_picture": "https://example.com/admin.jpg"
    },
    "created_at": "2026-05-18T10:00:00Z",
    "updated_at": "2026-05-18T10:05:00Z"
}
```

### Update Ticket Status (Admin Only)
- **URL**: `/api/v1/support/tickets/{id}/status/`
- **Method**: `PATCH`
- **Authentication**: Required (Admin/Super Admin)

**PATCH Request Body**:
```json
{
    "status": "resolved"
}
```

**Description**:
- `PATCH`: Dedicated endpoint for administrators to update a ticket's status (`open`, `closed`, `resolved`). Changing the status automatically triggers appropriate email and in-app notifications to the user.

**Success Response (PATCH)**:
```json
{
    "status": "resolved"
}
```

---

## 2. Ticket Chat Messaging

### List & Send Messages
- **URL**: `/api/v1/support/tickets/{id}/messages/`
- **Method**: `GET`, `POST`
- **Authentication**: Required (Ticket Owner or Admin)

**POST Request Body**:
```json
{
    "message": "Can you please provide a screenshot of the error?"
}
```

**Description**:
- `GET`: Retrieves the chronological chat history for the specified ticket.
- `POST`: Adds a new message to the ticket thread. Triggers an in-app notification to the counterpart (User notifies Admin, Admin notifies User). 
  - **Note**: Messages cannot be sent if the ticket status is `closed`.

**Success Response (GET)**:
```json
[
    {
        "id": 1,
        "ticket": 1,
        "sender": {
            "id": 2,
            "username": "adminuser",
            "full_name": "Admin User",
            "email": "admin@example.com",
            "profile_picture": "https://example.com/admin.jpg"
        },
        "message": "Can you please provide a screenshot of the error?",
        "created_at": "2026-05-18T10:08:00Z"
    }
]
```

**Success Response (POST)**:
```json
{
    "id": 2,
    "ticket": 1,
    "sender": {
        "id": 5,
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "john@example.com",
        "profile_picture": "https://example.com/photo.jpg"
    },
    "message": "Here is the screenshot.",
    "created_at": "2026-05-18T10:10:00Z"
}
```
