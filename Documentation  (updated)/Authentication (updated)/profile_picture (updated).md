# Update Profile Picture

Updates the authenticated user's profile picture. This endpoint handles Cloudinary upload with custom naming and automatic cleanup of the previous image.

**URL**: `/api/auth/update-profile-picture/`
**Method**: `PUT`
**Authentication**: Required (`Bearer`)

## PUT Request

### Request Body (Multipart/form-data)

| Field | Type | Required | Description |
|---|---|---|---|
| `profile_picture` | `file` | Yes | The image file to upload. |

### Success Response

**Code**: `200 OK`

```json
{
    "message": "Profile picture updated successfully.",
    "profile_picture": "https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/profile_pictures/blk_orc_xyz_abc.jpg"
}
```

## Logic Highlights
- **Custom Naming**: Images are named using the format `blk_orc_{random_3_chars}_{random_3_chars}`.
- **Storage**: Images are stored in the `profile_pictures` folder on Cloudinary.
- **Automatic Cleanup**: If the user already has a profile picture, it is automatically deleted from Cloudinary before the new one is uploaded.

## Error Responses

- `400 Bad Request`: If `profile_picture` is missing.
  ```json
  {
      "error": "Profile picture is required."
  }
  ```
- `401 Unauthorized`: Authentication required.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `500 Internal Server Error`: If Cloudinary upload fails.
  ```json
  {
      "error": "Failed to upload profile picture"
  }
  ```
