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
from app import db
from app.models.card import Card


class SpacedRepetitionService:
    """Service for managing spaced repetition using SM-2 algorithm"""
    
    @staticmethod
    def calculate_next_review(card: Card, quality: int) -> dict:
        """
        Calculate next review parameters using SM-2 algorithm
        
        Args:
            card: Card instance to update
            quality: Quality rating (0-5)
        
        Returns:
            dict with updated card parameters
        """
        # Store current state
        old_ease_factor = card.ease_factor
        old_interval = card.interval
        old_repetitions = card.repetitions
        
        # SM-2 Algorithm
        if quality < 3:
            # Quality < 3: Reset repetitions and interval
            card.repetitions = 0
            card.interval = 1
        else:
            # Quality >= 3: Update ease factor and calculate interval
            # Update ease factor
            card.ease_factor = old_ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
            
            # Ensure ease factor doesn't go below 1.3
            if card.ease_factor < 1.3:
                card.ease_factor = 1.3
            
            # Calculate new interval
            if old_repetitions == 0:
                card.interval = 1
            elif old_repetitions == 1:
                card.interval = 6
            else:
                card.interval = int(old_interval * card.ease_factor)
            
            # Increment repetitions
            card.repetitions = old_repetitions + 1
        
        # Calculate next review date
        card.next_review = datetime.utcnow() + timedelta(days=card.interval)
        
        return {
            'ease_factor': card.ease_factor,
            'interval': card.interval,
            'repetitions': card.repetitions,
            'next_review': card.next_review,
            'old_ease_factor': old_ease_factor,
            'old_interval': old_interval,
            'old_repetitions': old_repetitions
        }
    
    @staticmethod
    def get_due_cards(user_id: int, deck_id: int = None, limit: int = None):
        """
        Get cards that are due for review
        
        Args:
            user_id: User ID to filter cards
            deck_id: Optional deck ID to filter by deck
            limit: Optional limit on number of cards to return
        
        Returns:
            Query object of due cards
        """
        from app.models.deck import Deck
        
        query = Card.query.join(Deck).filter(
            Deck.user_id == user_id,
            Card.next_review <= datetime.utcnow()
        )
        
        if deck_id:
            query = query.filter(Card.deck_id == deck_id)
        
        query = query.order_by(Card.next_review.asc())
        
        if limit:
            query = query.limit(limit)
        
        return query
    
    @staticmethod
    def get_review_stats(user_id: int, deck_id: int = None):
        """
        Get statistics about reviews
        
        Args:
            user_id: User ID to filter stats
            deck_id: Optional deck ID to filter by deck
        
        Returns:
            dict with review statistics
        """
        from app.models.deck import Deck
        from app.models.review import Review
        
        # Get total cards
        cards_query = Card.query.join(Deck).filter(Deck.user_id == user_id)
        if deck_id:
            cards_query = cards_query.filter(Card.deck_id == deck_id)
        
        total_cards = cards_query.count()
        
        # Get due cards
        due_cards = SpacedRepetitionService.get_due_cards(user_id, deck_id).count()
        
        # Get cards reviewed today
        today = datetime.utcnow().date()
        today_reviews = Review.query.join(Card).join(Deck).filter(
            Deck.user_id == user_id,
            db.func.date(Review.reviewed_at) == today
        )
        if deck_id:
            today_reviews = today_reviews.filter(Card.deck_id == deck_id)
        today_reviews_count = today_reviews.count()
        
        return {
            'total_cards': total_cards,
            'due_cards': due_cards,
            'reviewed_today': today_reviews_count
        }

