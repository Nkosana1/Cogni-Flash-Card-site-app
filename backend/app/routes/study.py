"""
Study session endpoints
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from app import db
from app.models.study_session import StudySession
from app.models.deck import Deck
from app.services.spaced_repetition import SpacedRepetitionService
from app.schemas.study import ReviewSchema, StudySessionStartSchema
from app.utils.rate_limit import rate_limit
from flask_jwt_extended import jwt_required
from app.utils.auth import get_current_user_id
from marshmallow import ValidationError

study_bp = Blueprint('study', __name__)


@study_bp.route('/queue', methods=['GET'])
@jwt_required()
@rate_limit(max_requests=60, window_seconds=60, per_user=True)
def get_study_queue():
    """
    Get due cards for study (optimized queue)
    
    Query parameters:
        - deck_id: integer (optional) - Filter by deck
    
    Returns:
        - 200: Study queue with due and new cards
    """
    user_id = get_current_user_id()
    deck_id = request.args.get('deck_id', type=int)
    
    service = SpacedRepetitionService(db.session)
    queue = service.get_study_queue(user_id, deck_id)
    
    return jsonify(queue), 200


@study_bp.route('/review', methods=['POST'])
@jwt_required()
@rate_limit(max_requests=120, window_seconds=60, per_user=True)
def submit_review():
    """
    Submit a card review
    
    Request body:
        - card_id: integer (required)
        - quality: integer (required, 0-5)
    
    Returns:
        - 201: Review submitted successfully
        - 400: Validation error
    """
    user_id = get_current_user_id()
    schema = ReviewSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    try:
        service = SpacedRepetitionService(db.session)
        result = service.process_review(
            card_id=data['card_id'],
            user_id=user_id,
            quality=data['quality']
        )
        
        # Update current study session if exists
        session = StudySession.query.filter_by(
            user_id=user_id,
            end_time=None
        ).first()
        
        if session:
            if data['quality'] >= 3:  # Correct answer
                session.increment_correct()
            else:
                session.increment_incorrect()
            db.session.commit()
        
        return jsonify({
            'message': 'Review submitted successfully',
            'review': {
                'id': result['review_id'],
                'card_id': result['card_id'],
                'quality': result['quality'],
                'ease_factor': result['ease_factor'],
                'interval': result['interval'],
                'repetitions': result['repetitions'],
                'next_review': result['next_review']
            },
            'previous_state': result['previous_state']
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@study_bp.route('/session/current', methods=['GET'])
@jwt_required()
def get_current_session():
    """
    Get current active study session
    
    Returns:
        - 200: Current session data or null if no active session
    """
    user_id = get_current_user_id()
    
    session = StudySession.query.filter_by(
        user_id=user_id,
        end_time=None
    ).order_by(StudySession.start_time.desc()).first()
    
    if not session:
        return jsonify({'session': None}), 200
    
    return jsonify({'session': session.to_dict()}), 200


@study_bp.route('/session/start', methods=['POST'])
@jwt_required()
@rate_limit(max_requests=10, window_seconds=60, per_user=True)
def start_session():
    """
    Start a new study session
    
    Request body:
        - deck_id: integer (required)
    
    Returns:
        - 201: Session started successfully
        - 400: Validation error or active session exists
    """
    user_id = get_current_user_id()
    schema = StudySessionStartSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Check for active session
    active_session = StudySession.query.filter_by(
        user_id=user_id,
        end_time=None
    ).first()
    
    if active_session:
        return jsonify({
            'error': 'Active session exists',
            'session': active_session.to_dict()
        }), 400
    
    # Verify deck ownership
    deck = Deck.query.filter_by(id=data['deck_id'], user_id=user_id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    # Create new session
    session = StudySession(
        user_id=user_id,
        deck_id=data['deck_id']
    )
    
    try:
        db.session.add(session)
        db.session.commit()
        return jsonify({
            'message': 'Session started',
            'session': session.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@study_bp.route('/session/end', methods=['POST'])
@jwt_required()
@rate_limit(max_requests=10, window_seconds=60, per_user=True)
def end_session():
    """
    End current study session
    
    Returns:
        - 200: Session ended successfully
        - 404: No active session found
    """
    user_id = get_current_user_id()
    
    session = StudySession.query.filter_by(
        user_id=user_id,
        end_time=None
    ).order_by(StudySession.start_time.desc()).first()
    
    if not session:
        return jsonify({'error': 'No active session found'}), 404
    
    session.end_session()
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Session ended',
            'session': session.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

