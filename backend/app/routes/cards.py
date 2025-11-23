"""
Card operations endpoints
"""
import json
from flask import Blueprint, request, jsonify, Response
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
        back_content=data.get('back_content', ''),
        card_type=card_type,
        media_attachments=data.get('media_attachments', []),
        card_data=data.get('card_data', {}),
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


@cards_bp.route('/<int:card_id>/reverse', methods=['POST'])
@jwt_required()
def create_reverse_card(card_id):
    """Generate a reverse card from a basic card"""
    from app.services.card_generation import ReverseCardService
    
    user_id = get_jwt_identity()
    card = Card.query.join(Deck).filter(
        Card.id == card_id,
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    if card.card_type != CardType.BASIC:
        return jsonify({'error': 'Reverse cards can only be generated from basic cards'}), 400
    
    try:
        reverse_card = ReverseCardService.generate_reverse_card(card)
        db.session.add(reverse_card)
        db.session.commit()
        
        return jsonify({
            'message': 'Reverse card created',
            'card': reverse_card.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/decks/<int:deck_id>/generate-multiple-choice', methods=['POST'])
@jwt_required()
def generate_multiple_choice_cards(deck_id):
    """Generate multiple choice cards from all basic cards in a deck"""
    from app.services.card_generation import MultipleChoiceService
    
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    data = request.get_json() or {}
    num_options = data.get('num_options', 4)
    
    try:
        mc_cards = MultipleChoiceService.generate_from_deck(deck_id, num_options)
        db.session.add_all(mc_cards)
        db.session.commit()
        
        return jsonify({
            'message': f'{len(mc_cards)} multiple choice cards created',
            'cards': [card.to_dict() for card in mc_cards]
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/<int:card_id>/views', methods=['GET'])
@jwt_required()
def get_card_views(card_id):
    """Get card views (for cloze and image occlusion cards)"""
    from app.services.cloze_card import ClozeCardService
    from app.services.image_occlusion import ImageOcclusionService
    
    user_id = get_jwt_identity()
    card = Card.query.join(Deck).filter(
        Card.id == card_id,
        Deck.user_id == user_id
    ).first()
    
    if not card:
        return jsonify({'error': 'Card not found'}), 404
    
    views = []
    if card.card_type == CardType.CLOZE:
        views = ClozeCardService.generate_card_views(card)
    elif card.card_type == CardType.IMAGE_OCCLUSION:
        views = ImageOcclusionService.generate_card_views(card)
    
    return jsonify({
        'card_id': card_id,
        'card_type': card.card_type.value,
        'views': views
    }), 200


@cards_bp.route('/decks/<int:deck_id>/import', methods=['POST'])
@jwt_required()
def import_cards(deck_id):
    """Import cards from JSON or CSV format"""
    from app.services.card_import_export import CardImportExportService
    
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    format_type = data.get('format', 'json').lower()
    import_data = data.get('data')
    
    if not import_data:
        return jsonify({'error': 'Import data is required'}), 400
    
    try:
        if format_type == 'json':
            if isinstance(import_data, str):
                import_data = json.loads(import_data)
            cards = CardImportExportService.import_cards_from_json(deck_id, import_data, user_id)
        elif format_type == 'csv':
            if not isinstance(import_data, str):
                return jsonify({'error': 'CSV data must be a string'}), 400
            cards = CardImportExportService.import_cards_from_csv(deck_id, import_data, user_id)
        else:
            return jsonify({'error': 'Invalid format. Use "json" or "csv"'}), 400
        
        return jsonify({
            'message': f'{len(cards)} cards imported successfully',
            'cards': [card.to_dict() for card in cards]
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@cards_bp.route('/decks/<int:deck_id>/export', methods=['GET'])
@jwt_required()
def export_cards(deck_id):
    """Export deck cards to JSON, CSV, or Anki format"""
    from app.services.card_import_export import CardImportExportService
    
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    format_type = request.args.get('format', 'json').lower()
    
    try:
        if format_type == 'json':
            data = CardImportExportService.export_deck_to_json(deck_id)
            return jsonify(data), 200
        elif format_type == 'csv':
            csv_data = CardImportExportService.export_deck_to_csv(deck_id)
            return Response(
                csv_data,
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename=deck_{deck_id}.csv'}
            )
        elif format_type == 'anki':
            anki_data = CardImportExportService.export_to_anki_format(deck_id)
            return jsonify({'cards': anki_data}), 200
        else:
            return jsonify({'error': 'Invalid format. Use "json", "csv", or "anki"'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
