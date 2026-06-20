# Rating System API

This document covers the course review, tutor rating, and student rating systems.

---

## Overview

The rating system works on three levels:

| Entity  | Rating Source | Formula |
|---------|--------------|---------|
| **Course** | User reviews | Average of all `CourseReview.rating` for a course |
| **Tutor** | Course ratings | Average of all ratings across all courses they teach |
| **Student** | Quiz performance | Average `score` across all their `QuizAttempt` records |

> [!NOTE]
> Only users **enrolled** in a course can submit a review for it. Each user can only review a course once.

---

## Course Review Endpoints

### 1. Submit a Course Review
Post a rating and optional comment for a course.

- **URL**: `/api/courses/reviews/`
- **Method**: `POST`
- **Auth Required**: Yes (Token)
- **Request Body**:
    ```json
    {
        "course": 3,
        "rating": 4,
        "comment": "Great course content and well structured!"
    }
    ```
- **Response** (`201 Created`):
    ```json
    {
        "id": 1,
        "user": { ... },
        "course": 3,
        "rating": 4,
        "comment": "Great course content and well structured!",
        "created_at": "2026-04-27T12:00:00Z"
    }
    ```
- **Error** (`400 Bad Request` if already reviewed):
    ```json
    {
        "detail": "You have already reviewed this course."
    }
    ```
- **Error** (`400 Bad Request` if not enrolled):
    ```json
    {
        "detail": "You must be enrolled in this course to rate it."
    }
    ```

### 2. List Reviews for a Course
Public endpoint to see all reviews for a specific course.

- **URL**: `/api/courses/<int:course_id>/reviews/`
- **Method**: `GET`
- **Auth Required**: No
- **Response** (`200 OK`):
    ```json
    [
        {
            "id": 1,
            "user": { "username": "johndoe", ... },
            "course": 3,
            "rating": 4,
            "comment": "Great course!",
            "created_at": "2026-04-27T12:00:00Z"
        }
    ]
    ```

### 3. Admin - List All Reviews
Admin-only view of all reviews across the platform.

- **URL**: `/api/courses/admin/reviews/`
- **Method**: `GET`
- **Auth Required**: Yes (Admin Token)
- **Query Params**: `?rating=5`, `?course=3`, `?user=12`, `?ordering=created_at`

---

## User Rating Endpoints

### 4. Get a User's Ratings
Returns a user's profile including their `tutor_rating` and `student_rating`.

- **URL**: `/api/auth/users/<int:id>/rating/`
- **Method**: `GET`
- **Auth Required**: Yes (Token)
- **Response** (`200 OK`):
    ```json
    {
        "id": 5,
        "username": "johndoe",
        "email": "john@example.com",
        "role": "TUTOR",
        "tutor_rating": 4.5,
        "student_rating": 3.2
    }
    ```

### 5. Admin - List All User Ratings
Admin-only endpoint to browse all users and their ratings.

- **URL**: `/api/auth/admin/users/ratings/`
- **Method**: `GET`
- **Auth Required**: Yes (Admin/Super Admin Token)
- **Query Params**: `?search=email`, `?ordering=date_joined`

---

## Rating Fields Summary

### CourseReview Model
| Field | Type | Description |
|-------|------|-------------|
| `user` | FK → User | The reviewer |
| `course` | FK → Course | The reviewed course |
| `rating` | Integer (1-5) | Star rating |
| `comment` | Text | Optional written review |
| `created_at` | DateTime | When the review was submitted |

### Computed Properties on User
| Property | Returns | Description |
|----------|---------|-------------|
| `tutor_rating` | Float (0–5) | Average rating of all courses taught |
| `student_rating` | Float (0–100) | Average score across all quiz attempts |

### Computed Property on Course
| Property | Returns | Description |
|----------|---------|-------------|
| `average_rating` | Float (0–5) | Average of all user review ratings |
