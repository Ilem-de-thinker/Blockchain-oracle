# Course Progress Tracking API

This document details the endpoints and logic for tracking user progress within courses, including material completion, module completion, and overall course completion.

## Completion Logic

The progress tracking follows a hierarchical cascading logic:
1. **Material Completion**: A user manually marks a material (Video, PDF, or Text) as complete.
2. **Module Completion**: When all materials within a module are marked as complete by a user, the module is automatically marked as complete for that user.
3. **Course Completion**: When all modules within a course are marked as complete by a user, the course is automatically marked as complete in the user's enrollment.

> [!NOTE]
> Course completion is tracked via the `is_course_completed` field in the `Enrollment` model, which is separate from the `is_completed` field used for payment status.

---

## Endpoints

### 1. Mark Material as Completed
Mark a specific material as finished for the authenticated user.

- **URL**: `/api/courses/materials/<int:material_id>/complete/`
- **Method**: `POST`
- **Auth Required**: Yes (Token)
- **Response**:
    - `200 OK`
    ```json
    {
        "detail": "Material marked as completed",
        "module_completed": true,
        "course_completed": false
    }
    ```

### 2. Get Course Progress
Retrieve a detailed summary of the user's progress in a specific course.

- **URL**: `/api/courses/<int:course_id>/progress/`
- **Method**: `GET`
- **Auth Required**: Yes (Token)
- **Response**:
    - `200 OK`
    ```json
    {
        "course_title": "Blockchain Fundamentals",
        "progress_percentage": 75.0,
        "is_course_completed": false,
        "total_materials": 12,
        "completed_materials": 9,
        "modules": [
            {
                "module_id": 1,
                "title": "Introduction",
                "total_materials": 3,
                "completed_materials": 3,
                "is_completed": true
            },
            {
                "module_id": 2,
                "title": "Smart Contracts",
                "total_materials": 9,
                "completed_materials": 6,
                "is_completed": false
            }
        ]
    }
    ```

---

## Model Fields Added

### Enrollment
- `is_course_completed` (Boolean): Tracks if the user has academically completed the course.

### MaterialCompletion
- `user` (ForeignKey): The user who completed the material.
- `material` (ForeignKey): The material that was completed.
- `completed_at` (DateTimeField): Timestamp of completion.

### ModuleCompletion
- `user` (ForeignKey): The user who completed the module.
- `module` (ForeignKey): The module that was completed.
- `completed_at` (DateTimeField): Timestamp of completion.

---

## Serializer Updates

### MaterialSerializer
- Added `is_completed` (Boolean): Indicates if the requesting user has completed this material.

### ModuleSerializer
- Added `is_completed` (Boolean): Indicates if the requesting user has completed this module.
- Added `completion_stats` (Object): `{ "total": int, "completed": int, "percentage": float }`.

### EnrollmentSerializer
- Added `progress_percentage` (Float): Overall progress in the course.
- Added `is_course_completed` (Boolean): Academic completion status.
