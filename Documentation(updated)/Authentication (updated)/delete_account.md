# Change Password

Allows a user to delete their account

**URL**: `/api/auth/delete-account/`
**Method**: `DELETE`
**Authentication**: Required (`Bearer`)
**Body**: `None`

## Success Response

**Code**: `201 Created`

```json
{
    "message": "Account deleted successfully."
}
