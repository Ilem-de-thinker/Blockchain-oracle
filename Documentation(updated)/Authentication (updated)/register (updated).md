# User Registration

Creates a new user account with specified roles and details.

**URL**: `/api/auth/register/`
**Method**: `POST`
**Authentication**: Not Required

## Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | Unique email address (Used for login). |
| `password` | `string` | Yes | Account password. |
| `first_name` | `string` | Yes | User's first name. |
| `last_name` | `string` | Yes | User's last name. |
| `phone_number`| `string` | No | Contact phone number. |
| `address` | `string` | No | Physical or mailing address. |
| `lga` | `string` | No | Local Government Area. |
| `state` | `string` | No | State of residence. |
| `country` | `string` | No | Country of residence (Defaults to "Nigeria"). |
| `role` | `string` | Yes | **Allowed for public registration:** `USER`, `TUTOR`. <br> (Privileged roles like `ADMIN`, `SUPER_ADMIN`, `INFLUENCER`, `CONTRIBUTOR` must be created by an existing Super Admin). |
| `referred_by` | `string` | No | Referral code of the user who referred this new user. |
| `user_category`| `string` | No | `nysc` or `user` (Default: `user`). Users in the `nysc` category may have specific fee requirements or payment plans available. |
| `onboarding_fee`| `decimal`| No | The amount paid for onboarding (if applicable). |

> [!IMPORTANT]
> Attempting to register with a privileged role will result in a `400 Bad Request`.
> **Username** is automatically generated based on the user's email prefix and a random 4-digit sequence.

### Example Request

```json
{
    "password": "strongPassword123!",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "address": "123 Oracle St, Web3 City",
    "lga": "Main LGA",
    "state": "Lagos",
    "role": "USER",
    "referred_by": "BLK-ORL-A12-8U2"
}
```

## Success Response

**Code**: `201 Created`

```json
{
    "username": "johnjohn1234",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "address": "123 Oracle St, Web3 City",
    "role": "USER"
}
```

## Error Responses

- `400 Bad Request`: If data is invalid (e.g., email already exists).
  ```json
  {
      "email": ["user with this email already exists."]
  }
  ```
