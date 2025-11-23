"""
SuperMemo-2 (SM-2) Spaced Repetition Algorithm Service

This service implements the SM-2 algorithm for optimal spaced repetition scheduling.
The algorithm adjusts review intervals based on user performance quality ratings.

Quality Mapping:
- 0: Again - complete blackout
- 1: Hard
- 2: Good
- 3: Easy
- 4: Very Easy
- 5: Perfect
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from app import db
from app.models.card import Card
from app.models.card_review import CardReview
from app.models.deck import Deck
from app.models.user_preferences import UserPreferences


def calculate_sm2(quality: int, ease_factor: float, interval: int, repetitions: int) -> Dict[str, Any]:
    """
    Calculate SM-2 algorithm parameters.
    
    Args:
        quality: Quality rating (0-5)
        ease_factor: Current ease factor
        interval: Current interval in days
        repetitions: Current repetition count
    
    Returns:
        Dictionary with updated ease_factor, interval, repetitions, and next_review date
    
    Raises:
        ValueError: If quality is not in range 0-5
    """
    if quality < 0 or quality > 5:
        raise ValueError("Quality must be between 0 and 5")
    
    # Make copies to avoid modifying input
    new_ease_factor = ease_factor
    new_interval = interval
    new_repetitions = repetitions
    
    if quality < 3:  # Failed recall
        new_repetitions = 0
        new_interval = 1
    else:  # Successful recall
        new_repetitions += 1
        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            new_interval = round(interval * ease_factor)
    
    # Update ease factor
    # Formula: EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor_delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    new_ease_factor = max(1.3, ease_factor + ease_factor_delta)
    
    # Calculate next review date
    next_review = datetime.utcnow() + timedelta(days=new_interval)
    
    return {
        'ease_factor': round(new_ease_factor, 2),
        'interval': new_interval,
        'repetitions': new_repetitions,
        'next_review': next_review
    }


class SpacedRepetitionService:
    """
    Service for managing spaced repetition using SM-2 algorithm.
    
    This service handles card reviews, due card queries, and study queue management.
    """
    
    def __init__(self, db_session=None):
        """
        Initialize the service with a database session.
        
        Args:
            db_session: SQLAlchemy database session (defaults to app.db.session)
        """
        self.db = db_session or db.session
    
    def process_review(self, card_id: int, user_id: int, quality: int) -> Dict[str, Any]:
        """
        Process a card review and update spaced repetition parameters.
        
        Args:
            card_id: ID of the card being reviewed
            user_id: ID of the user performing the review
            quality: Quality rating (0-5)
        
        Returns:
            Dictionary with updated card state and review information
        
        Raises:
            ValueError: If quality is invalid or card not found
        """
        if quality < 0 or quality > 5:
            raise ValueError("Quality must be between 0 and 5")
        
        # Get card and verify ownership
        card = Card.query.join(Deck).filter(
            Card.id == card_id,
            Deck.user_id == user_id
        ).first()
        
        if not card:
            raise ValueError(f"Card {card_id} not found or does not belong to user {user_id}")
        
        # Get latest review for current state
        latest_review = CardReview.query.filter(
            CardReview.card_id == card_id,
            CardReview.user_id == user_id
        ).order_by(CardReview.reviewed_at.desc()).first()
        
        # Get current state from latest review or use defaults
        if latest_review:
            current_ease = latest_review.ease_factor
            current_interval = latest_review.interval
            current_repetitions = latest_review.repetitions
        else:
            # First review - use defaults
            current_ease = 2.5
            current_interval = 1
            current_repetitions = 0
        
        # Apply SM-2 algorithm
        result = calculate_sm2(
            quality=quality,
            ease_factor=current_ease,
            interval=current_interval,
            repetitions=current_repetitions
        )
        
        # Create new CardReview record
        card_review = CardReview(
            card_id=card_id,
            user_id=user_id,
            quality=quality,
            reviewed_at=datetime.utcnow(),
            ease_factor=result['ease_factor'],
            interval=result['interval'],
            repetitions=result['repetitions'],
            next_review=result['next_review']
        )
        
        # Validate review
        is_valid, error_msg = card_review.validate()
        if not is_valid:
            raise ValueError(f"Invalid review data: {error_msg}")
        
        # Save to database
        self.db.add(card_review)
        self.db.commit()
        
        return {
            'card_id': card_id,
            'user_id': user_id,
            'quality': quality,
            'review_id': card_review.id,
            'ease_factor': result['ease_factor'],
            'interval': result['interval'],
            'repetitions': result['repetitions'],
            'next_review': result['next_review'].isoformat(),
            'previous_state': {
                'ease_factor': current_ease,
                'interval': current_interval,
                'repetitions': current_repetitions
            }
        }
    
    def get_due_cards(self, user_id: int, deck_id: Optional[int] = None, 
                      limit: Optional[int] = None) -> List[Card]:
        """
        Get cards that are due for review.
        
        Cards are due if:
        - They have no reviews yet (new cards), OR
        - Their next_review date is <= today
        
        Results are ordered by priority:
        1. Overdue cards (next_review < today) - most overdue first
        2. Due today (next_review == today)
        3. New cards (no reviews)
        
        Args:
            user_id: User ID to filter cards
            deck_id: Optional deck ID to filter by specific deck
            limit: Optional limit on number of cards (uses user's daily_review_limit if not specified)
        
        Returns:
            List of Card objects that are due for review
        """
        # Get user preferences for daily limit
        user_prefs = UserPreferences.query.filter_by(user_id=user_id).first()
        daily_limit = user_prefs.daily_review_limit if user_prefs else 100
        
        # Use provided limit or user's daily limit
        query_limit = limit if limit is not None else daily_limit
        
        # Get the most recent review for each card
        subquery = self.db.query(
            CardReview.card_id,
            db.func.max(CardReview.reviewed_at).label('latest_review'),
            db.func.max(CardReview.next_review).label('latest_next_review')
        ).filter(
            CardReview.user_id == user_id
        ).group_by(CardReview.card_id).subquery()
        
        # Query cards that are due
        query = Card.query.join(Deck).filter(Deck.user_id == user_id)
        
        # Join with subquery to check next_review
        query = query.outerjoin(
            subquery,
            Card.id == subquery.c.card_id
        )
        
        # Filter for due cards
        now = datetime.utcnow()
        query = query.filter(
            db.or_(
                subquery.c.latest_next_review <= now,  # Due or overdue
                subquery.c.latest_next_review.is_(None)  # New cards (no reviews)
            )
        )
        
        if deck_id:
            query = query.filter(Card.deck_id == deck_id)
        
        # Order by priority: overdue first, then due today, then new cards
        query = query.order_by(
            # Overdue cards first (negative days overdue)
            db.case(
                (
                    db.and_(
                        subquery.c.latest_next_review.isnot(None),
                        subquery.c.latest_next_review < now
                    ),
                    (now - subquery.c.latest_next_review).label('days_overdue')
                ),
                else_=timedelta(days=0)
            ).desc(),
            # Then by next_review date (ascending)
            subquery.c.latest_next_review.asc().nulls_last()
        )
        
        # Apply limit
        if query_limit:
            query = query.limit(query_limit)
        
        return query.all()
    
    def get_study_queue(self, user_id: int, deck_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get optimized study queue combining due reviews and new cards.
        
        The study queue is built according to user preferences:
        - Due cards (reviews)
        - New cards (up to new_cards_per_day limit)
        
        Args:
            user_id: User ID to get study queue for
            deck_id: Optional deck ID to filter by specific deck
        
        Returns:
            Dictionary with study queue and metadata:
            {
                'due_cards': List of due Card objects,
                'new_cards': List of new Card objects,
                'total_cards': Total cards in queue,
                'due_count': Number of due cards,
                'new_count': Number of new cards
            }
        """
        # Get user preferences
        user_prefs = UserPreferences.query.filter_by(user_id=user_id).first()
        daily_review_limit = user_prefs.daily_review_limit if user_prefs else 100
        new_cards_per_day = user_prefs.new_cards_per_day if user_prefs else 20
        
        # Get due cards (reviews)
        due_cards = self.get_due_cards(user_id, deck_id, limit=daily_review_limit)
        
        # Get cards already reviewed today (to avoid double-counting)
        today = datetime.utcnow().date()
        reviewed_today = self.db.query(CardReview.card_id).filter(
            CardReview.user_id == user_id,
            db.func.date(CardReview.reviewed_at) == today
        ).subquery()
        
        # Get new cards (cards with no reviews)
        new_cards_query = Card.query.join(Deck).filter(
            Deck.user_id == user_id
        ).outerjoin(
            CardReview,
            db.and_(
                Card.id == CardReview.card_id,
                CardReview.user_id == user_id
            )
        ).filter(
            CardReview.id.is_(None)  # No reviews exist
        )
        
        # Exclude cards reviewed today
        new_cards_query = new_cards_query.outerjoin(
            reviewed_today,
            Card.id == reviewed_today.c.card_id
        ).filter(
            reviewed_today.c.card_id.is_(None)
        )
        
        if deck_id:
            new_cards_query = new_cards_query.filter(Card.deck_id == deck_id)
        
        # Limit new cards by user preference
        new_cards = new_cards_query.limit(new_cards_per_day).all()
        
        # Combine and create optimized order
        # Priority: due cards first, then new cards
        study_queue = list(due_cards) + list(new_cards)
        
        return {
            'due_cards': [card.to_dict() for card in due_cards],
            'new_cards': [card.to_dict() for card in new_cards],
            'total_cards': len(study_queue),
            'due_count': len(due_cards),
            'new_count': len(new_cards),
            'queue': [card.to_dict() for card in study_queue]
        }
    
    def get_latest_review(self, card_id: int, user_id: int) -> Optional[CardReview]:
        """
        Get the latest review for a card by a user.
        
        Args:
            card_id: Card ID
            user_id: User ID
        
        Returns:
            Latest CardReview or None if no reviews exist
        """
        return CardReview.query.filter(
            CardReview.card_id == card_id,
            CardReview.user_id == user_id
        ).order_by(CardReview.reviewed_at.desc()).first()
    
    def get_review_stats(self, user_id: int, deck_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get statistics about reviews.
        
        Args:
            user_id: User ID to filter stats
            deck_id: Optional deck ID to filter by deck
        
        Returns:
            Dictionary with review statistics
        """
        # Get total cards
        cards_query = Card.query.join(Deck).filter(Deck.user_id == user_id)
        if deck_id:
            cards_query = cards_query.filter(Card.deck_id == deck_id)
        
        total_cards = cards_query.count()
        
        # Get due cards
        due_cards = self.get_due_cards(user_id, deck_id)
        due_count = len(due_cards)
        
        # Get cards reviewed today
        today = datetime.utcnow().date()
        today_reviews_query = CardReview.query.join(Card).join(Deck).filter(
            Deck.user_id == user_id,
            CardReview.user_id == user_id,
            db.func.date(CardReview.reviewed_at) == today
        )
        if deck_id:
            today_reviews_query = today_reviews_query.filter(Card.deck_id == deck_id)
        today_reviews_count = today_reviews_query.count()
        
        # Get cards with reviews
        cards_with_reviews_query = Card.query.join(Deck).join(
            CardReview, Card.id == CardReview.card_id
        ).filter(
            Deck.user_id == user_id,
            CardReview.user_id == user_id
        ).distinct()
        
        if deck_id:
            cards_with_reviews_query = cards_with_reviews_query.filter(Card.deck_id == deck_id)
        
        cards_with_reviews = cards_with_reviews_query.count()
        
        return {
            'total_cards': total_cards,
            'due_cards': due_count,
            'reviewed_today': today_reviews_count,
            'cards_with_reviews': cards_with_reviews,
            'new_cards': total_cards - cards_with_reviews
        }
