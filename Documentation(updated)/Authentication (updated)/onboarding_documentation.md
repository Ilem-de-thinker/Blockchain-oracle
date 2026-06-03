# Onboarding Fee API Documentation

This document describes the API endpoints for initiating and processing onboarding fee payments specifically for **NYSC users**.

## Overview
NYSC users are required to pay a one-time onboarding fee to access restricted platform features. Access is controlled via the `HasPaidOnboardingFee` permission, which allows access only to authentication and profile endpoints until the fee is confirmed.

---

## 1. Initiate Onboarding Payment
Allows an authenticated NYSC user to generate a Paystack payment link for their onboarding fee.

- **URL**: `/api/auth/onboarding/initiate-payment/`
- **Method**: `POST`
- **Authentication**: Required (`Bearer`)
- **Request Body**:
  ```json
  {
      "callback_url": "https://your-frontend-app.com/payment-callback"
  }
  ```

### Success Response
- **Code**: `200 OK`
- **Content**:
  ```json
  {
      "message": "Onboarding payment required",
      "authorization_url": "https://checkout.paystack.com/0000000000",
      "reference": "ONBOARD_1_abcdefghij",
      "amount": 2000.0
  }
  ```

### Error Responses
- **Code**: `400 Bad Request` (Not an NYSC user)
  ```json
  {
      "detail": "Onboarding fee only applicable for NYSC users"
  }
  ```
- **Code**: `400 Bad Request` (Already paid)
  ```json
  {
      "detail": "Onboarding fee already paid"
  }
  ```
- **Code**: `400 Bad Request` (Missing callback URL)
  ```json
  {
      "detail": "callback_url is required"
  }
  ```

---

## 2. Verification Workflow
The onboarding fee follows the standard platform payment verification flow:

1. **Initiate**: User calls the initiation endpoint and receives an `authorization_url`.
2. **Pay**: User completes payment on the Paystack checkout page.
3. **Verify**: The client application calls the verification endpoint:
    - **URL**: `GET /api/transactions/verify/<reference>/`
    - **Logic**: The system verifies the payment with Paystack. Upon success, the user's `onboarding_fee` status is set to `true`, and an automated confirmation email is sent.

---

## 3. Impact on Access
Once `onboarding_fee` is set to `true`:
- The user can access all restricted APIs (Courses, Events, Quizzes, etc.).
- The `onboarding_fee` field in the user profile will return `true`.
- The user will no longer be redirected to the payment initiation page by the frontend.
