# AI Support Bot API Documentation

The AI Support Bot provides a Retrieval-Augmented Generation (RAG) system to answer user questions based on platform-specific knowledge. It uses **Groq (Llama 3.1 8B)** for generation and **Hugging Face Inference API** for semantic embeddings.

---

## 1. Chat Interface

### Public Chat
- **URL**: `/api/support/chat/`
- **Method**: `POST`
- **Authentication**: Not Required
- **Description**: Submit a message to get an AI-generated response grounded in the platform's context documents. If authenticated, you may provide a `history` of messages to maintain conversation memory. Anonymous users are limited to 50 characters per message, and any provided history is ignored.

**Request Body**:
```json
{
    "message": "How do I enroll in a course?",
    "history": [
        {
            "role": "user",
            "content": "Hi, I have a question about courses."
        },
        {
            "role": "assistant",
            "content": "Sure! What would you like to know?"
        }
    ]
}
```
*(Note: `history` is optional and only processed for logged-in users. The backend strictly limits history to the last 4 interactions to conserve token usage.)*

**Success Response (200 OK)**:
```json
{
    "response": "To enroll in a course, browse the catalog and select a course you like. For free courses, enrollment is instant. For paid courses, you will be redirected to Paystack for payment...",
    "sources": [
        "Courses And Learning",
        "Payments And Transactions"
    ]
}
```

---

## 2. Context Document Management (Admin Only)

These endpoints allow administrators to manage the knowledge base used by the AI bot.

### List Context Documents
- **URL**: `/api/support/context/`
- **Method**: `GET`
- **Authentication**: Required (Admin/Super Admin)

### Create Context Document
- **URL**: `/api/support/context/`
- **Method**: `POST`
- **Authentication**: Required (Admin/Super Admin)
- **Description**: Adds a new knowledge chunk. The embedding is automatically generated using the title and content.

**Request Body**:
```json
{
    "title": "New Policy",
    "content": "Detailed description of the new platform policy...",
    "source_file": "policy_v2.md"
}
```

### Update Context Document
- **URL**: `/api/support/context/{id}/`
- **Method**: `PATCH`
- **Authentication**: Required (Admin/Super Admin)
- **Description**: Updates an existing document. Re-generates the embedding if title or content is modified.

### Delete Context Document
- **URL**: `/api/support/context/{id}/`
- **Method**: `DELETE`
- **Authentication**: Required (Admin/Super Admin)

---

## 3. System Utilities (Super Admin Only)

### Seed Context from Files
- **URL**: `/api/support/context/seed/`
- **Method**: `POST`
- **Authentication**: Required (Super Admin)
- **Description**: Bulk-loads markdown files from `support/ai_context/` into the vector database.
- **Query Parameters**:
    - `force` (boolean): If `true`, updates existing documents with fresh embeddings. Default: `false`.

**Response**:
```json
{
    "created": 11,
    "updated": 0,
    "skipped": 1,
    "errors": []
}
```

---

## Implementation Details

- **Vector Database**: Powered by `pgvector` in Postgres.
- **Embeddings**: `BAAI/bge-small-en-v1.5` (384 dimensions) via Hugging Face Inference API.
- **LLM**: `Llama 3.1 8B Instant` via Groq.
- **Context Loading**: Files in `support/ai_context/` are used as the primary source of truth for the platform's knowledge base.
