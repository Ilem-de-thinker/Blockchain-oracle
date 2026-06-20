# Cloudinary Multi-File Upload API

This utility API provides a way to upload multiple files to Cloudinary in parallel, returning their secure URLs.

## Endpoint Overview

- **URL**: `/api/core/upload/`
- **Method**: `POST`
- **Authentication**: Required (JWT Bearer Token)
- **Content-Type**: `multipart/form-data`

## Request

### Headers
| Header | Value |
| :--- | :--- |
| Authorization | Bearer `<your_access_token>` |

### Body (Form Data)
| Key | Type | Description |
| :--- | :--- | :--- |
| `files` | File (Multiple) | One or more files to upload. Use the same key for all files. |

## Response

### Success (201 Created)
Returns a collection of URLs for the successfully uploaded files.

```json
{
    "message": "Successfully uploaded 2 files",
    "urls": [
        "https://res.cloudinary.com/demo/image/upload/v12345/uploads/file1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v12345/uploads/file2.png"
    ]
}
```

### Error (400 Bad Request)
Returned if no files are provided in the request.

```json
{
    "error": "No files provided"
}
```

### Error (401 Unauthorized)
Returned if the request misses a valid JWT token.

```json
{
    "detail": "Authentication credentials were not provided."
}
```

### Error (500 Internal Server Error)
Returned if an unexpected error occurs during the upload process.

```json
{
    "error": "Upload failed: <error_message>"
}
```

## Performance Note
This endpoint uses `asyncio` to perform parallel uploads. This means the total processing time is roughly equal to the time taken for the largest single file, rather than the sum of all files.
