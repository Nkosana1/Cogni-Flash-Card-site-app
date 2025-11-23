# NeuroFlash Architecture

## System Overview

NeuroFlash is a full-stack spaced repetition flashcard platform built with a microservices-ready architecture.

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **Migrations**: Flask-Migrate

### Frontend (Planned)
- **Framework**: React
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Redux/Zustand (TBD)

### Mobile (Planned)
- **Framework**: React Native
- **Platform**: Expo
- **Offline Storage**: AsyncStorage/SQLite

## Database Schema

### Users
- Authentication and user management
- One-to-many relationship with Decks

### Decks
- Collections of flashcards
- Belongs to User
- One-to-many relationship with Cards

### Cards
- Individual flashcards
- Belongs to Deck
- Contains SM-2 algorithm parameters:
  - `ease_factor`: Difficulty multiplier
  - `interval`: Days until next review
  - `repetitions`: Number of successful reviews
  - `next_review`: Scheduled review date

### Reviews
- Review history and performance tracking
- Belongs to Card
- Stores quality rating and state changes

## SM-2 Algorithm

The SuperMemo 2 (SM-2) algorithm is implemented in `SpacedRepetitionService`:

1. **Quality < 3**: Reset card (interval = 1, repetitions = 0)
2. **Quality >= 3**: 
   - Update ease factor based on quality
   - Calculate new interval
   - Increment repetitions
   - Schedule next review

### Ease Factor Formula
```
EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
```

### Interval Calculation
- First review: 1 day
- Second review: 6 days
- Subsequent: `interval * ease_factor`

## API Architecture

### RESTful Design
- Resource-based URLs
- HTTP methods for actions
- JSON request/response format
- JWT for authentication

### Route Organization
- `/api/auth` - Authentication
- `/api/decks` - Deck management
- `/api/cards` - Card management
- `/api/reviews` - Review operations

## Security

- Password hashing with bcrypt
- JWT tokens for authentication
- CORS configuration
- SQL injection prevention via SQLAlchemy ORM

## Deployment

### Docker
- Multi-container setup with docker-compose
- PostgreSQL service
- Flask backend service
- Volume persistence for database

### Production Considerations
- Environment variable configuration
- Database connection pooling
- Rate limiting (to be implemented)
- HTTPS/SSL
- Database backups

## Future Enhancements

- Redis for caching
- WebSocket support for real-time updates
- Background job processing (Celery)
- Analytics and reporting
- Multi-language support
- Card sharing and collaboration

