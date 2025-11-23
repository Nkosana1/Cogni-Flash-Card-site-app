from datetime import datetime
from app import db


class Review(db.Model):
    """Review model for tracking card review sessions"""
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    card_id = db.Column(db.Integer, db.ForeignKey('cards.id'), nullable=False)
    quality = db.Column(db.Integer, nullable=False)  # 0-5 rating (SM-2 quality)
    reviewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Store state before review for analytics
    ease_factor_before = db.Column(db.Float)
    interval_before = db.Column(db.Integer)
    repetitions_before = db.Column(db.Integer)
    
    # Store state after review
    ease_factor_after = db.Column(db.Float)
    interval_after = db.Column(db.Integer)
    repetitions_after = db.Column(db.Integer)
    
    def to_dict(self):
        """Convert review to dictionary"""
        return {
            'id': self.id,
            'card_id': self.card_id,
            'quality': self.quality,
            'reviewed_at': self.reviewed_at.isoformat(),
            'ease_factor_before': self.ease_factor_before,
            'interval_before': self.interval_before,
            'repetitions_before': self.repetitions_before,
            'ease_factor_after': self.ease_factor_after,
            'interval_after': self.interval_after,
            'repetitions_after': self.repetitions_after
        }
    
    def __repr__(self):
        return f'<Review {self.id}: Quality {self.quality}>'

