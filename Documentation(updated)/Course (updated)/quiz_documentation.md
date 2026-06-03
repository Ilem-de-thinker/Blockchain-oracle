# Quiz System Documentation

The Backend Blockchain Oracle includes a dynamic quiz system for module assessments and course progression.

## Features
- **Module Integration**: Quizzes are now tied to individual modules.
- **Randomized Attempts**: Each attempt selects 5 random questions from the module's question pool.
- **Progression Lock**: Students must pass a module's quiz (score ≥ 60%, i.e., 3/5) to unlock the next module.
- **Multiple Attempts**: Students can re-attempt a quiz to improve their score and unlock content.
- **Automatic Scoring**: Results are calculated immediately upon submission.

---

## 1. Creating a Quiz
**URL**: `/api/quizzes/`  
**Method**: `POST`  
**Auth**: Tutor/Admin  

**Example Request:**
```json
{
    "module": 12,
    "title": "Introduction to Hashes",
    "description": "Test your knowledge of cryptographic hashes.",
    "questions": [
        {
            "text": "Which hash function is used by Bitcoin?",
            "order": 1,
            "options": [
                {"text": "SHA-256", "is_correct": true},
                {"text": "MD5", "is_correct": false}
            ]
        }
    ]
}
```

**Example Response (201 Created):**
```json
{
    "id": 5,
    "module": 12,
    "title": "Introduction to Hashes",
    "description": "Test your knowledge of cryptographic hashes.",
    "questions": [
        {
            "id": 45,
            "text": "Which hash function is used by Bitcoin?",
            "order": 1,
            "options": [
                {"id": 90, "text": "SHA-256", "is_correct": true},
                {"id": 91, "text": "MD5", "is_correct": false}
            ]
        }
    ]
}
```

---

## 2. Listing and Retrieving Quizzes

### List Quizzes
**URL**: `/api/quizzes/?module_id=12`  
**Method**: `GET`  
**Auth**: Any authenticated user.

**Example Response:**
```json
[
    {
        "id": 5,
        "module": 12,
        "title": "Introduction to Hashes",
        "description": "Test your knowledge of cryptographic hashes.",
        "created_at": "2026-04-27T10:00:00Z"
    }
]
```

### Retrieve Quiz Details
**URL**: `/api/quizzes/{id}/`  
**Method**: `GET`  
**Auth**: Any authenticated user.

> [!NOTE]
> Students cannot see `is_correct` in the options list when retrieving quiz details.

**Example Response (Student):**
```json
{
    "id": 5,
    "title": "Introduction to Hashes",
    "questions": [
        {
            "id": 45,
            "text": "Which hash function is used by Bitcoin?",
            "options": [
                {"id": 90, "text": "SHA-256"},
                {"id": 91, "text": "MD5"}
            ]
        }
    ]
}
```

---

## 3. Taking a Quiz (The Flow)

### Step 1: Start Attempt
**URL**: `/api/quizzes/{id}/start/`  
**Method**: `POST`  
**Auth**: User enrolled in the course.

This endpoint selects 5 random questions from the quiz pool and creates a unique attempt.

**Example Response (201 Created):**
```json
{
    "id": 105,
    "quiz_title": "Introduction to Hashes",
    "selected_questions": [
        {
            "id": 45,
            "text": "Which hash function is used by Bitcoin?",
            "options": [
                {"id": 90, "text": "SHA-256"},
                {"id": 91, "text": "MD5"}
            ]
        },
        "... (4 more random questions)"
    ],
    "created_at": "2026-04-27T10:05:00Z"
}
```

### Step 2: Submit Answers
**URL**: `/api/quizzes/attempts/{attempt_id}/submit/`  
**Method**: `POST`  
**Auth**: User who started the attempt.

**Example Request:**
```json
{
    "answers": [
        {"question_id": 45, "option_id": 90},
        {"question_id": 46, "option_id": 95}
    ]
}
```

**Example Response (200 OK - Passed):**
```json
{
    "id": 105,
    "user_username": "student_01",
    "quiz_title": "Introduction to Hashes",
    "correct_answers": 4,
    "total_questions": 5,
    "score": "80.00",
    "is_passed": true,
    "completed_at": "2026-04-27T10:10:00Z"
}
```

---

## 4. Viewing Results

### My Results (Student)
**URL**: `/api/quizzes/my-results/`  
**Method**: `GET`  

Returns all quiz attempts made by the authenticated user.

**Example Response:**
```json
[
    {
        "id": 105,
        "user": 12,
        "user_username": "student_01",
        "quiz": 5,
        "quiz_title": "Introduction to Hashes",
        "correct_answers": 4,
        "total_questions": 5,
        "score": "80.00",
        "is_passed": true,
        "completed_at": "2026-04-27T10:10:00Z",
        "created_at": "2026-04-27T10:05:00Z"
    },
    {
        "id": 102,
        "user": 12,
        "user_username": "student_01",
        "quiz": 5,
        "quiz_title": "Introduction to Hashes",
        "correct_answers": 2,
        "total_questions": 5,
        "score": "40.00",
        "is_passed": false,
        "completed_at": "2026-04-26T15:00:00Z",
        "created_at": "2026-04-26T14:55:00Z"
    }
]
```

### Quiz Results (Tutor)
**URL**: `/api/quizzes/{quiz_id}/results/`  
**Method**: `GET`  
**Auth**: Course Tutor or Admin.

Returns all student attempts for a specific quiz.

**Example Response:**
```json
[
    {
        "id": 105,
        "user": 12,
        "user_username": "student_01",
        "quiz": 5,
        "quiz_title": "Introduction to Hashes",
        "correct_answers": 4,
        "total_questions": 5,
        "score": "80.00",
        "is_passed": true,
        "completed_at": "2026-04-27T10:10:00Z"
    },
    {
        "id": 106,
        "user": 15,
        "user_username": "student_02",
        "quiz": 5,
        "quiz_title": "Introduction to Hashes",
        "correct_answers": 5,
        "total_questions": 5,
        "score": "100.00",
        "is_passed": true,
        "completed_at": "2026-04-27T11:30:00Z"
    }
]
```

---

## Summary of Logic
> [!IMPORTANT]
> - **Passing Grade**: You must answer at least **3 out of 5** questions correctly to pass and unlock the next module.
> - **Locking**: Subsequent modules in a course will remain hidden until the previous module's quiz is passed.
> - **Question Pool**: If a quiz has 10 questions, each attempt will randomly serve a unique set of 5.


