# Google Sign-In Documentation

This document describes the implementation and usage of Google Sign-In in the Backend Blockchain Oracle system.

## Overview

Google Sign-In allows users to authenticate using their Google accounts. The backend verifies the Google `id_token` provided by the frontend and issues a standard JWT (Access & Refresh tokens) for use with other protected API endpoints.

## Endpoint

- **URL**: `/api/auth/google/`
- **Method**: `POST`
- **Authentication**: None (Public)

## Request Format

The request should be a JSON object containing the `id_token` obtained from the Google Sign-In flow on the frontend (e.g., via Google One Tap or the Google Identity Services library).

```json
{
  "id_token": "YOUR_GOOGLE_ID_TOKEN"
}
```

## Response Format

### Success (`200 OK`)

If the token is valid, the server returns the user's details and JWT tokens.

```json
{
  "refresh": "REFRESH_TOKEN",
  "access": "ACCESS_TOKEN",
  "user": {
    "id": 1,
    "username": "user.name",
    "email": "user.name@gmail.com",
    "full_name": "User Name",
    "profile_picture": "https://lh3.googleusercontent.com/...",
    "role": "USER",
    ...
  },
  "created": true
}
```

- `created`: A boolean indicating if a new user account was created (`true`) or if an existing user logged in (`false`).

### Error (`400 Bad Request`)

If the token is invalid or expired.

```json
{
  "error": "Invalid Google token"
}
```

If the `id_token` is missing from the request.

```json
{
  "id_token": [
    "This field is required."
  ]
}
```

## Configuration

The backend requires the `GOOGLE_CLIENT_ID` environment variable to be set to verify tokens.

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## User Creation Logic

When a user logs in via Google for the first time:
1. An account is created using their Google email.
2. The `username` is derived from the email prefix.
3. The `role` is set to `USER` by default.
4. `full_name` and `profile_picture` are populated from their Google profile.
