"""
Card model for individual flashcards.

This model represents a single flashcard with front/back content,
card type (basic, cloze, image_occlusion), and media attachments.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from app import db
import enum


class CardType(enum.Enum):
    """Enumeration for card types."""
    BASIC = 'basic'
    CLOZE = 'cloze'
    IMAGE_OCCLUSION = 'image_occlusion'
    REVERSE = 'reverse'
    MULTIPLE_CHOICE = 'multiple_choice'


class Card(db.Model):
    """
    Card model for individual flashcards.
    
    Attributes:
        id: Primary key
        deck_id: Foreign key to Deck (indexed)
        front_content: Front side content of the card
        back_content: Back side content of the card
        card_type: Type of card (basic, cloze, image_occlusion)
        created_at: Creation timestamp
        media_attachments: JSON array of media file references
    
    Relationships:
        - Many-to-one with Deck
        - One-to-many with CardReview
    """
    __tablename__ = 'cards'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    deck_id = db.Column(
        db.Integer,
        db.ForeignKey('decks.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    front_content = db.Column(db.Text, nullable=False)
    back_content = db.Column(db.Text, nullable=False)
    card_type = db.Column(
        db.Enum(CardType, name='card_type_enum'),
        default=CardType.BASIC,
        nullable=False
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    media_attachments = db.Column(db.JSON, default=list, nullable=False)
    # Card-specific data (cloze deletions, occlusion regions, multiple choice options, etc.)
    card_data = db.Column(db.JSON, default=dict, nullable=False)
    
    # Relationships
    reviews = db.relationship(
        'CardReview',
        backref='card',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    # Indexes
    __table_args__ = (
        db.Index('idx_card_deck_type', 'deck_id', 'card_type'),
    )
    
    def validate(self) -> tuple:
        """
        Validate card data based on card type.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not self.front_content or len(self.front_content.strip()) == 0:
            return False, "Front content is required"
        
        if not isinstance(self.card_type, CardType):
            try:
                self.card_type = CardType(self.card_type)
            except ValueError:
                return False, f"Invalid card type. Must be one of: {[t.value for t in CardType]}"
        
        if self.media_attachments and not isinstance(self.media_attachments, list):
            return False, "Media attachments must be a list"
        
        # Type-specific validation
        if self.card_type == CardType.CLOZE:
            from app.services.cloze_card import ClozeCardService
            is_valid, error = ClozeCardService.validate_cloze_syntax(self.front_content)
            if not is_valid:
                return False, f"Cloze syntax error: {error}"
        
        elif self.card_type == CardType.IMAGE_OCCLUSION:
            if not self.card_data:
                return False, "Image occlusion cards require card_data with image and regions"
            from app.services.image_occlusion import ImageOcclusionService
            is_valid, error = ImageOcclusionService.validate_occlusion_data(self.card_data)
            if not is_valid:
                return False, f"Image occlusion error: {error}"
        
        elif self.card_type == CardType.BASIC:
            if not self.back_content or len(self.back_content.strip()) == 0:
                return False, "Back content is required for basic cards"
        
        elif self.card_type == CardType.REVERSE:
            # Reverse cards may not have back_content if generated
            pass
        
        elif self.card_type == CardType.MULTIPLE_CHOICE:
            if not self.card_data or 'options' not in self.card_data:
                return False, "Multiple choice cards require options in card_data"
        
        return True, None
    
    def add_media(self, media_url: str, media_type: str = 'image') -> None:
        """
        Add a media attachment to the card.
        
        Args:
            media_url: URL or path to media file
            media_type: Type of media (image, audio, video)
        """
        if not self.media_attachments:
            self.media_attachments = []
        
        media_item = {
            'url': media_url,
            'type': media_type,
            'added_at': datetime.utcnow().isoformat()
        }
        self.media_attachments.append(media_item)
    
    def remove_media(self, media_url: str) -> None:
        """
        Remove a media attachment from the card.
        
        Args:
            media_url: URL or path to media file to remove
        """
        if not self.media_attachments:
            return
        
        self.media_attachments = [
            m for m in self.media_attachments
            if m.get('url') != media_url
        ]
    
    def get_review_count(self) -> int:
        """
        Get the number of reviews for this card.
        
        Returns:
            Number of reviews
        """
        return self.reviews.count() if hasattr(self, 'reviews') else 0
    
    def to_dict(self, include_reviews: bool = False) -> Dict[str, Any]:
        """
        Convert card to dictionary for API responses.
        
        Args:
            include_reviews: Whether to include review data
        
        Returns:
            Dictionary representation of card
        """
        data = {
            'id': self.id,
            'deck_id': self.deck_id,
            'front_content': self.front_content,
            'back_content': self.back_content,
            'card_type': self.card_type.value if isinstance(self.card_type, CardType) else self.card_type,
            'media_attachments': self.media_attachments or [],
            'card_data': self.card_data or {},
            'review_count': self.get_review_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_reviews:
            data['reviews'] = [review.to_dict() for review in self.reviews.all()]
        
        return data
    
    def __repr__(self) -> str:
        return f'<Card {self.id}: {self.front_content[:50]}...>'
