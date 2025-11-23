"""
SM-2 Spaced Repetition Algorithm Implementation

The SM-2 algorithm is used to calculate the optimal interval between card reviews
based on the user's performance (quality rating 0-5).

Quality ratings:
- 0-1: Again - Hard to recall
- 2-3: Hard - Recalled with difficulty
- 4: Good - Recalled correctly
- 5: Easy - Recalled easily
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app import db
from app.models.card import Card
from app.models.card_review import CardReview
from app.models.deck import Deck


class SpacedRepetitionService:
    """Service for managing spaced repetition using SM-2 algorithm"""
    
    @staticmethod
    def calculate_next_review(card: Card, user_id: int, quality: int, 
                              last_review: Optional[CardReview] = None) -> Dict[str, Any]:
        """
        Calculate next review parameters using SM-2 algorithm and create CardReview.
        
        Args:
            card: Card instance being reviewed
            user_id: User ID performing the review
            quality: Quality rating (0-5)
            last_review: Optional previous CardReview to get current state
        
        Returns:
            dict with updated review parameters and CardReview instance
        """
        # Get current state from last review or defaults
        if last_review:
            old_ease_factor = last_review.ease_factor
            old_interval = last_review.interval
            old_repetitions = last_review.repetitions
        else:
            # First review - use defaults
            old_ease_factor = 2.5
            old_interval = 1
            old_repetitions = 0
        
        # SM-2 Algorithm
        if quality < 3:
            # Quality < 3: Reset repetitions and interval
            new_repetitions = 0
            new_interval = 1
            new_ease_factor = old_ease_factor  # Keep ease factor
        else:
            # Quality >= 3: Update ease factor and calculate interval
            # Update ease factor
            new_ease_factor = old_ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            
            # Ensure ease factor doesn't go below 1.3
            if new_ease_factor < 1.3:
                new_ease_factor = 1.3
            
            # Calculate new interval
            if old_repetitions == 0:
                new_interval = 1
            elif old_repetitions == 1:
                new_interval = 6
            else:
                new_interval = int(old_interval * new_ease_factor)
            
            # Increment repetitions
            new_repetitions = old_repetitions + 1
        
        # Calculate next review date
        next_review_date = datetime.utcnow() + timedelta(days=new_interval)
        
        # Create new CardReview
        card_review = CardReview(
            card_id=card.id,
            user_id=user_id,
            quality=quality,
            reviewed_at=datetime.utcnow(),
            ease_factor=new_ease_factor,
            interval=new_interval,
            repetitions=new_repetitions,
            next_review=next_review_date
        )
        
        return {
            'card_review': card_review,
            'ease_factor': new_ease_factor,
            'interval': new_interval,
            'repetitions': new_repetitions,
            'next_review': next_review_date,
            'old_ease_factor': old_ease_factor,
            'old_interval': old_interval,
            'old_repetitions': old_repetitions
        }
    
    @staticmethod
    def get_due_cards(user_id: int, deck_id: Optional[int] = None, limit: Optional[int] = None):
        """
        Get cards that are due for review based on CardReview.next_review.
        
        Args:
            user_id: User ID to filter cards
            deck_id: Optional deck ID to filter by deck
            limit: Optional limit on number of cards to return
        
        Returns:
            Query object of due cards
        """
        # Get the most recent review for each card
        # Cards are due if:
        # 1. They have a review with next_review <= now, OR
        # 2. They have no reviews yet
        
        subquery = db.session.query(
            CardReview.card_id,
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
        ).filter(
            db.or_(
                subquery.c.latest_next_review <= datetime.utcnow(),
                subquery.c.latest_next_review.is_(None)  # No reviews yet
            )
        )
        
        if deck_id:
            query = query.filter(Card.deck_id == deck_id)
        
        query = query.order_by(
            db.case(
                (subquery.c.latest_next_review.is_(None), 0),
                else_=1
            ),
            subquery.c.latest_next_review.asc()
        )
        
        if limit:
            query = query.limit(limit)
        
        return query
    
    @staticmethod
    def get_review_stats(user_id: int, deck_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get statistics about reviews.
        
        Args:
            user_id: User ID to filter stats
            deck_id: Optional deck ID to filter by deck
        
        Returns:
            dict with review statistics
        """
        # Get total cards
        cards_query = Card.query.join(Deck).filter(Deck.user_id == user_id)
        if deck_id:
            cards_query = cards_query.filter(Card.deck_id == deck_id)
        
        total_cards = cards_query.count()
        
        # Get due cards
        due_cards = SpacedRepetitionService.get_due_cards(user_id, deck_id).count()
        
        # Get cards reviewed today
        today = datetime.utcnow().date()
        today_reviews_query = CardReview.query.join(Card).join(Deck).filter(
            Deck.user_id == user_id,
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
            'due_cards': due_cards,
            'reviewed_today': today_reviews_count,
            'cards_with_reviews': cards_with_reviews,
            'new_cards': total_cards - cards_with_reviews
        }
    
    @staticmethod
    def get_latest_review(card_id: int, user_id: int) -> Optional[CardReview]:
        """
        Get the latest review for a card by a user.
        
        Args:
            card_id: Card ID
            user_id: User ID
        
        Returns:
            Latest CardReview or None
        """
        return CardReview.query.filter(
            CardReview.card_id == card_id,
            CardReview.user_id == user_id
        ).order_by(CardReview.reviewed_at.desc()).first()
