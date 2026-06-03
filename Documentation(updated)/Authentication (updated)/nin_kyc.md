# NIN KYC Verification

## Endpoint
`POST /api/v1/auth/nin-kyc/`

## Description
This endpoint is used to verify a user's Nigerian National Identification Number (NIN) using the 1App API.

## Permissions
- **IsAuthenticated**: Only logged-in users can verify their NIN.

## Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `nin` | string | Yes | The user's National Identification Number to verify. |

### Example Request
```json
{
    "nin": "12345678901"
}
```

## Responses

### 200 OK - Successful Verification
If the verification is successful, the user's profile is automatically updated with the full name (combined from first, middle, and last names), date of birth, and gender from the NIN details. The endpoint becomes inaccessible for this user once their `is_verified` status is set to `True`.

```json
{
    "message": "NIN verified and profile updated",
    "data": {
        "firstname": "John",
        "lastname": "Doe",
        "gender": "Male",
        "middlename": "Freeman",
        "phone_number": "09012345678",
        "dob": "04-07-1960",
        "photo": "base64 URL"
    }
}
```

### 400 Bad Request - Validation Error or Already Verified
If the NIN is missing, the external API returns an error, or the user is already verified.

```json
{
    "error": "User is already verified."
}
```
Or:
```json
{
    "error": "NIN is required."
}
```
Or:
```json
{
    "error": "NIN Verification failed: Invalid NIN"
}
```
