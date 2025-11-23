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
    
    try:
        service = SpacedRepetitionService(db.session)
        result = service.process_review(
            card_id=data['card_id'],
            user_id=user_id,
            quality=quality
        )
        
        # Get updated card
        card = Card.query.get(data['card_id'])
        
        return jsonify({
            'review': {
                'id': result['review_id'],
                'card_id': result['card_id'],
                'user_id': result['user_id'],
                'quality': result['quality'],
                'ease_factor': result['ease_factor'],
                'interval': result['interval'],
                'repetitions': result['repetitions'],
                'next_review': result['next_review']
            },
            'card': card.to_dict() if card else None,
            'previous_state': result['previous_state']
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@reviews_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_review_stats():
    """Get review statistics"""
    user_id = get_jwt_identity()
    deck_id = request.args.get('deck_id', type=int)
    
    service = SpacedRepetitionService(db.session)
    stats = service.get_review_stats(user_id, deck_id)
    
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


@reviews_bp.route('/queue', methods=['GET'])
@jwt_required()
def get_study_queue():
    """Get optimized study queue with due and new cards"""
    user_id = get_jwt_identity()
    deck_id = request.args.get('deck_id', type=int)
    
    service = SpacedRepetitionService(db.session)
    queue = service.get_study_queue(user_id, deck_id)
    
    return jsonify(queue), 200

