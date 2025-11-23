# SuperMemo-2 (SM-2) Spaced Repetition Algorithm

## Overview

The SM-2 algorithm is a scientifically-proven spaced repetition algorithm that optimizes the timing of card reviews based on user performance. This implementation follows the exact SM-2 specification with quality ratings from 0-5.

## Quality Mapping

| Quality | Label | Description |
|---------|-------|-------------|
| 0 | Again | Complete blackout - couldn't recall at all |
| 1 | Hard | Recalled with significant difficulty |
| 2 | Good | Recalled correctly but with some effort |
| 3 | Easy | Recalled easily |
| 4 | Very Easy | Recalled very easily |
| 5 | Perfect | Perfect recall, no effort required |

## Algorithm Logic

### Input Parameters

- `quality`: Integer (0-5) - User's performance rating
- `ease_factor`: Float - Current ease factor (default: 2.5)
- `interval`: Integer - Current interval in days
- `repetitions`: Integer - Current repetition count

### Algorithm Steps

1. **Failed Recall (quality < 3)**:
   - Reset `repetitions` to 0
   - Set `interval` to 1 day
   - Decrease `ease_factor` (but keep minimum 1.3)

2. **Successful Recall (quality >= 3)**:
   - Increment `repetitions` by 1
   - Calculate new `interval`:
     - If `repetitions == 1`: `interval = 1` day
     - If `repetitions == 2`: `interval = 6` days
     - If `repetitions > 2`: `interval = round(interval * ease_factor)`
   - Update `ease_factor`:
     ```
     ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
     ```

3. **Calculate Next Review**:
   ```
   next_review = current_date + interval (days)
   ```

## Ease Factor Formula

The ease factor adjustment formula:

```
delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
new_ease_factor = max(1.3, current_ease_factor + delta)
```

### Ease Factor Changes by Quality

| Quality | Delta | Effect |
|---------|-------|--------|
| 0 | -0.8 | Large decrease |
| 1 | -0.54 | Moderate decrease |
| 2 | -0.32 | Small decrease |
| 3 | -0.14 | Small increase |
| 4 | 0.0 | No change |
| 5 | 0.1 | Small increase |

**Minimum Ease Factor**: 1.3 (never goes below this)

## Example Scenarios

### Scenario 1: First Review (Quality 4 - Good)

**Input**:
- quality: 4
- ease_factor: 2.5 (default)
- interval: 1
- repetitions: 0

**Output**:
- repetitions: 1
- interval: 1
- ease_factor: 2.5 (no change for quality 4)
- next_review: today + 1 day

### Scenario 2: Second Review (Quality 4 - Good)

**Input**:
- quality: 4
- ease_factor: 2.5
- interval: 1
- repetitions: 1

**Output**:
- repetitions: 2
- interval: 6
- ease_factor: 2.5
- next_review: today + 6 days

### Scenario 3: Third Review (Quality 5 - Perfect)

**Input**:
- quality: 5
- ease_factor: 2.5
- interval: 6
- repetitions: 2

**Output**:
- repetitions: 3
- interval: round(6 * 2.6) = 16
- ease_factor: 2.6 (increased by 0.1)
- next_review: today + 16 days

### Scenario 4: Failed Recall (Quality 0 - Again)

**Input**:
- quality: 0
- ease_factor: 2.5
- interval: 10
- repetitions: 5

**Output**:
- repetitions: 0 (reset)
- interval: 1 (reset)
- ease_factor: 1.7 (decreased by 0.8)
- next_review: today + 1 day

## Service Implementation

### SpacedRepetitionService

The service provides the following methods:

#### `process_review(card_id, user_id, quality)`

Processes a card review and updates spaced repetition parameters.

**Parameters**:
- `card_id`: ID of the card being reviewed
- `user_id`: ID of the user performing the review
- `quality`: Quality rating (0-5)

**Returns**:
```python
{
    'card_id': int,
    'user_id': int,
    'quality': int,
    'review_id': int,
    'ease_factor': float,
    'interval': int,
    'repetitions': int,
    'next_review': str,  # ISO format
    'previous_state': {
        'ease_factor': float,
        'interval': int,
        'repetitions': int
    }
}
```

#### `get_due_cards(user_id, deck_id=None, limit=None)`

Gets cards that are due for review.

**Parameters**:
- `user_id`: User ID
- `deck_id`: Optional deck ID filter
- `limit`: Optional limit (defaults to user's daily_review_limit)

**Returns**: List of Card objects ordered by priority:
1. Overdue cards (most overdue first)
2. Due today
3. New cards (no reviews)

#### `get_study_queue(user_id, deck_id=None)`

Gets optimized study queue combining due reviews and new cards.

**Returns**:
```python
{
    'due_cards': List[Card],
    'new_cards': List[Card],
    'total_cards': int,
    'due_count': int,
    'new_count': int,
    'queue': List[Card]  # Combined and ordered
}
```

## Usage Examples

### Processing a Review

```python
from app.services.spaced_repetition import SpacedRepetitionService
from app import db

service = SpacedRepetitionService(db.session)

# Process a review
result = service.process_review(
    card_id=123,
    user_id=456,
    quality=4  # Good
)

print(f"Next review in {result['interval']} days")
print(f"Ease factor: {result['ease_factor']}")
```

### Getting Due Cards

```python
# Get all due cards
due_cards = service.get_due_cards(user_id=456)

# Get due cards for specific deck
due_cards = service.get_due_cards(user_id=456, deck_id=789)

# Get limited number of due cards
due_cards = service.get_due_cards(user_id=456, limit=20)
```

### Getting Study Queue

```python
# Get optimized study queue
queue = service.get_study_queue(user_id=456)

print(f"Due cards: {queue['due_count']}")
print(f"New cards: {queue['new_count']}")
print(f"Total: {queue['total_cards']}")
```

## Testing

Comprehensive unit tests are available in `backend/tests/test_spaced_repetition_service.py` covering:

- Algorithm accuracy for all quality levels
- Edge cases and boundary conditions
- Service method functionality
- Database integration
- User preferences integration

Run tests with:
```bash
pytest backend/tests/test_spaced_repetition_service.py -v
```

## References

- SuperMemo 2 Algorithm: Original spaced repetition algorithm by Piotr Wozniak
- Algorithm maintains compatibility with Anki and other SM-2 implementations

