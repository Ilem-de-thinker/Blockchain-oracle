# Payment & Transaction API Documentation

This document describes the API endpoints for verifying Paystack payments and managing transactions in the system.

## Authentication
Endpoints require authentication using a JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

---

## Transaction Endpoints

### 1. Verify Payment
- **URL**: `GET /api/transactions/verify/<reference>/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Verifies a Paystack payment using its unique transaction `<reference>`. If the payment was successful on Paystack's end, the system transaction status is updated to `SUCCESS`. Associated metadata (e.g., `course_id`, `payment_type`) is then processed:
    - **UPFRONT**: Enrolls the user in the course. If a partial installment plan was chosen (20%, 40%, 60%), content is released modularly.
    - **BALANCE**: Completes the payment for an existing enrollment and releases all remaining modules.
    - **ONBOARDING**: Confirms the onboarding fee payment for NYSC users and unlocks platform access. See [Onboarding Documentation](../Authentication%20(updated)/onboarding_documentation.md) for details.

#### Success Response
**Code**: `200 OK`
```json
{
    "message": "Payment verified and upfront processed"
}
```
OR
```json
{
    "message": "Payment verified and balance processed"
}
```

#### Error/Failure Responses
**Code**: `400 Bad Request`
```json
{
    "message": "Payment verification failed"
}
```

**Code**: `404 Not Found` (If the transaction reference is invalid or belongs to another user)
```json
{
    "detail": "Not found."
}
```
### 2. User Transaction History
- **URL**: `GET /api/transactions/my-transactions/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Returns a paginated list of all transactions belonging to the authenticated user. Default pagination is 10 items per page.

#### Example Success Response
**Code**: `200 OK` (Paginated)
```json
{
    "count": 7,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 7,
            "user": 1,
            "amount": 1000,
            "item_type": "course",
            "item_id": "10",
            "item_name": "Blockchain Advanced",
            "paystack_reference": "ENROLL_1_10_iu6btJF5Qa",
            "status": "SUCCESS",
            "created_at": "2026-03-20T20:08:48.130231Z",
            "updated_at": "2026-03-20T20:09:46.661050Z"
        },
        {
            "id": 6,
            "user": 1,
            "amount": 1000,
            "item_type": "course",
            "item_id": "9",
            "item_name": "Solidity Basics",
            "paystack_reference": "ENROLL_1_9_XLnL7hbNDZ",
            "status": "SUCCESS",
            "created_at": "2026-03-20T19:59:42.429600Z",
            "updated_at": "2026-03-20T20:00:25.235348Z"
        }
    ]
}
```

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```

### 3. All Transactions (Admin)
- **URL**: `GET /api/transactions/all/`
- **Method**: `GET`
- **Authentication**: Required (`ADMIN` or `SUPER_ADMIN`)
- **Description**: Returns a paginated list of all system transactions across the platform. Default pagination is 10 items per page.

#### Example Success Response
**Code**: `200 OK` (Paginated)
```json
{
    "count": 45,
    "next": "http://api.example.com/api/transactions/all/?page=2",
    "previous": null,
    "results": [
        {
            "id": 7,
            "user": 10,
            "amount": 5000,
            "item_type": "course",
            "item_id": "10",
            "item_name": "Blockchain Advanced",
            "paystack_reference": "ENROLL_1_10_abcdefghij",
            "status": "SUCCESS",
            "created_at": "2026-04-06T10:00:00.000000Z",
            "updated_at": "2026-04-06T10:05:00.000000Z"
        }
    ]
}
```

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not an `ADMIN` or `SUPER_ADMIN`.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```

## Enrollment Workflow Integration
1. A user attempts to enroll in a **paid course** via the Course APIs.
2. The Course API returns an `authorization_url` and a `reference`.
3. The client application re-directs the user to the `authorization_url` to securely complete the payment snippet via Paystack.
4. Upon successful payment return/callback, the client application queries `GET /api/transactions/verify/<reference>/` to securely finalize the system transaction and officially enroll the user in the course.


### 4. Transaction Detail
- **URL**: `GET /api/transactions/my-transactions/<paystack_reference>/`
- **Method**: `GET`
- **Authentication**: Required (`Bearer`)
- **Description**: Returns the details of a specific transaction belonging to the authenticated user, identified by its Paystack `<reference>`.

#### Example Success Response
**Code**: `200 OK`
```json
{
    "id": 6,
    "user": 1,
    "amount": 1000,
    "item_type": "course",
    "item_id": "9",
    "item_name": "Solidity Basics",
    "paystack_reference": "ENROLL_1_9_XLnL7hbNDZ",
    "status": "SUCCESS",
    "created_at": "2026-03-20T19:59:42.429600Z",
    "updated_at": "2026-03-20T20:00:25.235348Z"
}
```

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `404 Not Found`: No transaction with the given `<reference>` exists for the authenticated user.
  ```json
  {
      "detail": "Not found."
  }
  ```

### 5. Admin Transaction Detail
- **URL**: `GET /api/transactions/all/<paystack_reference>/`
- **Method**: `GET`
- **Authentication**: Required (`ADMIN` or `SUPER_ADMIN`)
- **Description**: Returns the details of a specific transaction identified by its Paystack `<reference>`.

#### Example Success Response
**Code**: `200 OK`
```json
{
    "id": 7,
    "user": 10,
    "amount": 5000,
    "item_type": "course",
    "item_id": "10",
    "item_name": "Blockchain Advanced",
    "paystack_reference": "ENROLL_1_10_abcdefghij",
    "status": "SUCCESS",
    "created_at": "2026-04-06T10:00:00.000000Z",
    "updated_at": "2026-04-06T10:05:00.000000Z"
}
```

#### Error Responses
- `401 Unauthorized`: Authentication credentials were not provided or are invalid.
  ```json
  {
      "detail": "Authentication credentials were not provided."
  }
  ```
- `403 Forbidden`: Authenticated user is not an `ADMIN` or `SUPER_ADMIN`.
  ```json
  {
      "detail": "You do not have permission to perform this action."
  }
  ```