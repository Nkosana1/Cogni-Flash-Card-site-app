"""
Deck management endpoints
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.deck import Deck
from app.models.card import Card
from app.schemas.deck import DeckCreateSchema, DeckUpdateSchema
from app.utils.pagination import paginate_query
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import or_

decks_bp = Blueprint('decks', __name__)


@decks_bp.route('', methods=['GET'])
@jwt_required()
def get_decks():
    """
    List user's decks with pagination
    
    Query parameters:
        - page: Page number (default: 1)
        - per_page: Items per page (default: 20, max: 100)
    
    Returns:
        - 200: List of decks with pagination metadata
    """
    user_id = get_jwt_identity()
    query = Deck.query.filter_by(user_id=user_id).order_by(Deck.created_at.desc())
    
    result = paginate_query(query)
    return jsonify(result), 200


@decks_bp.route('', methods=['POST'])
@jwt_required()
def create_deck():
    """
    Create a new deck
    
    Request body:
        - title: string (required, 1-200 chars)
        - description: string (optional, max 1000 chars)
        - is_public: boolean (default: false)
        - tags: array of strings (optional)
        - color: hex color string (default: #3B82F6)
    
    Returns:
        - 201: Deck created successfully
        - 400: Validation error
    """
    user_id = get_jwt_identity()
    schema = DeckCreateSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    deck = Deck(
        title=data['title'],
        description=data.get('description'),
        is_public=data.get('is_public', False),
        tags=data.get('tags', []),
        user_id=user_id
    )
    
    # Validate deck
    is_valid, error_msg = deck.validate()
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    try:
        db.session.add(deck)
        db.session.commit()
        return jsonify(deck.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@decks_bp.route('/<int:deck_id>', methods=['GET'])
@jwt_required()
def get_deck(deck_id):
    """
    Get deck details with cards
    
    Returns:
        - 200: Deck data with cards
        - 404: Deck not found
    """
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    return jsonify(deck.to_dict(include_cards=True)), 200


@decks_bp.route('/<int:deck_id>', methods=['PUT'])
@jwt_required()
def update_deck(deck_id):
    """
    Update a deck
    
    Request body (all optional):
        - title: string (1-200 chars)
        - description: string (max 1000 chars)
        - is_public: boolean
        - tags: array of strings
        - color: hex color string
    
    Returns:
        - 200: Deck updated successfully
        - 404: Deck not found
        - 400: Validation error
    """
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    schema = DeckUpdateSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Update fields
    if 'title' in data:
        deck.title = data['title']
    if 'description' in data:
        deck.description = data['description']
    if 'is_public' in data:
        deck.is_public = data['is_public']
    if 'tags' in data:
        deck.tags = data['tags']
    if 'color' in data:
        deck.color = data['color']
    
    # Validate
    is_valid, error_msg = deck.validate()
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    try:
        db.session.commit()
        return jsonify(deck.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@decks_bp.route('/<int:deck_id>', methods=['DELETE'])
@jwt_required()
def delete_deck(deck_id):
    """
    Delete a deck
    
    Returns:
        - 200: Deck deleted successfully
        - 404: Deck not found
    """
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    try:
        db.session.delete(deck)
        db.session.commit()
        return jsonify({'message': 'Deck deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@decks_bp.route('/public', methods=['GET'])
@jwt_required()
def get_public_decks():
    """
    Browse public decks with pagination
    
    Query parameters:
        - page: Page number (default: 1)
        - per_page: Items per page (default: 20, max: 100)
        - search: Search term for title/description (optional)
        - tags: Comma-separated tags to filter (optional)
    
    Returns:
        - 200: List of public decks with pagination
    """
    query = Deck.query.filter_by(is_public=True).order_by(Deck.created_at.desc())
    
    # Search filter
    search = request.args.get('search', '').strip()
    if search:
        query = query.filter(
            or_(
                Deck.title.ilike(f'%{search}%'),
                Deck.description.ilike(f'%{search}%')
            )
        )
    
    # Tags filter
    tags_param = request.args.get('tags', '').strip()
    if tags_param:
        tags_list = [tag.strip().lower() for tag in tags_param.split(',')]
        # Filter decks that have any of the specified tags
        for tag in tags_list:
            query = query.filter(
                db.func.lower(db.func.cast(Deck.tags, db.String)).contains(tag.lower())
            )
    
    result = paginate_query(query)
    return jsonify(result), 200


@decks_bp.route('/<int:deck_id>/clone', methods=['POST'])
@jwt_required()
def clone_deck(deck_id):
    """
    Clone a public deck to user's collection
    
    Returns:
        - 201: Deck cloned successfully
        - 404: Deck not found or not public
        - 400: Deck already owned by user
    """
    user_id = get_jwt_identity()
    
    # Get public deck
    deck = Deck.query.filter_by(id=deck_id, is_public=True).first()
    
    if not deck:
        return jsonify({'error': 'Public deck not found'}), 404
    
    # Check if user already owns this deck
    if deck.user_id == user_id:
        return jsonify({'error': 'You already own this deck'}), 400
    
    # Create cloned deck
    cloned_deck = Deck(
        title=f"{deck.title} (Copy)",
        description=deck.description,
        is_public=False,  # Cloned decks are private by default
        tags=deck.tags.copy() if deck.tags else [],
        user_id=user_id
    )
    
    try:
        db.session.add(cloned_deck)
        db.session.flush()  # Get the new deck ID
        
        # Clone all cards
        for card in deck.cards.all():
            cloned_card = Card(
                front_content=card.front_content,
                back_content=card.back_content,
                card_type=card.card_type,
                media_attachments=card.media_attachments.copy() if card.media_attachments else [],
                deck_id=cloned_deck.id
            )
            db.session.add(cloned_card)
        
        db.session.commit()
        return jsonify(cloned_deck.to_dict(include_cards=True)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
