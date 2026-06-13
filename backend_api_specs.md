# Backend API Specifications

This document outlines the required backend API endpoints for the new frontend features.

---

## 1. Certificate Verification API

### Public Endpoint: Verify Certificate by ID

Allows public verification of a certificate without authentication.

**Endpoint:** `GET /api/certificates/verify/{certificate_id}/`

**Authentication:** None (Public)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `certificate_id` | string | The unique certificate identifier (e.g., `CERT-ABC123XYZ`) |

**Success Response (200):**
```json
{
  "id": 1,
  "certificate_id": "CERT-ABC123XYZ",
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john.doe@example.com"
  },
  "course": {
    "id": 456,
    "title": "Blockchain Foundations",
    "description": "Introduction to blockchain technology"
  },
  "certificate_url": "https://storage.example.com/certificates/cert-abc123.pdf",
  "issued_at": "2026-03-15T10:30:00Z",
  "grade": "A"
}
```

**Error Response (404):**
```json
{
  "detail": "Certificate not found"
}
```

**Implementation Notes:**
- The `certificate_id` field must be unique and indexed for fast lookups
- This endpoint should NOT require authentication
- Consider rate limiting to prevent abuse (e.g., 100 requests per minute per IP)
- The response should only include public-safe information (no sensitive user data)

---

## 2. Testimonials API

### Overview

Testimonials are submitted by logged-in users (learners, instructors, influencers) and can be made public. Only testimonials with `is_public=true` AND `status="approved"` appear on the public landing page. Admins review and approve/reject submissions.

**Allowed roles to submit:** `learner`, `instructor`, `influencer`, `contributor`

---

### 2.1 Submit Testimonial (Logged-in User)

**Endpoint:** `POST /api/testimonials/submit/`

**Authentication:** Required (Learner, Instructor, Influencer, Contributor)

**Request Body:**
```json
{
  "quote": "Blockchain Oracle transformed my learning experience. The AI-powered guidance helped me choose the perfect course path",
  "make_public": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `quote` | string | Yes | The testimonial text (50-500 characters) |
| `make_public` | bool | Yes | If `true`, testimonial is eligible to appear on landing page after admin approval |

**Success Response (201):**
```json
{
  "id": 11,
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "https://..."
  },
  "quote": "Blockchain Oracle transformed my learning experience...",
  "is_public": true,
  "status": "pending",
  "created_at": "2026-06-09T10:30:00Z"
}
```

**Error Response (400):**
```json
{
  "quote": ["Quote must be between 50 and 500 characters."]
}
```

**Notes:**
- `name` and `image` are auto-populated from the authenticated user's profile
- `role` is auto-populated from the user's account role
- `status` defaults to `"pending"` — requires admin approval before going public
- A user can only have one pending testimonial at a time

---

### 2.2 Get My Testimonials (Logged-in User)

**Endpoint:** `GET /api/testimonials/my/`

**Authentication:** Required

**Success Response (200):**
```json
{
  "count": 2,
  "results": [
    {
      "id": 11,
      "quote": "Blockchain Oracle transformed my learning experience...",
      "is_public": true,
      "status": "approved",
      "created_at": "2026-06-01T10:30:00Z"
    },
    {
      "id": 12,
      "quote": "Great platform for self-paced learning...",
      "is_public": false,
      "status": "pending",
      "created_at": "2026-06-09T10:30:00Z"
    }
  ]
}
```

---

### 2.3 Update My Testimonial (Owner Only)

**Endpoint:** `PATCH /api/testimonials/{id}/`

**Authentication:** Required (Owner of the testimonial)

**Request Body:**
```json
{
  "quote": "Updated testimonial text",
  "make_public": true
}
```

**Notes:**
- Only allowed if `status` is `"pending"` or `"rejected"`
- Once `status` is `"approved"`, the user cannot edit (must contact admin)

---

### 2.4 Delete My Testimonial (Owner Only)

**Endpoint:** `DELETE /api/testimonials/{id}/`

**Authentication:** Required (Owner of the testimonial)

**Success Response (204):** No content

---

### 2.5 Get Public Testimonials (Landing Page)

**Endpoint:** `GET /api/testimonials/public/`

**Authentication:** None (Public)

**Description:** Returns approved testimonials with `is_public=true` for display on the landing page.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 6 | Number of testimonials to return (max 50) |

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "Ita Otu",
    "role": "Blockchain Architect",
    "image": "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=2000",
    "quote": "The community features make learning social and engaging.",
    "order": 1
  },
  {
    "id": 2,
    "name": "Effiom Bassey",
    "role": "Blockchain Developer",
    "image": "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000",
    "quote": "AlphaKing Oracle transformed my learning experience.",
    "order": 2
  }
]
```

---

### 2.6 Admin: List All Testimonials

**Endpoint:** `GET /api/testimonials/admin/`

**Authentication:** Required (Admin/Super Admin)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page |
| `status` | string | all | Filter: `pending`, `approved`, `rejected` |
| `is_public` | bool | all | Filter by public status |

**Success Response (200):**
```json
{
  "count": 25,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 11,
      "user": {
        "id": 123,
        "full_name": "John Doe",
        "email": "john@example.com",
        "profile_picture": "https://...",
        "role": "learner"
      },
      "quote": "Blockchain Oracle transformed my learning experience...",
      "is_public": true,
      "status": "pending",
      "order": 0,
      "created_at": "2026-06-09T10:30:00Z",
      "updated_at": "2026-06-09T10:30:00Z"
    }
  ]
}
```

---

### 2.7 Admin: Approve/Reject Testimonial

**Endpoint:** `PATCH /api/testimonials/{id}/status/`

**Authentication:** Required (Admin/Super Admin)

**Request Body:**
```json
{
  "status": "approved"
}
```

| Status | Description |
|--------|-------------|
| `pending` | Awaiting admin review (default on submit) |
| `approved` | Visible on public landing page |
| `rejected` | Not visible on landing page |

**Success Response (200):**
```json
{
  "id": 11,
  "status": "approved",
  "message": "Testimonial approved successfully"
}
```

---

### 2.8 Admin: Update Testimonial

**Endpoint:** `PATCH /api/testimonials/{id}/`

**Authentication:** Required (Admin/Super Admin)

**Request Body:**
```json
{
  "quote": "Updated quote text",
  "is_public": true,
  "order": 1
}
```

---

### 2.9 Admin: Delete Testimonial

**Endpoint:** `DELETE /api/testimonials/{id}/`

**Authentication:** Required (Admin/Super Admin)

**Success Response (204):** No content

---

### 2.10 Admin: Reorder Testimonials

**Endpoint:** `POST /api/testimonials/reorder/`

**Authentication:** Required (Admin/Super Admin)

**Request Body:**
```json
{
  "order": [3, 1, 2, 5, 4]
}
```

**Success Response (200):**
```json
{
  "message": "Testimonials reordered successfully"
}
```

---

## Data Models

### Testimonial Model

```python
class Testimonial(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='testimonials')
    quote = models.TextField()
    is_public = models.BooleanField(default=False, help_text="User opted to make this public")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"Testimonial by {self.user.full_name} - {self.status}"

    @property
    def name(self):
        return self.user.full_name

    @property
    def role(self):
        return self.user.get_role_display()

    @property
    def image(self):
        return self.user.profile_picture or f"https://i.pravatar.cc/200?u={self.user.email}"
```

### Certificate Model (if not already exists)

```python
class Certificate(models.Model):
    id = models.AutoField(primary_key=True)
    certificate_id = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_url = models.URLField(max_length=500)
    issued_at = models.DateTimeField(auto_now_add=True)
    grade = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f"Certificate {self.certificate_id} - {self.user.full_name}"
```

---

## Frontend Integration Notes

### Certificate Verification Page
- Route: `/verify-certificate`
- The page calls `GET /api/certificates/verify/{certificate_id}/`
- No authentication required
- Display certificate details on success
- Show error message on 404

### Landing Page Testimonials
- Call `GET /api/testimonials/public/?limit=6` to fetch testimonials
- Replace hardcoded `testimonialsData` in `LandingPageV2.tsx` with API response
- Map response fields: `name`, `role`, `image`, `quote`

### Testimonial Submission (Dashboard)
- Logged-in users can submit via `POST /api/testimonials/submit/`
- Toggle `make_public` checkbox in the form
- Show status of existing testimonials via `GET /api/testimonials/my/`
- Allow edit/delete of pending/rejected testimonials

### Testimonial Management (Admin)
- Create admin page at `/admin/testimonials`
- Call `GET /api/testimonials/admin/` with status filter
- Approve/reject via `PATCH /api/testimonials/{id}/status/`
- Implement drag-and-drop reordering via `POST /api/testimonials/reorder/`
- Edit/delete any testimonial

---

## Security Considerations

1. **Rate Limiting:** Apply rate limiting to the public certificate verification endpoint
2. **Input Validation:** Validate certificate_id format on backend
3. **CORS:** Ensure the API allows requests from the frontend domain
4. **Data Privacy:** The certificate verification endpoint should only return non-sensitive user information
