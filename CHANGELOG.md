# Changelog

All notable changes to this project will be documented in this file.

## [2026-06-20] - Event Types, DeepSeek Migration & Certificate ID

### Added
- **Event Types**: Added an `event_type` field to the `Event` model with multiple choices: `meetup`, `bootcamp`, `seminar`, `conference`, `workshop`, `hackathon`, `webinar`, `panel`, `networking`, and `other` (default).
    - Updated `EventSerializer` to expose `event_type` in API responses.
    - Updated event documentation with the new field and available options.

### Changed
- **AI Model Migration**: Replaced **Groq (Llama 3.1 8B)** with **DeepSeek Flash** (`deepseek-flash`) for the AI support bot chat completions.
    - Updated `support/services.py` to use the OpenAI-compatible DeepSeek API via the `openai` Python client.
    - Replaced `GROQ_API_KEY` env variable with `DEEPSEEK_API_KEY` in `settings.py`.
    - Renamed tool config from `GROQ_TOOLS_CONFIG` to `DEEPSEEK_TOOLS_CONFIG` in `support/tools.py`.
    - Replaced `groq` dependency with `openai` in `requirements.txt`.

### Added
- **Token Usage Tracking**: Introduced a `TokenUsage` model in `support/models.py` to track AI token consumption per request.
    - Records `user`, `model`, `prompt_tokens`, `completion_tokens`, and `total_tokens` for every DeepSeek API call (including tool-call rounds).
    - Enables cost monitoring and usage analytics via the `support_token_usage` database table.
- **Certificate ID on PDF**: The certificate ID (e.g., `CERT-XXXXXXXXX`) is now rendered on generated certificate PDFs below "issued by" in a clean Helvetica font.
    - Updated `generate_certificate_pdf()` in `courses/utils.py` to accept and display the certificate ID.
    - Updated `GenerateCertificateView` in `courses/views.py` to generate the ID before creating the PDF.

### Fixed
- **DeepSeek Model Name**: Corrected model from `deepseek-flash` (invalid) to `deepseek-chat` to resolve 400 Bad Request errors.
- **Tool Parameter Schema**: Added `"additionalProperties": False` to all tool definitions to meet DeepSeek API requirements. Fixed Python boolean casing (`false` → `False`).
- **Course List Filtering**: Authenticated users now see only published courses they haven't already enrolled in.

### Changed
- **Certificate List Endpoint**: `CertificateListView` now includes `enrollment_id` in the response for easier frontend navigation.
- **Events Documentation**: Added documentation for `GET /api/events/upcoming/` and `GET /api/events/past/` endpoints.
- **AI Context**: Updated `support/ai_context/events.md` with detailed descriptions of all 9 event types for the support bot.

## [2026-05-21] - NIN Verification Provider Migration

### Changed
- **Monnify KYC Integration**: Migrated NIN (National Identification Number) verification from 1App API to Monnify KYC API.
    - Updated `verify_nin()` function in `authentication/utils.py` to use Monnify endpoints and authentication.
    - Changed environment configuration from `ONEAPP_SECRET_KEY` to `MONNIFY_ACCOUNT_ID` and `MONNIFY_API_KEY`.
    - Updated response field mapping to match Monnify's response format.
- **Documentation**: Updated API documentation for the NIN Verification endpoint in `Documentation (updated)/Authentication (updated)/nin_kyc.md` with Monnify configuration details.

## [2026-05-18] - AI Support Bot Optimizations

### Changed
- **Token Usage Optimization**: Drastically reduced RAG context size and LLM output limits. Conversation memory (via frontend `history` passing) was added but is strictly truncated to the last 2 interactions to prevent prompt bloat and token limit errors.
- **Input Validation**: Added robust regex validation (`is_meaningful_query`) to immediately reject meaningless queries (e.g., purely symbols, repetitive characters, or inputs without at least a 3-letter word).
- **Fast Interceptors**: Expanded the `COMMON_GREETINGS` dictionary to instantly intercept and respond to conversational inputs ("wassup", "what do you do", "ok") without pinging the LLM or vector database.
- **RAG Semantic Filtering**: Implemented a cosine distance threshold (`0.6`) on the vector search so conversational questions do not blindly fetch irrelevant platform documentation.

## [2026-05-18] - Support Ticketing System

### Added
- **Support Ticketing System**: Introduced a full ticketing workflow allowing users to raise issues and chat directly with administrators.
    - **Models**: Added `Ticket` and `ChatMessage` models to the `support` app.
    - **API Endpoints**:
        - `POST /api/v1/support/tickets/`: Submit a new ticket.
        - `GET /api/v1/support/tickets/admin/`: Admin endpoint to view and filter all tickets.
        - `PATCH /api/v1/support/tickets/{id}/`: Admin endpoint to accept (open) or close tickets.
        - `POST /api/v1/support/tickets/{id}/messages/`: Send messages within a ticket thread.
    - **Notifications**: Integrated intelligent notifications. Emails and in-app alerts are sent when a ticket is created, accepted, or closed. In-app alerts (without email spam) are sent for individual chat messages.
- **Documentation**: New API documentation for the ticketing system available in `Documentation (updated)/Support/ticketing_api.md`.

## [2026-05-18] - NIN KYC Verification

### Added
- **NIN KYC Integration**: Added an endpoint to verify Nigerian National Identification Numbers (NIN) using the 1App API.
    - `POST /api/v1/auth/nin-kyc/`: Validates the provided NIN and returns the associated identity data.
- **Documentation**: New API documentation for the NIN Verification endpoint in `Documentation (updated)/Authentication (updated)/nin_kyc.md`.

## [2026-05-16] - AI Support Bot Implementation (RAG)

### Added
- **AI Support App**: A new dedicated app for handling platform support queries using AI.
- **RAG Pipeline**: Implemented Retrieval-Augmented Generation using **Groq (Llama 3.1 8B)** and **Hugging Face Inference API** for embeddings.
- **Vector Storage**: Integrated `pgvector` with Django models to store and search semantic embeddings of platform documentation.
- **Knowledge Base**: Created a suite of conversational context files in `support/ai_context/` covering platform identity, courses, payments, events, and more.
- **API Endpoints**:
    - `POST /api/support/chat/`: Public AI chat endpoint.
    - `GET/POST/PATCH/DELETE /api/support/context/`: Admin endpoints for managing the vector knowledge base.
    - `POST /api/support/context/seed/`: Utility for Super Admins to bulk-load knowledge from markdown files.
- **Management Command**: Added `python manage.py seed_context` to facilitate initial database population.
- **Documentation**: New AI Support Bot API documentation in `Documentation (updated)/Support/support_api.md`.

### Added (Notifications)
- **Notify Tutor Endpoint**: Students can now send direct notifications to their course tutors. The system automatically prefixes titles with the Course ID for better context.
- **Notify Admin Endpoint**: Users can send notifications to all administrators, with optional Course ID prefixing.
- **In-App Documentation**: Updated `Documentation (updated)/Notifications (updated)/api_in_app.md` with the new user-to-tutor and user-to-admin endpoints.
 
## [2026-05-08] - Influencer Advanced Analytics and Visualization

### Added
- **Influencer Advanced Charts**: 5 new visualization endpoints for detailed performance tracking in the `visualization` app.
    - `GET /api/influencer/charts/earnings-trend/`: Monthly earnings, referees, and purchase trends.
    - `GET /api/influencer/charts/code-earnings/`: Comparative revenue analysis and conversion rates by referral code.
    - `GET /api/influencer/charts/campaign-comparison/`: Multi-metric campaign comparison with monthly breakdowns.
    - `GET /api/influencer/charts/dashboard-summary/`: Enhanced dashboard summary with retention and performance KPIs.
    - `GET /api/influencer/charts/performance-analytics/`: Combined analytics endpoint for funnel, activity, and trends.
- **Visualization Documentation**: Updated the visualization API documentation with the new influencer chart specifications.

### Changed
- **Route Namespace**: Implemented a `charts/` sub-path for influencer visualization endpoints in the `visualization` app to prevent conflicts with the core `influencer` app.
 
## [2026-05-07] - Visualization API and Analytics Dashboards

### Added
- **Visualization App**: A dedicated app for handling complex data aggregation and analytics for all user roles.
- **Student Analytics Endpoints**:
    - `GET /api/progress/`: Course progress leaderboard.
    - `GET /api/progress/activity/`: Weekly learning effort tracking.
    - `GET /api/quizzes/my-results/?aggregate=true`: Aggregated quiz performance stats.
    - `GET /api/progress/dashboard-summary/`: Overall student performance summary.
    - `GET /api/enrollments/summary/`: Course category distribution.
    - `GET /api/transactions/my-history/`: Spending history (supports `aggregate_by=month`).
    - `GET /api/event-applications/summary/`: Event participation stats.
    - `GET /api/enrollments/timeline/`: Enrollment trends over time.
- **Tutor Analytics Endpoints**:
    - `GET /api/tutor/dashboard/`: Aggregated course and enrollment stats.
    - `GET /api/tutor/quiz-stats/`: Student quiz performance across tutor's courses.
    - `GET /api/tutor/revenue/`: Revenue tracking per course and monthly trends.
    - `GET /api/tutor/dashboard-summary/`: High-level teaching performance overview.
    - `GET /api/tutor/enrollment-funnel/`: Student progression analysis.
    - `GET /api/tutor/ratings/`: Course rating breakdowns.
    - `GET /api/tutor/dropoff-analysis/`: Module-level completion and drop-off tracking.
    - `GET /api/tutor/event-stats/`: Application counts for tutor-organized events.
- **Influencer/Contributor Analytics**:
    - Conversion funnels, referee activity tracking, and referral code performance trends.
- **Admin/Super Admin Platform Analytics**:
    - Platform-wide dashboards for users, courses, and revenue.
    - Global quiz stats, completion trends, and geographic user distribution.
    - Course popularity vs. performance analysis and payment failure tracking.

## [2026-05-02] - Course Verification and Publish Control

### Added
- **Course Verification System**:
    - `PUT /api/courses/{course_id}/toggle-verification/`: Allows Admins/Super Admins with the `can_verify` privilege to verify or unverify a course.
    - `is_verified` and `verified_by` fields added to the `Course` model and serializer.
- **Publish Status Control**:
    - `PUT /api/courses/{course_id}/toggle-publish/`: Allows tutors to toggle the visibility of their verified courses.
    - Courses must be verified by an authorized admin before they can be published.
- **Admin Verification Privileges**:
    - `PUT /api/auth/admin/users/{user_id}/toggle-can-verify/`: Admin-only endpoint to grant or revoke course verification permissions for other users.
    - `can_verify` field added to the `User` model and serializer.

- **Event Registration System**:
    - `POST /api/events/{event_id}/applications/`: Allows users to register for events.
    - Added `registration_fee` and `event_fee` to `Event` model.
    - Automated payment handling for events: Paid events initiate a Paystack transaction, while free events register the user immediately.
    - `EventApplication` now links to a `Transaction` and includes fee details.
- **Enhanced Payment Integration**:
    - All payment-initiating endpoints (`enroll/`, `pay-balance/`, `applications/`) now support an optional `callback_url` parameter in the request body to customize the post-payment redirection.


### Changed
- **Course Visibility**:
    - `GET /api/courses/`: Now only returns courses where `is_published=True` for regular users. Tutors can still see their own unpublished courses.
- **Serializer Updates**:
    - `CourseSerializer` now includes `is_verified`, `is_published`, and `verified_by`. These fields are read-only for regular users and tutors.
    - `UserSerializer` now includes the `can_verify` flag.
    - `EventSerializer` and `EventApplicationSerializer` updated to include fee information.

### Fixed
- **Free Enrollment/Registration Logic**:
    - Fixed issues where enrolling in free courses or events would fail due to missing variables or transaction requirements.
    - Both now generate a successful `$0.00` transaction upon registration.



## [2026-05-01] - Certificate System

### Added
- **Certificate Generation API**: 
    - `GET /api/enrollments/{enrollment_id}/certificate/`: Generates a personalized PDF certificate for a user upon course completion and full payment.
    - Supports `?send_email=true` query parameter to securely email the PDF directly to the user's registered email via a background thread.
- **Certificate Listing API**:
    - `GET /api/certificates/`: Endpoint to retrieve all completed and paid course enrollments, functioning as a list of earned certificates.
- **Custom Certificate Templates**:
    - Tutors can now upload a custom PDF `certificate_template` when creating or updating a `Course`. Defaults to a standard `certificate.pdf` if omitted.
- **Email Notifications**:
    - Created `notifications/templates/notifications/certificate_email.html` and upgraded email utility methods (`_send_email_thread` and `send_styled_email`) to natively support file attachments.

## [2026-04-27] - API Optimizations and Course Security

### Added
- **Module Quizzes**: Added a lightweight `quizzes` array to the `Module` serialization, allowing quizzes to be returned and rendered directly within the module list endpoints.

### Changed
- **Course API Security**: The `/api/courses/` and `/api/courses/{id}/` endpoints now dynamically restrict module details based on user role. Regular and unauthenticated users only receive the module `id` and `title`, preventing unauthorized access to course materials from the public list. `ADMIN`, `SUPER_ADMIN`, and `TUTOR` roles continue to receive the full module payloads.
- **Query Optimization**: Resolved severe N+1 query performance bottlenecks in `CourseListCreateView`, `CourseDetailView`, and `ModuleListCreateView` by implementing `select_related` and `prefetch_related` for all nested fields.

### Fixed
- **Quiz Creation**: Resolved a `TypeError` encountered during quiz creation by explicitly managing nested `questions` data in the serializer.
- **Material Creation**: Fixed an issue where the `module` field incorrectly resolved to `null` during material creation by implementing `perform_create` in `MaterialListCreateView`.

## [2026-04-27] - Rating System

### Added
- **Course Review API**: Enrolled users can now rate and comment on courses.
    - `POST /api/courses/reviews/`: Submit a rating (1-5) and comment for a course. Enrollment is required.
    - `GET /api/courses/{course_id}/reviews/`: List all reviews for a specific course (public).
    - `GET /api/courses/admin/reviews/`: Admin-only view of all reviews with filters for `rating`, `course`, and `user`.
- **Course Rating**: `Course` model now exposes an `average_rating` property (average of all user reviews).
- **Tutor Rating**: `User` model now has a `tutor_rating` property — the average rating across all their courses' reviews.
- **Student Rating**: `User` model now has a `student_rating` property — the average score across all their quiz attempts.
- **User Rating Endpoints** (Authentication):
    - `GET /api/auth/users/{id}/rating/`: Get a specific user's ratings (tutor and student).
    - `GET /api/auth/admin/users/ratings/`: Admin-only list of all users with their ratings.
- **New Model**: `CourseReview` with `user`, `course`, `rating`, `comment`, and `created_at` fields. Unique per user/course pair.

### Changed
- **`CourseSerializer`**: Now includes `average_rating` and nested `reviews` list.
- **`UserSerializer`**: Now includes `tutor_rating` and `student_rating` fields.


## [2026-04-27] - Course Progress Tracking

### Added
- **Course Progress API**: Implemented a comprehensive tracking system for course, module, and material completion.
    - `POST /api/courses/materials/{material_id}/complete/`: Mark a material as completed.
    - `GET /api/courses/{course_id}/progress/`: Fetch detailed progress for a course enrollment.
- **Hierarchical Completion Logic**:
    - Modules are automatically marked as complete when all their materials are finished.
    - Courses are automatically marked as complete in the enrollment when all their modules are finished.
- **New Models**:
    - `MaterialCompletion`: Tracks individual user progress on course materials.
    - `ModuleCompletion`: Tracks module completion status for users.
- **Enhanced Serializers**:
    - Added `is_completed` flags and `completion_stats` to Material and Module serializers.
    - Added `progress_percentage` and `is_course_completed` to Enrollment serializers.

### Changed
- **Enrollment Model**: Added `is_course_completed` field to distinguish academic completion from payment status (`is_completed`).
- **Progress Visibility**: Updated course and module views to show completion status for the authenticated user.


## [2026-04-27] - Quiz-Module Integration and Progression Locking

### Added
- **Notification Settings API**: Users can now manage their notification preferences via `/api/notifications/settings/`.
    - Toggles for: Email, Course Updates, Event Reminders, Marketing Emails, and Push Notifications.
    - Automatic setting generation for new users via signals.
- **Dynamic Quiz Attempts**: Implemented a new quiz attempt system.

    - `POST /api/quizzes/{quiz_id}/start/`: Creates a unique attempt with 5 randomly selected questions from the pool.
    - `POST /api/quizzes/attempts/{attempt_id}/submit/`: Submits answers for a specific attempt.
- **Progression Locking**: Modules are now locked based on quiz performance.
    - Students must score at least 3 out of 5 (60%) on a module's quiz to unlock the subsequent module.
    - First modules are accessible by default.
    - Modules without quizzes do not block progression.
- **Enhanced Models**:
    - `QuizAttempt` tracks `selected_questions`, `correct_answers`, and `is_passed`.
    - `NotificationSetting` stores granular preferences for Email, Courses, Events, Marketing, and Push notifications.
- **API Improvements**:
    - `ModuleSerializer` now includes `quiz_id`.


### Changed
- **Quiz Connectivity**: Quizzes are now linked to **Modules** instead of Courses.
    - `Quiz.course` replaced by `Quiz.module`.
- **Submission Logic**: Scores are calculated against the specific set of questions served during the attempt, preventing cheating or stale question issues.
- **Module Visibility**: Updated `GET /api/courses/{id}/modules/` to automatically filter out locked modules based on the new progression rules.

### Fixed
- Fixed an issue where quiz results were stored globally per user/quiz instead of per unique attempt.
- Resolved redundancy in question fetching by serving a subset of questions per attempt.
