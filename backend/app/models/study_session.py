"""
StudySession model for tracking study sessions.

This model represents a study session where a user reviews cards from a deck,
tracking start/end times, number of cards studied, and correct answers.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app import db


class StudySession(db.Model):
    """
    StudySession model for tracking study sessions.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to User (indexed)
        deck_id: Foreign key to Deck (indexed)
        start_time: Session start timestamp
        end_time: Session end timestamp (nullable)
        cards_studied: Number of cards reviewed in session
        correct_count: Number of correct answers
    
    Relationships:
        - Many-to-one with User
        - Many-to-one with Deck
    """
    __tablename__ = 'study_sessions'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    deck_id = db.Column(
        db.Integer,
        db.ForeignKey('decks.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    start_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    end_time = db.Column(db.DateTime, nullable=True)
    cards_studied = db.Column(db.Integer, default=0, nullable=False)
    correct_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Indexes for performance
    __table_args__ = (
        db.Index('idx_session_user_deck', 'user_id', 'deck_id'),
        db.Index('idx_session_user_start', 'user_id', 'start_time'),
    )
    
    def validate(self) -> tuple:
        """
        Validate session data.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if self.cards_studied < 0:
            return False, "Cards studied must be non-negative"
        
        if self.correct_count < 0:
            return False, "Correct count must be non-negative"
        
        if self.correct_count > self.cards_studied:
            return False, "Correct count cannot exceed cards studied"
        
        if self.end_time and self.end_time < self.start_time:
            return False, "End time cannot be before start time"
        
        return True, None
    
    def end_session(self) -> None:
        """Mark session as ended with current timestamp."""
        self.end_time = datetime.utcnow()
    
    def increment_cards_studied(self) -> None:
        """Increment the cards studied counter."""
        self.cards_studied += 1
    
    def increment_correct(self) -> None:
        """Increment the correct count."""
        self.correct_count += 1
        self.increment_cards_studied()
    
    def increment_incorrect(self) -> None:
        """Increment cards studied without incrementing correct count."""
        self.increment_cards_studied()
    
    def get_duration_seconds(self) -> Optional[int]:
        """
        Get session duration in seconds.
        
        Returns:
            Duration in seconds, or None if session not ended
        """
        if not self.end_time:
            return None
        return int((self.end_time - self.start_time).total_seconds())
    
    def get_accuracy(self) -> float:
        """
        Calculate accuracy percentage.
        
        Returns:
            Accuracy as percentage (0-100), or 0 if no cards studied
        """
        if self.cards_studied == 0:
            return 0.0
        return (self.correct_count / self.cards_studied) * 100.0
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert session to dictionary for API responses.
        
        Returns:
            Dictionary representation of session
        """
        duration = self.get_duration_seconds()
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'deck_id': self.deck_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'cards_studied': self.cards_studied,
            'correct_count': self.correct_count,
            'accuracy': round(self.get_accuracy(), 2),
            'duration_seconds': duration,
            'is_active': self.end_time is None
        }
    
    def __repr__(self) -> str:
        return f'<StudySession {self.id}: User {self.user_id}, Deck {self.deck_id}>'
