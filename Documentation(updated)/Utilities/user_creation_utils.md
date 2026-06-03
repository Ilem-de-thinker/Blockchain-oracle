# User Creation Utilities

This document outlines the specialized utility functions available in `authentication/utils.py` for bulk and automated user creation.

## 1. Single User Creation (`create_platform_user`)

A robust helper for creating a single user with any role.

### Arguments
| Parameter | Type | Required | Description |
|---|---|---|---|
| `full_name` | `string` | Yes | User's full name. |
| `email` | `string` | Yes | Unique email address. |
| `role` | `string` | Yes | `USER`, `TUTOR`, `ADMIN`, `SUPER_ADMIN`, `INFLUENCER`, `CONTRIBUTOR`. |
| `lga` | `string` | Yes | Local Government Area. |
| `country` | `string` | Yes | Country of residence. |
| `phone_number`| `string` | No | Contact phone number. |
| `referred_by` | `string` | No | Referral code. |
| `state` | `string` | No | State of residence. |

---

## 2. Bulk User Creation (`create_multiple_platform_users`)

An **optimized** function for creating hundreds of users in a single operation using `bulk_create`.

### Features
- **Duplicate Prevention**: Automatically detects if an email is repeated within the same request batch.
- **Database Safeguards**: Checks against existing emails in the database in a single query.
- **High Performance**: Reuses hashed passwords and minimizes SQL round-trips.
- **Reporting**: Returns a detailed breakdown of which users were created and which were skipped.

---

## 3. Seed Users Command

A Django management command for initializing the database with test data.

**Command**:
```bash
python manage.py seed_users
```

**Actions**:
- Creates one example user for each primary role (Admin, Tutor, Influencer, Contributor, Student).
- Uses the `BlockChainOraclePassword` as the default password for all generated accounts.
