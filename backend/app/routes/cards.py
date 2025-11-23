from flask import Blueprint, request, jsonify
from app import db
from app.models.card import Card
from app.models.deck import Deck
from flask_jwt_extended import jwt_required, get_jwt_identity

cards_bp = Blueprint('cards', __name__)


@cards_bp.route('', methods=['GET'])
@jwt_required()
def get_cards():
    """Get cards, optionally filtered by deck"""
    user_id = get_jwt_identity()
    deck_id = request.args.get('deck_id', type=int)
    
    query = Card.query.join(Deck).filter(Deck.user_id == user_id)
    
    if deck_id:
        query = query.filter(Card.deck_id == deck_id)
    
    cards = query.all()
    return jsonify([card.to_dict() for card in cards]), 200


@cards_bp.route('', methods=['POST'])
@jwt_required()
def create_card():
    """Create a new card"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('front') or not data.get('back') or not data.get('deck_id'):
        return jsonify({'error': 'Front, back, and deck_id are required'}), 400
    
    # Verify deck belongs to user
    deck = Deck.query.filter_by(id=data['deck_id'], user_id=user_id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    card = Card(
        front=data['front'],
        back=data['back'],
        deck_id=data['deck_id']
    )
    
    try:
        db.session.add(card)
        db.session.commit()
        return jsonify(card.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/<int:card_id>', methods=['GET'])
@jwt_required()
def get_card(card_id):
    """Get a specific card"""
    user_id = get_jwt_identity()
    card = Card.query.join(Deck).filter(
        Card.id == card_id,
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    return jsonify(card.to_dict()), 200


@cards_bp.route('/<int:card_id>', methods=['PUT'])
@jwt_required()
def update_card(card_id):
    """Update a card"""
    user_id = get_jwt_identity()
    card = Card.query.join(Deck).filter(
        Card.id == card_id,
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    data = request.get_json()
    
    if 'front' in data:
        card.front = data['front']
    if 'back' in data:
        card.back = data['back']
    if 'deck_id' in data:
        # Verify new deck belongs to user
        deck = Deck.query.filter_by(id=data['deck_id'], user_id=user_id).first()
        if not deck:
            return jsonify({'error': 'Deck not found'}), 404
        card.deck_id = data['deck_id']
    
    try:
        db.session.commit()
        return jsonify(card.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    """Delete a card"""
    user_id = get_jwt_identity()
    card = Card.query.join(Deck).filter(
        Card.id == card_id,
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    try:
        db.session.delete(card)
        db.session.commit()
        return jsonify({'message': 'Card deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/due', methods=['GET'])
@jwt_required()
def get_due_cards():
    """Get cards that are due for review"""
    from app.services.spaced_repetition import SpacedRepetitionService
    
    user_id = get_jwt_identity()
    deck_id = request.args.get('deck_id', type=int)
    limit = request.args.get('limit', type=int)
    
    service = SpacedRepetitionService(db.session)
    due_cards = service.get_due_cards(user_id, deck_id, limit)
    
    return jsonify([card.to_dict() for card in due_cards]), 200

