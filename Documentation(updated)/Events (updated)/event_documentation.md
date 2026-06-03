# Events and Applications API Documentation

This document describes the API endpoints for managing events and event applications.

## Authentication
Most endpoints require authentication using a JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

---

## Event Endpoints

### 1. List Events
- **URL**: `GET /api/events/`
- **Method**: `GET`
- **Authentication**: Not Required
- **Description**: Returns a list of all upcoming events.

#### Success Response
**Code**: `200 OK`
```json
[
    {
        "id": 1,
        "title": "Blockchain Workshop",
        "description": "A deep dive into blockchain technology.",
        "date": "2026-04-15T10:00:00Z",
        "is_online": false,
        "event_url": null,
        "location": "Lagos, Nigeria",
        "creator": {
            "id": 12,
            "username": "admin_user",
            "email": "admin@example.com"
        },
        "organizers": [
            {
                "id": 12,
                "username": "admin_user",
                "email": "admin@example.com"
            }
        ],
        "image_url": "https://example.com/event.jpg",
        "created_at": "2026-03-07T13:00:00Z",
        "updated_at": "2026-03-07T13:00:00Z"
    }
]
```

### 2. Create Event
- **URL**: `POST /api/events/`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Create a new event. The authenticated user becomes the organizer.

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Title of the event. |
| `description` | `string` | Yes | Detailed description. |
| `date` | `datetime` | Yes | Event date and time (ISO 8601). |
| `is_online` | `boolean` | No | Whether the event is online (Defaults to `false`). |
| `event_url` | `string` | No | URL for the online event (Only accepted if `is_online` is `true`). |
| `location` | `string` | Conditionally | Physical location (Required if `is_online` is `false`). |
| `organizer_ids` | `array of ints` | No | IDs of the organizer users (Defaults to creator). |
| `image_url` | `string` | No | URL to event image. |
| `registration_fee` | `decimal` | No | Fee for registration. |
| `event_fee` | `decimal` | No | Main fee for the event. |

#### Conditional Field Logic
- **Online Events (`is_online: true`)**:
  - The `event_url` field is accepted.
  - The `location` field is ignored and will be set to `null` even if provided.
- **In-person Events (`is_online: false`)**:
  - The `location` field is **required**.
  - The `event_url` field is ignored and will be set to `null` even if provided.

#### Payment Logic
- **Paid Events (`registration_fee + event_fee > 0`)**:
  - When applying, the API returns a Paystack authorization URL.
  - The application is only fully processed and set to `accepted` after the payment is verified.
- **Free Events (`registration_fee + event_fee == 0`)**:
  - The user is registered immediately, and the application status is set to `accepted`.


#### Error Responses
- `400 Bad Request`: If required fields are missing or invalid.
  ```json
  {
      "title": ["This field is required."]
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```

### 3. Retrieve Event
- **URL**: `GET /api/events/{id}/`
- **Method**: `GET`
- **Authentication**: Not Required

#### Error Responses
- `404 Not Found`: If the event does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 4. Update Event
- **URL**: `PUT/PATCH /api/events/{id}/`
- **Method**: `PUT/PATCH`
- **Authentication**: Required (Organizer only)

#### Error Responses
- `400 Bad Request`: If invalid data is provided (PUT/PATCH).
  ```json
  {
      "date": ["Datetime has wrong format."]
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not an organizer of the event.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
- `404 Not Found`: If the event does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 5. Delete Event
- **URL**: `DELETE /api/events/{id}/`
- **Method**: `DELETE`
- **Authentication**: Required (Organizer only)

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not an organizer of the event.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
- `404 Not Found`: If the event does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

---

## Event Application Endpoints

### 1. Apply for an Event
- **URL**: `POST /api/event-applications/`
- **Method**: `POST`
- **Authentication**: Required
- **Body**: 
  ```json
  {
      "event": 14,
      "callback_url": "https://your-frontend.com/payment-verify"
  }
  ```
- **Description**: Register for an event. Users can only apply once per event.
    - **For Free Events**: Instantly registers the user and returns a `201 Created` status with the application data.
    - **For Paid Events**: Generates a Paystack checkout session and returns a `200 OK` status. The user must complete the payment on Paystack.

#### Example Response (Paid Event)
```json
{
    "message": "Payment required",
    "authorization_url": "https://checkout.paystack.com/xxxxxxxxx",
    "reference": "EVENT_1_5_abcdefghij",
    "amount": 5000.0
}
```


#### Error Responses
- `400 Bad Request`: Raises ValidationError `"You have already applied for this event."` if applying again.
  ```json
  [
      "You have already applied for this event."
  ]
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `404 Not Found`: If the event ID does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 2. My Applications
- **URL**: `GET /api/event-applications/`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Returns applications submitted by the authenticated user.

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```

### 3. View Event Applications (For Organizers)
- **URL**: `GET /api/events/{event_id}/applications/`
- **Method**: `GET`
- **Authentication**: Required (Organizer or Staff only)
- **Description**: Returns all applications for a specific event.

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: `{"detail": "You do not have permission to view applications for this event."}` if the user is not an organizer or staff.
  ```json
  {
      "detail": "You do not have permission to view applications for this event."
  }
  ```
- `404 Not Found`: If the event does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 4. Update Application Status
- **URL**: `PATCH /api/event-applications/{id}/update-status/`
- **Method**: `PATCH`
- **Authentication**: Required (Organizer or Staff only)
- **Body**: `{"status": "accepted"}` or `{"status": "rejected"}`

#### Error Responses
- `400 Bad Request`: `{"detail": "Invalid status. Choose 'accepted' or 'rejected'."}`
  ```json
  {
      "detail": "Invalid status. Choose 'accepted' or 'rejected'."
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: `{"detail": "You do not have permission to update the status of this application."}`
  ```json
  {
      "detail": "You do not have permission to update the status of this application."
  }
  ```
- `404 Not Found`: If the application does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```
