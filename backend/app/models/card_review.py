"""
CardReview model for tracking spaced repetition reviews.

This model stores individual review sessions for cards, including quality ratings,
SM-2 algorithm parameters (ease_factor, interval, repetitions), and next review dates.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app import db


class CardReview(db.Model):
    """
    CardReview model for tracking card review sessions with SM-2 algorithm.
    
    Attributes:
        id: Primary key
        card_id: Foreign key to Card (indexed)
        user_id: Foreign key to User (indexed)
        quality: Quality rating (0-5: Again, Hard, Good, Easy)
        reviewed_at: Timestamp of review
        ease_factor: SM-2 ease factor (default 2.5)
        interval: Days until next review
        repetitions: Number of successful reviews
        next_review: Scheduled next review date (indexed)
    
    Relationships:
        - Many-to-one with Card
        - Many-to-one with User
    """
    __tablename__ = 'card_reviews'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    card_id = db.Column(
        db.Integer,
        db.ForeignKey('cards.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    quality = db.Column(db.Integer, nullable=False)  # 0-5 rating
    reviewed_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # SM-2 Algorithm parameters
    ease_factor = db.Column(db.Float, default=2.5, nullable=False)
    interval = db.Column(db.Integer, default=1, nullable=False)
    repetitions = db.Column(db.Integer, default=0, nullable=False)
    next_review = db.Column(db.DateTime, nullable=True, index=True)
    
    # Indexes for performance
    __table_args__ = (
        db.Index('idx_review_user_card', 'user_id', 'card_id'),
        db.Index('idx_review_next_review', 'user_id', 'next_review'),
        db.Index('idx_review_deck_next', 'card_id', 'next_review'),
    )
    
    def validate(self) -> tuple:
        """
        Validate review data.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if self.quality < 0 or self.quality > 5:
            return False, "Quality must be between 0 and 5"
        
        if self.ease_factor < 1.3:
            return False, "Ease factor must be at least 1.3"
        
        if self.interval < 0:
            return False, "Interval must be non-negative"
        
        if self.repetitions < 0:
            return False, "Repetitions must be non-negative"
        
        return True, None
    
    def get_quality_label(self) -> str:
        """
        Get human-readable quality label.
        
        Returns:
            Quality label string
        """
        quality_labels = {
            0: 'Again',
            1: 'Again',
            2: 'Hard',
            3: 'Hard',
            4: 'Good',
            5: 'Easy'
        }
        return quality_labels.get(self.quality, 'Unknown')
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert review to dictionary for API responses.
        
        Returns:
            Dictionary representation of review
        """
        return {
            'id': self.id,
            'card_id': self.card_id,
            'user_id': self.user_id,
            'quality': self.quality,
            'quality_label': self.get_quality_label(),
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'ease_factor': self.ease_factor,
            'interval': self.interval,
            'repetitions': self.repetitions,
            'next_review': self.next_review.isoformat() if self.next_review else None
        }
    
    def __repr__(self) -> str:
        return f'<CardReview {self.id}: Card {self.card_id}, Quality {self.quality}>'
