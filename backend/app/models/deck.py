"""
Deck model for organizing flashcards into collections.

This model represents a collection of flashcards that can be public or private,
with tags for organization and categorization.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from app import db
import json


class Deck(db.Model):
    """
    Deck model for organizing flashcards.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to User (indexed)
        title: Deck title/name
        description: Optional deck description
        is_public: Whether deck is publicly visible
        created_at: Creation timestamp
        tags: JSON array of tags for categorization
    
    Relationships:
        - Many-to-one with User
        - One-to-many with Card
        - One-to-many with StudySession
    """
    __tablename__ = 'decks'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    tags = db.Column(db.JSON, default=list, nullable=False)
    
    # Relationships
    cards = db.relationship(
        'Card',
        backref='deck',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    study_sessions = db.relationship(
        'StudySession',
        backref='deck',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    # Indexes
    __table_args__ = (
        db.Index('idx_deck_user_public', 'user_id', 'is_public'),
    )
    
    def validate(self) -> tuple:
        """
        Validate deck data.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not self.title or len(self.title.strip()) == 0:
            return False, "Deck title is required"
        
        if len(self.title) > 200:
            return False, "Deck title must be 200 characters or less"
        
        if self.tags and not isinstance(self.tags, list):
            return False, "Tags must be a list"
        
        return True, None
    
    def add_tag(self, tag: str) -> None:
        """
        Add a tag to the deck.
        
        Args:
            tag: Tag string to add
        """
        if not self.tags:
            self.tags = []
        
        tag_lower = tag.lower().strip()
        if tag_lower and tag_lower not in [t.lower() for t in self.tags]:
            self.tags.append(tag)
    
    def remove_tag(self, tag: str) -> None:
        """
        Remove a tag from the deck.
        
        Args:
            tag: Tag string to remove
        """
        if not self.tags:
            return
        
        tag_lower = tag.lower().strip()
        self.tags = [t for t in self.tags if t.lower() != tag_lower]
    
    def has_tag(self, tag: str) -> bool:
        """
        Check if deck has a specific tag.
        
        Args:
            tag: Tag string to check
        
        Returns:
            True if tag exists, False otherwise
        """
        if not self.tags:
            return False
        tag_lower = tag.lower().strip()
        return any(t.lower() == tag_lower for t in self.tags)
    
    def get_card_count(self) -> int:
        """
        Get the number of cards in this deck.
        
        Returns:
            Number of cards
        """
        return self.cards.count() if hasattr(self, 'cards') else 0
    
    def to_dict(self, include_cards: bool = False) -> Dict[str, Any]:
        """
        Convert deck to dictionary for API responses.
        
        Args:
            include_cards: Whether to include card data
        
        Returns:
            Dictionary representation of deck
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'is_public': self.is_public,
            'tags': self.tags or [],
            'card_count': self.get_card_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_cards:
            data['cards'] = [card.to_dict() for card in self.cards.all()]
        
        return data
    
    def __repr__(self) -> str:
        return f'<Deck {self.title} (user_id={self.user_id})>'
