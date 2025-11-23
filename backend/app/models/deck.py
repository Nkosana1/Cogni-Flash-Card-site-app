from datetime import datetime
from app import db


class Deck(db.Model):
    """Deck model for organizing flashcards"""
    __tablename__ = 'decks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#3B82F6')  # Hex color code
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cards = db.relationship('Card', backref='deck', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_cards=False):
        """Convert deck to dictionary"""
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'user_id': self.user_id,
            'card_count': self.cards.count() if hasattr(self, 'cards') else 0,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_cards:
            data['cards'] = [card.to_dict() for card in self.cards.all()]
        
        return data
    
    def __repr__(self):
        return f'<Deck {self.name}>'

