from flask import Blueprint, request, jsonify
from app import db
from app.models.deck import Deck
from flask_jwt_extended import jwt_required, get_jwt_identity

decks_bp = Blueprint('decks', __name__)


@decks_bp.route('', methods=['GET'])
@jwt_required()
def get_decks():
    """Get all decks for the current user"""
    user_id = get_jwt_identity()
    decks = Deck.query.filter_by(user_id=user_id).all()
    
    return jsonify([deck.to_dict() for deck in decks]), 200


@decks_bp.route('', methods=['POST'])
@jwt_required()
def create_deck():
    """Create a new deck"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Deck name is required'}), 400
    
    deck = Deck(
        name=data['name'],
        description=data.get('description', ''),
        color=data.get('color', '#3B82F6'),
        user_id=user_id
    )
    
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
    """Get a specific deck with cards"""
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    return jsonify(deck.to_dict(include_cards=True)), 200


@decks_bp.route('/<int:deck_id>', methods=['PUT'])
@jwt_required()
def update_deck(deck_id):
    """Update a deck"""
    user_id = get_jwt_identity()
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        deck.name = data['name']
    if 'description' in data:
        deck.description = data['description']
    if 'color' in data:
        deck.color = data['color']
    
    try:
        db.session.commit()
        return jsonify(deck.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@decks_bp.route('/<int:deck_id>', methods=['DELETE'])
@jwt_required()
def delete_deck(deck_id):
    """Delete a deck"""
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

