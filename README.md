# NeuroFlash

A full-stack spaced repetition flashcard platform designed to help users learn and retain information efficiently using the scientifically-proven SM-2 algorithm.

## 🚀 Features

- **Spaced Repetition**: SM-2 algorithm for optimal learning intervals
- **Multi-Platform**: Web dashboard, mobile app, and API
- **User Management**: Secure authentication and user profiles
- **Deck Organization**: Organize flashcards into customizable decks
- **Review Tracking**: Track performance and review history
- **Offline Support**: Mobile app with offline sync capability

## 📁 Project Structure

```
neuroflash/
├── backend/          # Flask/Python API with PostgreSQL
├── frontend/         # React/TypeScript web dashboard
├── mobile/           # React Native mobile app
└── docs/             # Documentation
```

## 🛠 Tech Stack

- **Backend**: Flask/Python, PostgreSQL, SQLAlchemy
- **Frontend**: React, TypeScript, TailwindCSS
- **Mobile**: React Native, Expo
- **Deployment**: Docker, AWS/Vercel

## 🏗 Implementation Phases

### ✅ Phase 1: Backend API (Current)
- Flask backend with PostgreSQL
- User authentication (JWT)
- Deck and card management
- SM-2 spaced repetition algorithm
- Review tracking and statistics

### 🔄 Phase 2: React Web Dashboard (Next)
- User interface for managing decks and cards
- Review session interface
- Statistics and progress tracking
- Responsive design with TailwindCSS

### 📱 Phase 3: Mobile App
- React Native app with Expo
- Offline sync capability
- Native mobile experience

### 🌐 Phase 4: Landing Page
- Marketing site
- User onboarding
- Feature showcase

### ⚡ Phase 5: Advanced Features
- Analytics and insights
- Sharing and collaboration
- Advanced spaced repetition algorithms
- Scaling and optimization

## 🚀 Quick Start

### Backend Setup

See [backend/README.md](backend/README.md) for detailed setup instructions.

```bash
cd backend
pip install -r requirements.txt
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
python run.py
```

Or with Docker:

```bash
cd backend
docker-compose up
```

## 📚 API Documentation

The API is available at `http://localhost:5000/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Decks
- `GET /api/decks` - Get all decks
- `POST /api/decks` - Create deck
- `GET /api/decks/<id>` - Get deck with cards
- `PUT /api/decks/<id>` - Update deck
- `DELETE /api/decks/<id>` - Delete deck

### Cards
- `GET /api/cards` - Get cards
- `POST /api/cards` - Create card
- `GET /api/cards/due` - Get due cards for review
- `PUT /api/cards/<id>` - Update card
- `DELETE /api/cards/<id>` - Delete card

### Reviews
- `POST /api/reviews` - Submit card review
- `GET /api/reviews/stats` - Get review statistics
- `GET /api/reviews/history` - Get review history

## 🧪 Testing

```bash
cd backend
pytest
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

