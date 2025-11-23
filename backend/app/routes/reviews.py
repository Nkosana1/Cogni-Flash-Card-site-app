from flask import Blueprint, request, jsonify
from app import db
from app.models.card import Card
from app.models.deck import Deck
from app.models.card_review import CardReview
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
    
    # Get latest review to pass current state
    last_review = SpacedRepetitionService.get_latest_review(card.id, user_id)
    
    # Calculate new spaced repetition parameters and create CardReview
    result = SpacedRepetitionService.calculate_next_review(
        card=card,
        user_id=user_id,
        quality=quality,
        last_review=last_review
    )
    
    card_review = result['card_review']
    
    # Validate the review
    is_valid, error_msg = card_review.validate()
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    try:
        db.session.add(card_review)
        db.session.commit()
        
        return jsonify({
            'review': card_review.to_dict(),
            'card': card.to_dict(),
            'next_review': result['next_review'].isoformat()
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
    
    query = CardReview.query.join(Card).join(Deck).filter(
        Deck.user_id == user_id,
        CardReview.user_id == user_id
    )
    
    if card_id:
        query = query.filter(CardReview.card_id == card_id)
    elif deck_id:
        query = query.filter(Card.deck_id == deck_id)
    
    query = query.order_by(CardReview.reviewed_at.desc()).limit(limit)
    
    reviews = query.all()
    return jsonify([review.to_dict() for review in reviews]), 200

