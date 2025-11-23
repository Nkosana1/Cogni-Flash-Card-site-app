# NeuroFlash Database Models Documentation

## Overview

The NeuroFlash spaced repetition system uses comprehensive SQLAlchemy models with PostgreSQL-specific features including JSON fields, ENUM types, and optimized indexes.

## Models

### User

**Table**: `users`

**Fields**:
- `id` (Integer, Primary Key): Unique user identifier
- `email` (String(255), Unique, Indexed): User email address
- `username` (String(80), Unique, Indexed): Username
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
- `get_setting(key, default)`: Get setting from JSON
- `set_setting(key, value)`: Set setting in JSON
- `validate()`: Validate user data
- `to_dict(include_sensitive)`: Serialize to dictionary

### UserPreferences

**Table**: `user_preferences`

**Fields**:
- `id` (Integer, Primary Key): Unique identifier
- `user_id` (Integer, Foreign Key, Unique, Indexed): Reference to User
- `daily_review_limit` (Integer, Default: 50): Max cards to review per day
- `new_cards_per_day` (Integer, Default: 20): Max new cards per day
- `timezone` (String(50), Default: 'UTC'): User timezone
- `notification_settings` (JSON): Notification preferences
- `created_at` (DateTime): Creation timestamp
- `updated_at` (DateTime): Last update timestamp

**Relationships**:
- Many-to-one with `User` (one-to-one relationship)

**Methods**:
- `validate()`: Validate preferences
- `get_notification_setting(key, default)`: Get notification setting
- `set_notification_setting(key, value)`: Set notification setting
- `to_dict()`: Serialize to dictionary

### Deck

**Table**: `decks`

**Fields**:
- `id` (Integer, Primary Key): Unique identifier
- `user_id` (Integer, Foreign Key, Indexed): Reference to User
- `title` (String(200)): Deck title
- `description` (Text, Nullable): Deck description
- `is_public` (Boolean, Default: False, Indexed): Public visibility
- `created_at` (DateTime): Creation timestamp
- `tags` (JSON, Array): Tags for categorization

**Indexes**:
- `idx_deck_user_public`: Composite index on (user_id, is_public)

**Relationships**:
- Many-to-one with `User`
- One-to-many with `Card`
- One-to-many with `StudySession`

**Methods**:
- `validate()`: Validate deck data
- `add_tag(tag)`: Add a tag
- `remove_tag(tag)`: Remove a tag
- `has_tag(tag)`: Check if tag exists
- `get_card_count()`: Get number of cards
- `to_dict(include_cards)`: Serialize to dictionary

### Card

**Table**: `cards`

**Fields**:
- `id` (Integer, Primary Key): Unique identifier
- `deck_id` (Integer, Foreign Key, Indexed): Reference to Deck
- `front_content` (Text): Front side content
- `back_content` (Text): Back side content
- `card_type` (Enum): Type of card (basic, cloze, image_occlusion)
- `created_at` (DateTime): Creation timestamp
- `media_attachments` (JSON, Array): Media file references

**CardType Enum**:
- `BASIC`: Standard front/back card
- `CLOZE`: Cloze deletion card
- `IMAGE_OCCLUSION`: Image with occluded regions

**Indexes**:
- `idx_card_deck_type`: Composite index on (deck_id, card_type)

**Relationships**:
- Many-to-one with `Deck`
- One-to-many with `CardReview`

**Methods**:
- `validate()`: Validate card data
- `add_media(url, type)`: Add media attachment
- `remove_media(url)`: Remove media attachment
- `get_review_count()`: Get number of reviews
- `to_dict(include_reviews)`: Serialize to dictionary

### CardReview

**Table**: `card_reviews`

**Fields**:
- `id` (Integer, Primary Key): Unique identifier
- `card_id` (Integer, Foreign Key, Indexed): Reference to Card
- `user_id` (Integer, Foreign Key, Indexed): Reference to User
- `quality` (Integer, 0-5): Quality rating for SM-2
- `reviewed_at` (DateTime): Review timestamp
- `ease_factor` (Float, Default: 2.5): SM-2 ease factor
- `interval` (Integer, Default: 1): Days until next review
- `repetitions` (Integer, Default: 0): Successful review count
- `next_review` (DateTime, Indexed): Scheduled next review date

**Quality Ratings**:
- 0-1: Again (Hard to recall)
- 2-3: Hard (Recalled with difficulty)
- 4: Good (Recalled correctly)
- 5: Easy (Recalled easily)

**Indexes**:
- `idx_review_user_next`: Composite index on (user_id, next_review)
- `idx_review_card_user`: Composite index on (card_id, user_id)
- `idx_review_quality`: Index on quality

**Relationships**:
- Many-to-one with `Card`
- Many-to-one with `User`

**Methods**:
- `validate()`: Validate review data
- `is_due()`: Check if card is due for review
- `get_quality_label()`: Get human-readable quality label
- `to_dict()`: Serialize to dictionary

### StudySession

**Table**: `study_sessions`

**Fields**:
- `id` (Integer, Primary Key): Unique identifier
- `user_id` (Integer, Foreign Key, Indexed): Reference to User
- `deck_id` (Integer, Foreign Key, Nullable, Indexed): Reference to Deck
- `start_time` (DateTime): Session start timestamp
- `end_time` (DateTime, Nullable): Session end timestamp
- `cards_studied` (Integer, Default: 0): Number of cards reviewed
- `correct_count` (Integer, Default: 0): Number of correct answers

**Indexes**:
- `idx_session_user_start`: Composite index on (user_id, start_time)
- `idx_session_deck_start`: Composite index on (deck_id, start_time)

**Relationships**:
- Many-to-one with `User`
- Many-to-one with `Deck` (optional)

**Methods**:
- `validate()`: Validate session data
- `end_session()`: Mark session as ended
- `is_active()`: Check if session is active
- `get_duration_seconds()`: Get session duration
- `get_accuracy()`: Calculate accuracy percentage
- `increment_cards_studied(correct)`: Increment counters
- `to_dict()`: Serialize to dictionary

## Relationships Summary

```
User (1) ────< (M) Deck
User (1) ────< (M) CardReview
User (1) ────< (M) StudySession
User (1) ──── (1) UserPreferences

Deck (1) ────< (M) Card
Deck (1) ────< (M) StudySession

Card (1) ────< (M) CardReview
```

## Performance Optimizations

### Indexes

1. **User lookups**: `email`, `username` indexed
2. **Deck queries**: `user_id`, `is_public` indexed
3. **Card queries**: `deck_id`, `card_type` indexed
4. **Review queries**: `user_id`, `next_review`, `card_id` indexed
5. **Session queries**: `user_id`, `deck_id`, `start_time` indexed

### Query Optimization Tips

1. Use `lazy='dynamic'` for large relationships
2. Composite indexes for common query patterns
3. JSON fields for flexible data without joins
4. ENUM types for constrained string values

## Validation

All models include `validate()` methods that return `(is_valid, error_message)` tuples. Always validate before saving:

```python
is_valid, error = model.validate()
if not is_valid:
    raise ValueError(error)
```

## Serialization

All models include `to_dict()` methods for API responses. Use `include_*` parameters to control nested data:

```python
deck.to_dict(include_cards=True)
card.to_dict(include_reviews=True)
user.to_dict(include_sensitive=True)
```

## Migration Notes

When migrating from old models:
1. Review data needs `user_id` added
2. Spaced repetition fields move from Card to CardReview
3. UserPreferences must be created for existing users
4. Deck `name` field renamed to `title`
5. Card `front`/`back` renamed to `front_content`/`back_content`

See `migrations/MIGRATION_GUIDE.md` for detailed migration instructions.

