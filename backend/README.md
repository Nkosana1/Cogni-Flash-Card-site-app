# NeuroFlash Backend API

Backend API for NeuroFlash spaced repetition flashcard platform.

## Features

- User authentication with JWT
- Deck and card management
- SM-2 spaced repetition algorithm
- Review tracking and statistics
- PostgreSQL database with SQLAlchemy ORM

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

### Local Development

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize database:**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

5. **Run the application:**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:5000`

### Docker Setup

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

This will start both PostgreSQL and the Flask backend.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)

### Decks
- `GET /api/decks` - Get all decks
- `POST /api/decks` - Create deck
- `GET /api/decks/<id>` - Get deck with cards
- `PUT /api/decks/<id>` - Update deck
- `DELETE /api/decks/<id>` - Delete deck

### Cards
- `GET /api/cards` - Get cards (optional `?deck_id=<id>`)
- `POST /api/cards` - Create card
- `GET /api/cards/<id>` - Get card
- `PUT /api/cards/<id>` - Update card
- `DELETE /api/cards/<id>` - Delete card
- `GET /api/cards/due` - Get due cards for review

### Reviews
- `POST /api/reviews` - Submit card review
- `GET /api/reviews/stats` - Get review statistics
- `GET /api/reviews/history` - Get review history

### Health Check
- `GET /api/health` - Health check endpoint

## SM-2 Algorithm

The backend implements the SM-2 spaced repetition algorithm:

- **Quality ratings (0-5):**
  - 0-1: Again (Hard to recall)
  - 2-3: Hard (Recalled with difficulty)
  - 4: Good (Recalled correctly)
  - 5: Easy (Recalled easily)

- **Algorithm behavior:**
  - Quality < 3: Reset card (interval = 1 day, repetitions = 0)
  - Quality >= 3: Update ease factor and calculate next interval
  - Ease factor adjusts based on performance
  - Interval increases exponentially with successful reviews

## Database Models

- **User**: User accounts with authentication
- **Deck**: Collections of flashcards
- **Card**: Individual flashcards with SM-2 parameters
- **Review**: Review history and performance tracking

## Testing

```bash
# Run tests (when implemented)
pytest
```

## License

MIT

