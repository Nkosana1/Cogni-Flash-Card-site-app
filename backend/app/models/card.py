from datetime import datetime
from app import db


class Card(db.Model):
    """Card model for individual flashcards"""
    __tablename__ = 'cards'
    
    id = db.Column(db.Integer, primary_key=True)
    front = db.Column(db.Text, nullable=False)
    back = db.Column(db.Text, nullable=False)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Spaced repetition fields (SM-2 algorithm)
    ease_factor = db.Column(db.Float, default=2.5)  # EF in SM-2
    interval = db.Column(db.Integer, default=1)  # Days until next review
    repetitions = db.Column(db.Integer, default=0)  # Number of successful reviews
    next_review = db.Column(db.DateTime, default=datetime.utcnow)  # Next scheduled review
    
    # Relationships
    reviews = db.relationship('Review', backref='card', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_reviews=False):
        """Convert card to dictionary"""
        data = {
            'id': self.id,
            'front': self.front,
            'back': self.back,
            'deck_id': self.deck_id,
            'ease_factor': self.ease_factor,
            'interval': self.interval,
            'repetitions': self.repetitions,
            'next_review': self.next_review.isoformat() if self.next_review else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_reviews:
            data['reviews'] = [review.to_dict() for review in self.reviews.all()]
        
        return data
    
    def __repr__(self):
        return f'<Card {self.id}: {self.front[:50]}>'

