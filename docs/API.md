# NeuroFlash API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "access_token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "access_token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Decks

#### Get All Decks
```http
GET /api/decks
Authorization: Bearer <token>
```

#### Create Deck
```http
POST /api/decks
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "description": "string (optional)",
  "color": "#3B82F6 (optional)"
}
```

#### Get Deck
```http
GET /api/decks/<id>
Authorization: Bearer <token>
```

#### Update Deck
```http
PUT /api/decks/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string (optional)",
  "description": "string (optional)",
  "color": "string (optional)"
}
```

#### Delete Deck
```http
DELETE /api/decks/<id>
Authorization: Bearer <token>
```

### Cards

#### Get Cards
```http
GET /api/cards?deck_id=<id> (optional)
Authorization: Bearer <token>
```

#### Create Card
```http
POST /api/cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "front": "string",
  "back": "string",
  "deck_id": 1
}
```

#### Get Due Cards
```http
GET /api/cards/due?deck_id=<id> (optional)&limit=<n> (optional)
Authorization: Bearer <token>
```

#### Update Card
```http
PUT /api/cards/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "front": "string (optional)",
  "back": "string (optional)",
  "deck_id": 1 (optional)
}
```

#### Delete Card
```http
DELETE /api/cards/<id>
Authorization: Bearer <token>
```

### Reviews

#### Submit Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_id": 1,
  "quality": 4  // 0-5 rating
}
```

**Quality Ratings:**
- 0-1: Again (Hard to recall)
- 2-3: Hard (Recalled with difficulty)
- 4: Good (Recalled correctly)
- 5: Easy (Recalled easily)

#### Get Review Statistics
```http
GET /api/reviews/stats?deck_id=<id> (optional)
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_cards": 100,
  "due_cards": 15,
  "reviewed_today": 25
}
```

#### Get Review History
```http
GET /api/reviews/history?card_id=<id> (optional)&deck_id=<id> (optional)&limit=<n> (optional)
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

