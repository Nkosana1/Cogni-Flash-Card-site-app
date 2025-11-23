from flask import Blueprint, request, jsonify
from app import db
from app.models.card import Card
from app.models.deck import Deck
from app.models.review import Review
from app.services.spaced_repetition import SpacedRepetitionService
from flask_jwt_extended import jwt_required, get_jwt_identity

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    """Create a review for a card and update spaced repetition parameters"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'card_id' not in data or 'quality' not in data:
        return jsonify({'error': 'card_id and quality are required'}), 400
    
    quality = data['quality']
    if not isinstance(quality, int) or quality < 0 or quality > 5:
        return jsonify({'error': 'Quality must be an integer between 0 and 5'}), 400
    
    # Verify card belongs to user
    card = Card.query.join(Deck).filter(
        Card.id == data['card_id'],
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    # Store state before review
    ease_factor_before = card.ease_factor
    interval_before = card.interval
    repetitions_before = card.repetitions
    
    # Calculate new spaced repetition parameters
    result = SpacedRepetitionService.calculate_next_review(card, quality)
    
    # Create review record
    review = Review(
        card_id=card.id,
        quality=quality,
        ease_factor_before=ease_factor_before,
        interval_before=interval_before,
        repetitions_before=repetitions_before,
        ease_factor_after=result['ease_factor'],
        interval_after=result['interval'],
        repetitions_after=result['repetitions']
    )
    
    try:
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'review': review.to_dict(),
            'card': card.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@reviews_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_review_stats():
    """Get review statistics"""
    user_id = get_jwt_identity()
    deck_id = request.args.get('deck_id', type=int)
    
    stats = SpacedRepetitionService.get_review_stats(user_id, deck_id)
    
    return jsonify(stats), 200


@reviews_bp.route('/history', methods=['GET'])
@jwt_required()
def get_review_history():
    """Get review history for cards"""
    user_id = get_jwt_identity()
    card_id = request.args.get('card_id', type=int)
    deck_id = request.args.get('deck_id', type=int)
    limit = request.args.get('limit', type=int, default=50)
    
    query = Review.query.join(Card).join(Deck).filter(Deck.user_id == user_id)
    
    if card_id:
        query = query.filter(Review.card_id == card_id)
    elif deck_id:
        query = query.filter(Card.deck_id == deck_id)
    
    query = query.order_by(Review.reviewed_at.desc()).limit(limit)
    
    reviews = query.all()
    return jsonify([review.to_dict() for review in reviews]), 200

