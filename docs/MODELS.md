# Database Models Documentation

## Overview

NeuroFlash uses SQLAlchemy ORM with PostgreSQL for data persistence. All models include comprehensive validation, serialization methods, and proper relationships with indexes for performance.

## Models

### User

**Table**: `users`

**Fields**:
- `id` (Integer, Primary Key): Unique user identifier
- `email` (String(255), Unique, Indexed): User email address
- `username` (String(80), Unique, Indexed): User username
- `password_hash` (String(255)): Bcrypt hashed password
- `created_at` (DateTime): Account creation timestamp
- `last_login` (DateTime, Nullable): Last login timestamp
- `settings_json` (JSON): Flexible user settings storage

**Relationships**:
- One-to-one with `UserPreferences`
- One-to-many with `Deck`
- One-to-many with `StudySession`
- One-to-many with `CardReview`

**Methods**:
- `set_password(password)`: Hash and set password
- `check_password(password)`: Verify password
- `update_last_login()`: Update last login timestamp
- `get_setting(key, default)`: Get setting from settings_json
- `set_setting(key, value)`: Set setting in settings_json
- `validate()`: Validate user data
- `to_dict(include_sensitive)`: Serialize to dictionary

---

### UserPreferences

**Table**: `user_preferences`

**Fields**:
- `id` (Integer, Primary Key): Unique preference identifier
- `user_id` (Integer, Foreign Key, Unique, Indexed): Reference to User
- `daily_review_limit` (Integer, Default: 100): Maximum reviews per day
- `new_cards_per_day` (Integer, Default: 20): Maximum new cards per day
- `timezone` (String(50), Default: 'UTC'): User timezone
- `notification_settings` (JSON): Notification preferences

**Relationships**:
- One-to-one with `User`

**Methods**:
- `get_notification_setting(key, default)`: Get notification setting
- `set_notification_setting(key, value)`: Set notification setting
- `update_daily_limits(review_limit, new_cards)`: Update daily limits
- `validate()`: Validate preferences data
- `to_dict()`: Serialize to dictionary
- `create_default(user_id)`: Class method to create default preferences

---

### Deck

**Table**: `decks`

**Fields**:
- `id` (Integer, Primary Key): Unique deck identifier
- `user_id` (Integer, Foreign Key, Indexed): Reference to User
- `title` (String(200)): Deck title/name
- `description` (Text, Nullable): Deck description
- `is_public` (Boolean, Default: False, Indexed): Public visibility flag
- `created_at` (DateTime): Creation timestamp
- `tags` (JSON, Default: []): Array of tags for categorization

**Relationships**:
- Many-to-one with `User`
- One-to-many with `Card`
- One-to-many with `StudySession`

**Indexes**:
- `idx_deck_user_public`: Composite index on (user_id, is_public)

**Methods**:
- `add_tag(tag)`: Add a tag to the deck
- `remove_tag(tag)`: Remove a tag from the deck
- `has_tag(tag)`: Check if deck has a specific tag
- `get_card_count()`: Get number of cards in deck
- `validate()`: Validate deck data
- `to_dict(include_cards)`: Serialize to dictionary

---

### Card

**Table**: `cards`

**Fields**:
- `id` (Integer, Primary Key): Unique card identifier
- `deck_id` (Integer, Foreign Key, Indexed): Reference to Deck
- `front_content` (Text): Front side content
- `back_content` (Text): Back side content
- `card_type` (Enum, Default: 'basic'): Card type (basic, cloze, image_occlusion)
- `created_at` (DateTime): Creation timestamp
- `media_attachments` (JSON, Default: []): Array of media file references

**Card Types** (Enum):
- `BASIC`: Standard front/back card
- `CLOZE`: Cloze deletion card
- `IMAGE_OCCLUSION`: Image with occluded regions

**Relationships**:
- Many-to-one with `Deck`
- One-to-many with `CardReview`

**Indexes**:
- `idx_card_deck_type`: Composite index on (deck_id, card_type)

**Methods**:
- `add_media(media_url, media_type)`: Add media attachment
- `remove_media(media_url)`: Remove media attachment
- `get_review_count()`: Get number of reviews
- `validate()`: Validate card data
- `to_dict(include_reviews)`: Serialize to dictionary

---

### CardReview

**Table**: `card_reviews`

**Fields**:
- `id` (Integer, Primary Key): Unique review identifier
- `card_id` (Integer, Foreign Key, Indexed): Reference to Card
- `user_id` (Integer, Foreign Key, Indexed): Reference to User
- `quality` (Integer): Quality rating (0-5)
- `reviewed_at` (DateTime, Indexed): Review timestamp
- `ease_factor` (Float, Default: 2.5): SM-2 ease factor
- `interval` (Integer, Default: 1): Days until next review
- `repetitions` (Integer, Default: 0): Number of successful reviews
- `next_review` (DateTime, Nullable, Indexed): Scheduled next review date

**Quality Ratings**:
- `0-1`: Again (Hard to recall)
- `2-3`: Hard (Recalled with difficulty)
- `4`: Good (Recalled correctly)
- `5`: Easy (Recalled easily)

**Relationships**:
- Many-to-one with `Card`
- Many-to-one with `User`

**Indexes**:
- `idx_review_user_card`: Composite index on (user_id, card_id)
- `idx_review_next_review`: Composite index on (user_id, next_review)
- `idx_review_deck_next`: Composite index on (card_id, next_review)

**Methods**:
- `get_quality_label()`: Get human-readable quality label
- `validate()`: Validate review data
- `to_dict()`: Serialize to dictionary

---

### StudySession

**Table**: `study_sessions`

**Fields**:
- `id` (Integer, Primary Key): Unique session identifier
- `user_id` (Integer, Foreign Key, Indexed): Reference to User
- `deck_id` (Integer, Foreign Key, Indexed): Reference to Deck
- `start_time` (DateTime, Indexed): Session start timestamp
- `end_time` (DateTime, Nullable): Session end timestamp
- `cards_studied` (Integer, Default: 0): Number of cards reviewed
- `correct_count` (Integer, Default: 0): Number of correct answers

**Relationships**:
- Many-to-one with `User`
- Many-to-one with `Deck`

**Indexes**:
- `idx_session_user_deck`: Composite index on (user_id, deck_id)
- `idx_session_user_start`: Composite index on (user_id, start_time)

**Methods**:
- `end_session()`: Mark session as ended
- `increment_cards_studied()`: Increment cards studied counter
- `increment_correct()`: Increment correct count
- `increment_incorrect()`: Increment cards studied (incorrect)
- `get_duration_seconds()`: Get session duration in seconds
- `get_accuracy()`: Calculate accuracy percentage
- `validate()`: Validate session data
- `to_dict()`: Serialize to dictionary

---

## Database Migrations

Migrations are managed using Flask-Migrate (Alembic). To create and apply migrations:

```bash
# Initialize migrations (first time only)
flask db init

# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback last migration
flask db downgrade
```

## Indexes for Performance

All models include strategic indexes for common query patterns:

1. **User lookups**: `email`, `username` (unique indexes)
2. **Deck queries**: `user_id`, `is_public` (composite index)
3. **Card queries**: `deck_id`, `card_type` (composite index)
4. **Review queries**: 
   - `user_id`, `card_id` (composite)
   - `user_id`, `next_review` (for due cards)
   - `card_id`, `next_review` (for deck-based queries)
5. **Session queries**: `user_id`, `deck_id`, `start_time` (composite indexes)

## Validation

All models include `validate()` methods that return `(is_valid: bool, error_message: str)` tuples. Use these before saving to ensure data integrity.

## Serialization

All models include `to_dict()` methods for API responses. Some models support optional parameters to include related data (e.g., `include_cards`, `include_reviews`).

## Relationships and Cascades

- **Cascade deletes**: When a User is deleted, all related Decks, StudySessions, CardReviews, and UserPreferences are automatically deleted
- **Cascade deletes**: When a Deck is deleted, all related Cards and StudySessions are deleted
- **Cascade deletes**: When a Card is deleted, all related CardReviews are deleted
- **One-to-one**: User ↔ UserPreferences (unique constraint on user_id)

