"""
Card operations endpoints
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.card import Card, CardType
from app.models.deck import Deck
from app.schemas.card import CardCreateSchema, CardUpdateSchema, CardBatchSchema
from app.utils.pagination import paginate_query
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

cards_bp = Blueprint('cards', __name__)


@cards_bp.route('/decks/<int:deck_id>/cards', methods=['GET'])
@jwt_required()
def get_deck_cards(deck_id):
    """
    List cards in a deck with pagination
    
    Query parameters:
        - page: Page number (default: 1)
        - per_page: Items per page (default: 20, max: 100)
    
    Returns:
        - 200: List of cards with pagination
        - 404: Deck not found
    """
    user_id = get_jwt_identity()
    
    # Verify deck ownership
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    query = Card.query.filter_by(deck_id=deck_id).order_by(Card.created_at.desc())
    result = paginate_query(query)
    
    return jsonify(result), 200


@cards_bp.route('/decks/<int:deck_id>/cards', methods=['POST'])
@jwt_required()
def create_card(deck_id):
    """
    Create a new card in a deck
    
    Request body:
        - front_content: string (required)
        - back_content: string (required)
        - card_type: string (optional, default: 'basic')
        - media_attachments: array of objects (optional)
    
    Returns:
        - 201: Card created successfully
        - 404: Deck not found
        - 400: Validation error
    """
    user_id = get_jwt_identity()
    
    # Verify deck ownership
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    schema = CardCreateSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Convert card_type string to enum
    card_type = CardType[data.get('card_type', 'basic').upper()]
    
    card = Card(
        front_content=data['front_content'],
        back_content=data['back_content'],
        card_type=card_type,
        media_attachments=data.get('media_attachments', []),
        deck_id=deck_id
    )
    
    # Validate card
    is_valid, error_msg = card.validate()
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
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
    """
    Get card details
    
    Returns:
        - 200: Card data
        - 404: Card not found
    """
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
    """
    Update a card
    
    Request body (all optional):
        - front_content: string
        - back_content: string
        - card_type: string
        - media_attachments: array of objects
    
    Returns:
        - 200: Card updated successfully
        - 404: Card not found
        - 400: Validation error
    """
    user_id = get_jwt_identity()
    card = Card.query.join(Deck).filter(
        Card.id == card_id,
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    schema = CardUpdateSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Update fields
    if 'front_content' in data:
        card.front_content = data['front_content']
    if 'back_content' in data:
        card.back_content = data['back_content']
    if 'card_type' in data:
        card.card_type = CardType[data['card_type'].upper()]
    if 'media_attachments' in data:
        card.media_attachments = data['media_attachments']
    
    # Validate
    is_valid, error_msg = card.validate()
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    try:
        db.session.commit()
        return jsonify(card.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    """
    Delete a card
    
    Returns:
        - 200: Card deleted successfully
        - 404: Card not found
    """
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


@cards_bp.route('/batch', methods=['POST'])
@jwt_required()
def batch_create_cards():
    """
    Bulk create cards in a deck
    
    Request body:
        - deck_id: integer (required)
        - cards: array of card objects (required, max 100)
          Each card object:
            - front_content: string (required)
            - back_content: string (required)
            - card_type: string (optional, default: 'basic')
    
    Returns:
        - 201: Cards created successfully
        - 404: Deck not found
        - 400: Validation error
    """
    user_id = get_jwt_identity()
    schema = CardBatchSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    deck_id = data['deck_id']
    
    # Verify deck ownership
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    cards = []
    for card_data in data['cards']:
        card_type = CardType[card_data.get('card_type', 'basic').upper()]
        
        card = Card(
            front_content=card_data['front_content'],
            back_content=card_data['back_content'],
            card_type=card_type,
            deck_id=deck_id
        )
        
        # Validate each card
        is_valid, error_msg = card.validate()
        if not is_valid:
            return jsonify({'error': f'Invalid card: {error_msg}'}), 400
        
        cards.append(card)
    
    try:
        db.session.add_all(cards)
        db.session.commit()
        
        return jsonify({
            'message': f'{len(cards)} cards created successfully',
            'cards': [card.to_dict() for card in cards]
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
