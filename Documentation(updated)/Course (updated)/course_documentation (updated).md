# Course and Enrollment API Documentation

This document describes the API endpoints for managing courses and enrollments.

## Authentication
Most endpoints require authentication using a JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

---

## Course Endpoints

### 1. List Courses
- **URL**: `GET /api/courses/`
- **Method**: `GET`
- **Authentication**: Not Required
- **Description**: Returns a list of all available courses. If a user is a TUTOR, it only returns their own courses.
  > **Security Note**: For regular users and unauthenticated users, the `modules` array inside the course object only returns the `id` and `title`. Only `ADMIN`, `SUPER_ADMIN`, and `TUTOR` roles receive the full module objects (with materials and quizzes) in this endpoint. Students should fetch full modules via the dedicated `GET /api/courses/{course_id}/modules/` endpoint.

#### Query Parameters
| Parameter | Type | Description |
|---|---|---|
| `page` | `int` | Page number (default: 1). |
| `page_size` | `int` | Items per page (default: 10, max: 50). |
| `category` | `string` | Filter by course category. |
| `level` | `string` | Filter by course level (`Beginner`, `Intermediate`, `Advanced`). |
| `price` | `decimal` | Filter by total price. |
| `is_published` | `boolean` | Filter by publication status (`true`/`false`). |
| `search` | `string` | Search in `title` and `description`. |
| `ordering` | `string` | Order by `price`, `created_at`, or `title`. Use `-` for descending (e.g., `-created_at`). |


#### Success Response (For Regular Users)
**Code**: `200 OK` (Paginated)
```json
{
    "count": 1,
    "next": null,
    "previous": null,
    "items": [
        {
            "id": 1,
            "title": "Test Course",
            "description": "This is a test request",
            "thumbnail_url": "https://example.com/thumbnail.jpg",
            "registration_fee": "1000.00",
            "tuition_fee": "8000.00",
            "certificate_fee": "1000.00",
            "total_amount": "10000.00",
            "allow_installments": true,
            "category": "Technology",
            "level": "Beginner",
            "is_published": true,
            "tutor": {
                "id": 12,
                "username": "test2test6910",
                "email": "test2@gmail.com",
                "full_name": "Test Tutor",
                "role": "TUTOR"
            },
            "modules": [
                {
                    "id": 1,
                    "title": "Main Content"
                }
            ],
            "created_at": "2026-02-27T22:31:55.524064Z",
            "updated_at": "2026-02-27T22:35:07.289626Z"
        }
    ]
}
```

#### Success Response (For Admins and Tutors)
**Code**: `200 OK` (Paginated)
```json
{
    "count": 1,
    "next": null,
    "previous": null,
    "items": [
        {
            "id": 1,
            "title": "Test Course",
            "description": "This is a test request",
            "thumbnail_url": "https://example.com/thumbnail.jpg",
            "registration_fee": "1000.00",
            "tuition_fee": "8000.00",
            "certificate_fee": "1000.00",
            "total_amount": "10000.00",
            "allow_installments": true,
            "category": "Technology",
            "level": "Beginner",
            "is_published": true,
            "tutor": {
                "id": 12,
                "username": "test2test6910",
                "email": "test2@gmail.com",
                "full_name": "Test Tutor",
                "role": "TUTOR"
            },
            "modules": [
                {
                    "id": 1,
                    "title": "Main Content",
                    "description": "Introduction to the course",
                    "order": 1,
                    "materials": [
                        {
                            "id": 1,
                            "type": "video",
                            "title": "Module 1 Intro",
                            "order": 1,
                            "url": "https://example.com/video1.mp4",
                            "duration": 300
                        }
                    ]
                }
            ],
            "created_at": "2026-02-27T22:31:55.524064Z",
            "updated_at": "2026-02-27T22:35:07.289626Z"
        }
    ]
}
```

### 2. Create Course
- **URL**: `POST /api/courses/`
- **Method**: `POST`
- **Authentication**: Required (`TUTOR`, `ADMIN`, or `SUPER_ADMIN`)

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Title of the course. |
| `description` | `string` | Yes | Detailed course description. |
| `thumbnail_url` | `string` | No | URL to course thumbnail image. |
| `registration_fee` | `decimal` | No | Fee for initial registration. |
| `tuition_fee` | `decimal` | No | Fee for tuition. |
| `certificate_fee` | `decimal`| No | Fee for the certificate. |
| `allow_installments`| `boolean`| No | Enable/Disable partial payment options. |
| `category` | `string` | No | Course category. |
| `level` | `string` | No | `Beginner`, `Intermediate`, `Advanced`. |
| `is_published` | `boolean`| No | Visibility status. |
| `certificate_template` | `file` | No | Optional PDF template for the course certificate. |

#### Example Request
```json
{
    "title": "Introduction to Blockchain",
    "description": "Learn the basics of blockchain technology.",
    "thumbnail_url": "https://example.com/thumbnail.jpg",
    "price": "5000.00",
    "category": "Technology",
    "level": "Beginner",
    "is_published": true
}
```

#### Error Responses
- `400 Bad Request`: If required fields are missing or invalid data is provided.
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
- `403 Forbidden`: Authenticated user is not a `TUTOR`, `ADMIN`, or `SUPER_ADMIN`.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```

### 3. Retrieve Course
- **URL**: `GET /api/courses/{id}/`
- **Method**: `GET`
- **Authentication**: Not Required
- **Description**: Returns course details including nested tutor info.
  > **Security Note**: Similar to the list endpoint, the nested `modules` array only returns `id` and `title` unless the authenticated user is an `ADMIN`, `SUPER_ADMIN`, or `TUTOR`.

#### Success Response (Regular User)
**Code**: `200 OK`
```json
{
    "id": 1,
    "title": "Test Course",
    "description": "This is a test request",
    "thumbnail_url": "https://example.com/thumbnail.jpg",
    "registration_fee": "1000.00",
    "tuition_fee": "8000.00",
    "certificate_fee": "1000.00",
    "total_amount": "10000.00",
    "allow_installments": true,
    "category": "Technology",
    "level": "Beginner",
    "is_verified": true,
    "is_published": true,
    "verified_by": {
        "id": 5,
        "username": "admin_user",
        "full_name": "Admin Name",
        "role": "ADMIN"
    },
    "tutor": {
        "id": 12,
        "username": "test2test6910",
        "email": "test2@gmail.com",
        "full_name": "Test Tutor",
        "role": "TUTOR"
    },
    "modules": [
        {
            "id": 1,
            "title": "Main Content"
        }
    ],
    "average_rating": 4.5,
    "reviews": [],
    "created_at": "2026-02-27T22:31:55.524064Z",
    "updated_at": "2026-02-27T22:35:07.289626Z"
}
```

#### Error Responses
- `404 Not Found`: If the course with the specified ID does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 4. Toggle Course Verification
- **URL**: `PUT /api/courses/{course_id}/toggle-verification/`
- **Method**: `PUT`
- **Authentication**: Required (`ADMIN` or `SUPER_ADMIN` with `can_verify=True`)
- **Description**: Toggles the `is_verified` status of a course. Only authorized admins can perform this action.

#### Example Response
**Code**: `200 OK`
```json
{
    "detail": "Course verified successfully"
}
```

#### Error Responses
- `401 Unauthorized`: If the user is not authorized to verify courses.
- `404 Not Found`: If the course does not exist.

### 5. Toggle Course Publish Status
- **URL**: `PUT /api/courses/{course_id}/toggle-publish/`
- **Method**: `PUT`
- **Authentication**: Required (Tutor of the course or Admin)
- **Description**: Toggles the `is_published` status of a course. 
- **Requirement**: A course **must be verified** by an admin before it can be published.

#### Example Response
**Code**: `200 OK`
```json
{
    "detail": "Course published successfully"
}
```

#### Error Responses
- `400 Bad Request`: If attempting to publish a course that is not verified.
  ```json
  {
      "detail": "Course must be verified before publishing"
  }
  ```
- `404 Not Found`: If the course does not exist.

---

---

## Module Endpoints

### 1. List Modules
- **URL**: `GET /api/courses/{course_id}/modules/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Returns all accessible modules for a specific course.
    - **Payment Logic**: If on a partial installment plan (e.g., 40%), only that percentage of the course modules will be returned.
    - **Progression Logic**: Subsequent modules (after the first) are only returned if the user has passed the previous module's quiz with a score of at least **60% (3 out of 5 correct answers)**.


### 2. Create Module
- **URL**: `POST /api/courses/{course_id}/modules/`
- **Method**: `POST`
- **Authentication**: Required (`TUTOR` or `ADMIN`)
- **Body**:
  ```json
  {
      "title": "Module 1: Introduction",
      "description": "Learn the basics",
      "order": 1
  }
  ```

---

## Material Endpoints

### 1. List/Create Materials
- **URL**: `GET/POST /api/modules/{module_id}/materials/`
- **Method**: `GET` (List), `POST` (Create)
- **Authentication**: `POST` requires `TUTOR`/`ADMIN`.
- **Content-Type**: `application/json` or `multipart/form-data` (required for file uploads).

#### Create Material Body (Typed)
| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `string` | Yes | `video`, `pdf`, `text`. |
| `title` | `string` | Yes | Material title. |
| `order` | `int` | No | Display order. |
| `url` | `string` | No* | URL to the resource. *Not required if `file` is provided. |
| `file` | `file` | No | Optional file upload (e.g., PDF). If provided, it is uploaded to Cloudinary and the `url` field is automatically populated. |
| `duration` | `int` | If video | Duration in seconds. |
| `pages` | `int` | If pdf | Number of pages. |
| `content` | `string` | If text | Text content. |

#### Example Request (Video via URL)
```json
{
    "type": "video",
    "title": "Module 1: What is Blockchain?",
    "order": 1,
    "url": "https://example.com/video1.mp4",
    "duration": 600
}
```

#### Example Request (PDF via File Upload)
**Content-Type**: `multipart/form-data`
- `type`: `pdf`
- `title`: `Introduction to Blockchain Guide`
- `file`: `[binary_file_data]`

#### Error Responses
- `400 Bad Request`: If required fields are missing or invalid data is provided.
  ```json
  {
      "type": ["This field is required."]
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not a `TUTOR` or `ADMIN`, or the tutor doesn't own the course.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
- `404 Not Found`: If the specified course ID does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 2. Manage Material
- **URL**: `GET/PUT/PATCH/DELETE /api/materials/{id}/`
- **Method**: `GET`, `PUT`, `PATCH`, `DELETE`
- **Authentication**: Modification requires `TUTOR`/`ADMIN`.

#### Example Request (PATCH)
```json
{
    "title": "Module 1: What is Blockchain (Updated)",
    "order": 2
}
```

#### Error Responses
- `400 Bad Request`: If invalid data is provided.
  ```json
  {
      "duration": ["A valid integer is required."]
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not a `TUTOR` or `ADMIN`.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
- `404 Not Found`: If the material ID does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

---

## Enrollment Endpoints

### 1. Enroll in a Course
- **URL**: `POST /api/enroll/`
- **Method**: `POST`
- **Authentication**: Required (`Bearer`)
- **Description**: Enrolls the authenticated user into the specified course. 
    - **For Free Courses (price = 0)**: Instantly enrolls the user and returns a `201 Created` status with the enrollment data.
    - **For Paid Courses (price > 0)**: Generates a Paystack checkout session and returns a `200 OK` status. The user must complete the payment on Paystack, and then the transaction must be verified.

#### Example Request
```json
{
    "course": 14,
    "installment_plan": "40",
    "callback_url": "https://your-frontend.com/payment-verify"
}
```
> **Plan Options**: `FULL` (Default), `20` (NYSC only), `40`, `60`.

#### Example Response (Paid Course)
```json
{
    "message": "Payment required",
    "authorization_url": "https://checkout.paystack.com/xxxxxxxxx",
    "reference": "ENROLL_1_5_abcdefghij",
    "amount": 4000.0
}
```

#### Error Responses
- `400 Bad Request`: Validation error, or if the user is already enrolled.
  ```json
  {
      "detail": "Already enrolled"
  }
  ```
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `404 Not Found`: If the course does not exist.
  ```json
  {
      "detail": "Course not found"
  }
  ```
- `500 Internal Server Error`: If Paystack payment setup fails.
  ```json
  {
      "detail": "Payment initialization failed"
  }
  ```

### 2. My Enrollments
- **URL**: `GET /api/enrollments/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Returns a list of all courses the authenticated user is enrolled in.

#### Query Parameters
| Parameter | Type | Description |
|---|---|---|
| `page` | `int` | Page number (default: 1). |
| `page_size` | `int` | Items per page (default: 10, max: 50). |
| `is_completed` | `boolean` | Filter by completion status (`true`/`false`). |
| `course__category` | `string` | Filter by course category. |
| `course__level` | `string` | Filter by course level. |
| `search` | `string` | Search in course `title` and `description`. |
| `ordering` | `string` | Order by `enrolled_at`, `progress`, `course__price`, or `course__title`. Use `-` for descending (e.g., `-enrolled_at`). |


#### Example Success Response
**Code**: `200 OK` (Paginated)
```json
{
    "count": 1,
    "next": null,
    "previous": null,
    "items": [
        {
            "id": 13,
            "user": 1,
            "tutor": {
                "id": 61,
                "name": "Tutor One",
                "email": "tutorone@example.com",
                "profile_picture": null
            },
            "course": 31,
            "course_title": "Test",
            "course_price": 1000.0,
            "course_thumbnail": "https://example.com/thumbnail.jpg",
            "installment_plan": "FULL",
            "amount_paid": "0.00",
            "is_completed": false,
            "enrolled_at": "2026-04-12T14:10:36.694455Z"
        }
    ]
}
```

### 3. Retrieve Enrollment Details
- **URL**: `GET /api/enrollments/{id}/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Retrieves details for a specific enrollment, including nested representations of the enrolled user and the fully detailed course object.

#### Example Success Response
**Code**: `200 OK`
```json
{
    "id": 13,
    "user": 1,
    "course": {
        "id": 31,
        "title": "Test",
        "description": "This is a test request",
        "thumbnail_url": "https://example.com/thumbnail.jpg",
        "registration_fee": "0.00",
        "tuition_fee": "0.00",
        "certificate_fee": "0.00",
        "total_amount": 0.0,
        "allow_installments": false,
        "category": "Technology",
        "level": "Beginner",
        "is_published": true,
        "tutor": {
            "id": 61,
            "username": "tutoronetutor7420",
            "email": "tutorone@example.com",
            "full_name": "Tutor One",
            "phone_number": "",
            "address": "",
            "lga": "",
            "state": "",
            "country": "Nigeria",
            "role": "TUTOR",
            "user_category": "user",
            "onboarding_fee": false,
            "bio": null,
            "profile_picture": null,
            "active_referral_code": null,
            "referred_by": null
        },
        "modules": [],
        "created_at": "2026-04-12T13:58:19.876485Z",
        "updated_at": "2026-04-12T13:58:19.876497Z"
    },
    "enrolled_at": "2026-04-12T14:10:36.694455Z"
}
```

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `404 Not Found`: If the enrollment ID does not exist.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 4. List Course Enrollments (Students Management)
- **URL**: `GET /api/courses/{course_id}/enrollments/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Lists all students enrolled in a specific course. Access is role-based:
    - **TUTOR**: Can only view enrollments for their own courses.
    - **ADMIN** and **SUPER_ADMIN**: Can view enrollments for any course.

#### Query Parameters
| Parameter | Type | Description |
|---|---|---|
| `page` | `int` | Page number for pagination (default: 1). |
| `page_size` | `int` | Number of items per page (default: 10, max: 50). |

#### Example Request
```
GET /api/courses/14/enrollments/?page=1&page_size=20
```

#### Example Success Response
**Code**: `200 OK` (Paginated)
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "items": [
        {
            "id": 1,
            "user": {
                "id": 10,
                "username": "student_01",
                "email": "student01@example.com",
                "full_name": "John Doe",
                "phone_number": "+234812345678",
                "address": "123 Main St",
                "lga": "Ikoyi",
                "state": "Lagos",
                "country": "Nigeria",
                "role": "USER",
                "bio": "A passionate learner",
                "profile_picture": "https://example.com/profile1.jpg"
            },
            "enrolled_at": "2026-04-05T10:00:00Z"
        },
        {
            "id": 2,
            "user": {
                "id": 11,
                "username": "student_02",
                "email": "student02@example.com",
                "full_name": "Jane Smith",
                "phone_number": "+234812345679",
                "address": "456 Oak Ave",
                "lga": "Victoria Island",
                "state": "Lagos",
                "country": "Nigeria",
                "role": "USER",
                "bio": null,
                "profile_picture": null
            },
            "enrolled_at": "2026-04-06T15:30:00Z"
        }
    ]
}
```

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or is invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: User is authenticated but does not have permission (e.g., TUTOR trying to view another tutor's course).
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```
- `404 Not Found`: If the course ID does not exist.
  ```json
  {
      "detail": "Course not found"
  }
  ```

---

## Balance Payment Endpoint

### 1. Pay Installment Balance
- **URL**: `POST /api/enrollments/{enrollment_id}/pay-balance/`
- **Method**: `POST`
- **Authentication**: Required (`Bearer`)
- **Description**: Initiates a payment for the remaining balance of a course enrollment.
- **Note**: The amount calculated is `total_amount - amount_paid`. Once successful, the enrollment is marked as `is_completed=True` and all modules are released.

#### Example Request
```json
{
    "callback_url": "https://your-frontend.com/payment-verify"
}
```


#### Example Response
```json
{
    "message": "Balance payment required",
    "authorization_url": "https://checkout.paystack.com/xxxxxxxxx",
    "reference": "BAL_1_5_abcdefghij",
    "balance": 6000.0
}
```

---

## Certificate Endpoints

### 1. Generate Course Certificate
- **URL**: `GET /api/enrollments/{enrollment_id}/certificate/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Generates and returns a personalized PDF certificate for the authenticated user if they have completed the course (both academically and fully paid).
- **Query Parameters**:
  - `send_email` (`boolean`): If set to `true` or `1`, the generated certificate will also be emailed to the authenticated user's registered email address as a PDF attachment.

#### Success Response
**Code**: `200 OK`
**Content-Type**: `application/pdf`
**Body**: The PDF file stream downloaded as an attachment (e.g., `Course_Title_Certificate.pdf`).

#### Error Responses
- `400 Bad Request`: If the user has not completed the course or hasn't paid in full.
  ```json
  {
      "detail": "Course is not yet completed."
  }
  ```

### 2. List Earned Certificates
- **URL**: `GET /api/certificates/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Returns a paginated list of all course enrollments where the authenticated user has earned a certificate (i.e., `is_completed=True` and `is_course_completed=True`).

#### Example Success Response
**Code**: `200 OK` (Paginated)
```json
{
    "count": 1,
    "next": null,
    "previous": null,
    "items": [
        {
            "id": 13,
            "course": 31,
            "course_title": "Test Course",
            "course_thumbnail": "https://example.com/thumbnail.jpg",
            "tutor_name": "Tutor One",
            "enrolled_at": "2026-04-12T14:10:36.694455Z",
            "is_course_completed": true
        }
    ]
}
```
