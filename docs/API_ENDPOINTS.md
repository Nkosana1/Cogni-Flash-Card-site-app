# NeuroFlash RESTful API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Access tokens are obtained via `/api/auth/login` or `/api/auth/register`.

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string (3-80 chars)",
  "email": "valid email",
  "password": "string (min 6 chars)"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "created_at": "2024-01-01T00:00:00",
    "last_login": null,
    "settings": {}
  },
  "access_token": "jwt_token_here"
}
```

**Errors:**
- `400`: Validation error or user already exists
- `500`: Server error

---

### POST /api/auth/login
Login user and get access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "access_token": "jwt_token_here"
}
```

**Errors:**
- `400`: Validation error
- `401`: Invalid credentials

---

### POST /api/auth/logout
Logout user (revoke refresh token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### GET /api/auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "created_at": "2024-01-01T00:00:00",
  "last_login": "2024-01-01T00:00:00",
  "settings": {},
  "preferences": { ... }
}
```

---

## Deck Management

### GET /api/decks
List user's decks with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "title": "My Deck",
      "description": "Description",
      "is_public": false,
      "tags": ["tag1", "tag2"],
      "card_count": 10,
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "pages": 3,
    "has_next": true,
    "has_prev": false,
    "next_page": 2,
    "prev_page": null
  }
}
```

---

### POST /api/decks
Create a new deck.

**Request Body:**
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 1000 chars)",
  "is_public": false,
  "tags": ["tag1", "tag2"],
  "color": "#3B82F6"
}
```

**Response (201):** Deck object

---

### GET /api/decks/<id>
Get deck details with cards.

**Response (200):** Deck object with cards array

---

### PUT /api/decks/<id>
Update a deck.

**Request Body:** (all fields optional)
```json
{
  "title": "string",
  "description": "string",
  "is_public": true,
  "tags": ["tag1"],
  "color": "#FF0000"
}
```

**Response (200):** Updated deck object

---

### DELETE /api/decks/<id>
Delete a deck.

**Response (200):**
```json
{
  "message": "Deck deleted successfully"
}
```

---

### GET /api/decks/public
Browse public decks.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page
- `search`: Search term for title/description
- `tags`: Comma-separated tags to filter

**Response (200):** Paginated list of public decks

---

### POST /api/decks/<id>/clone
Clone a public deck to user's collection.

**Response (201):** Cloned deck with cards

---

## Card Operations

### GET /api/cards/decks/<deck_id>/cards
List cards in a deck with pagination.

**Query Parameters:**
- `page`: Page number
- `per_page`: Items per page

**Response (200):** Paginated list of cards

---

### POST /api/cards/decks/<deck_id>/cards
Create a new card in a deck.

**Request Body:**
```json
{
  "front_content": "string (required)",
  "back_content": "string (required)",
  "card_type": "basic|cloze|image_occlusion",
  "media_attachments": [
    {
      "url": "string",
      "type": "image|audio|video"
    }
  ]
}
```

**Response (201):** Card object

---

### GET /api/cards/<id>
Get card details.

**Response (200):** Card object

---

### PUT /api/cards/<id>
Update a card.

**Request Body:** (all fields optional)
```json
{
  "front_content": "string",
  "back_content": "string",
  "card_type": "basic",
  "media_attachments": []
}
```

**Response (200):** Updated card object

---

### DELETE /api/cards/<id>
Delete a card.

**Response (200):**
```json
{
  "message": "Card deleted successfully"
}
```

---

### POST /api/cards/batch
Bulk create cards (max 100 per request).

**Request Body:**
```json
{
  "deck_id": 1,
  "cards": [
    {
      "front_content": "Q1",
      "back_content": "A1",
      "card_type": "basic"
    },
    {
      "front_content": "Q2",
      "back_content": "A2"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "2 cards created successfully",
  "cards": [ ... ]
}
```

---

## Study Session

### GET /api/study/queue
Get due cards for study (optimized queue).

**Query Parameters:**
- `deck_id`: Optional deck filter

**Rate Limit:** 60 requests per minute per user

**Response (200):**
```json
{
  "due_cards": [ ... ],
  "new_cards": [ ... ],
  "total_cards": 50,
  "due_count": 30,
  "new_count": 20,
  "queue": [ ... ]
}
```

---

### POST /api/study/review
Submit a card review.

**Rate Limit:** 120 requests per minute per user

**Request Body:**
```json
{
  "card_id": 1,
  "quality": 4
}
```

**Quality Ratings:**
- `0`: Again (complete blackout)
- `1`: Hard
- `2`: Good
- `3`: Easy
- `4`: Very Easy
- `5`: Perfect

**Response (201):**
```json
{
  "message": "Review submitted successfully",
  "review": {
    "id": 1,
    "card_id": 1,
    "quality": 4,
    "ease_factor": 2.5,
    "interval": 6,
    "repetitions": 2,
    "next_review": "2024-01-07T00:00:00"
  },
  "previous_state": {
    "ease_factor": 2.5,
    "interval": 1,
    "repetitions": 1
  }
}
```

---

### GET /api/study/session/current
Get current active study session.

**Response (200):**
```json
{
  "session": {
    "id": 1,
    "user_id": 1,
    "deck_id": 1,
    "start_time": "2024-01-01T10:00:00",
    "end_time": null,
    "cards_studied": 10,
    "correct_count": 8,
    "accuracy": 80.0,
    "duration_seconds": null,
    "is_active": true
  }
}
```

---

### POST /api/study/session/start
Start a new study session.

**Rate Limit:** 10 requests per minute per user

**Request Body:**
```json
{
  "deck_id": 1
}
```

**Response (201):** Session object

**Errors:**
- `400`: Active session exists

---

### POST /api/study/session/end
End current study session.

**Rate Limit:** 10 requests per minute per user

**Response (200):** Ended session object

---

## Analytics

### GET /api/analytics/overview
Get study overview statistics.

**Response (200):**
```json
{
  "total_cards": 100,
  "due_cards": 15,
  "new_cards": 20,
  "reviewed_today": 25,
  "sessions_today": 3,
  "study_time_today_minutes": 45,
  "average_accuracy_today": 85.5,
  "streak_days": 7
}
```

---

### GET /api/analytics/deck/<id>
Get deck-specific statistics.

**Response (200):**
```json
{
  "deck_id": 1,
  "deck_title": "My Deck",
  "total_cards": 50,
  "due_cards": 10,
  "new_cards": 5,
  "reviewed_today": 15,
  "total_sessions": 20,
  "total_study_time_minutes": 120,
  "average_accuracy": 82.5,
  "mastery_levels": {
    "new": 5,
    "learning": 10,
    "reviewing": 15,
    "mastered": 20
  }
}
```

---

### GET /api/analytics/streak
Get user streak data.

**Response (200):**
```json
{
  "current_streak": 7,
  "streak_start_date": "2024-01-01",
  "longest_streak": 30
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "messages": { ... }  // For validation errors
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

### Rate Limiting

Some endpoints have rate limiting:
- Study queue: 60 requests/minute
- Submit review: 120 requests/minute
- Start/end session: 10 requests/minute

Rate limit exceeded responses include:
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum X requests per Y seconds"
}
```

---

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

Pagination metadata is included in responses:
```json
{
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false,
    "next_page": 2,
    "prev_page": null
  }
}
```

---

## Request Validation

All POST/PUT requests are validated using Marshmallow schemas. Invalid requests return:
```json
{
  "error": "Validation failed",
  "messages": {
    "field_name": ["Error message"]
  }
}
```

---

## Examples

### Complete Study Flow

1. **Start Session:**
```bash
POST /api/study/session/start
{
  "deck_id": 1
}
```

2. **Get Study Queue:**
```bash
GET /api/study/queue?deck_id=1
```

3. **Submit Reviews:**
```bash
POST /api/study/review
{
  "card_id": 1,
  "quality": 4
}
```

4. **End Session:**
```bash
POST /api/study/session/end
```

5. **View Analytics:**
```bash
GET /api/analytics/overview
```

