"""
Analytics endpoints
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app import db
from app.models.deck import Deck
from app.models.card import Card
from app.models.card_review import CardReview
from app.models.study_session import StudySession
from app.services.spaced_repetition import SpacedRepetitionService
from flask_jwt_extended import jwt_required
from app.utils.auth import get_current_user_id

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    """
    Get study overview statistics
    
    Returns:
        - 200: Overview statistics
    """
    user_id = get_current_user_id()
    service = SpacedRepetitionService(db.session)
    
    # Get basic stats
    stats = service.get_review_stats(user_id)
    
    # Get study sessions today
    today = datetime.utcnow().date()
    sessions_today = StudySession.query.filter(
        StudySession.user_id == user_id,
        db.func.date(StudySession.start_time) == today
    ).count()
    
    # Get total study time today (in minutes)
    sessions_today_query = StudySession.query.filter(
        StudySession.user_id == user_id,
        db.func.date(StudySession.start_time) == today,
        StudySession.end_time.isnot(None)
    )
    
    total_seconds = 0
    for session in sessions_today_query.all():
        duration = session.get_duration_seconds()
        if duration:
            total_seconds += duration
    
    total_minutes = total_seconds // 60
    
    # Get average accuracy today
    reviews_today = CardReview.query.join(Card).join(Deck).filter(
        Deck.user_id == user_id,
        CardReview.user_id == user_id,
        db.func.date(CardReview.reviewed_at) == today
    ).all()
    
    if reviews_today:
        correct_reviews = sum(1 for r in reviews_today if r.quality >= 3)
        avg_accuracy = (correct_reviews / len(reviews_today)) * 100
    else:
        avg_accuracy = 0
    
    # Get streak (consecutive days with reviews)
    streak = _calculate_streak(user_id)
    
    return jsonify({
        'total_cards': stats['total_cards'],
        'due_cards': stats['due_cards'],
        'new_cards': stats['new_cards'],
        'reviewed_today': stats['reviewed_today'],
        'sessions_today': sessions_today,
        'study_time_today_minutes': total_minutes,
        'average_accuracy_today': round(avg_accuracy, 2),
        'streak_days': streak
    }), 200


@analytics_bp.route('/deck/<int:deck_id>', methods=['GET'])
@jwt_required()
def get_deck_stats(deck_id):
    """
    Get deck-specific statistics
    
    Returns:
        - 200: Deck statistics
        - 404: Deck not found
    """
    user_id = get_current_user_id()
    
    # Verify deck ownership
    deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
    
    service = SpacedRepetitionService(db.session)
    stats = service.get_review_stats(user_id, deck_id)
    
    # Get deck-specific sessions
    sessions = StudySession.query.filter_by(
        user_id=user_id,
        deck_id=deck_id
    ).all()
    
    total_sessions = len(sessions)
    total_study_time = sum(
        s.get_duration_seconds() or 0 for s in sessions if s.end_time
    )
    
    # Get average accuracy for this deck
    reviews = CardReview.query.join(Card).filter(
        Card.deck_id == deck_id,
        CardReview.user_id == user_id
    ).all()
    
    if reviews:
        correct_reviews = sum(1 for r in reviews if r.quality >= 3)
        avg_accuracy = (correct_reviews / len(reviews)) * 100
    else:
        avg_accuracy = 0
    
    # Get cards by mastery level
    mastery_levels = {
        'new': 0,
        'learning': 0,
        'reviewing': 0,
        'mastered': 0
    }
    
    for card in deck.cards.all():
        latest_review = service.get_latest_review(card.id, user_id)
        if not latest_review:
            mastery_levels['new'] += 1
        elif latest_review.repetitions == 0:
            mastery_levels['learning'] += 1
        elif latest_review.repetitions < 3:
            mastery_levels['reviewing'] += 1
        else:
            mastery_levels['mastered'] += 1
    
    return jsonify({
        'deck_id': deck_id,
        'deck_title': deck.title,
        'total_cards': stats['total_cards'],
        'due_cards': stats['due_cards'],
        'new_cards': stats['new_cards'],
        'reviewed_today': stats['reviewed_today'],
        'total_sessions': total_sessions,
        'total_study_time_minutes': total_study_time // 60,
        'average_accuracy': round(avg_accuracy, 2),
        'mastery_levels': mastery_levels
    }), 200


@analytics_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    """
    Get user streak data
    
    Returns:
        - 200: Streak information
    """
    user_id = get_current_user_id()
    
    streak = _calculate_streak(user_id)
    
    # Get streak start date
    if streak > 0:
        # Find the earliest review in the streak
        today = datetime.utcnow().date()
        streak_start = today - timedelta(days=streak - 1)
        
        # Verify streak is continuous
        for i in range(streak):
            check_date = streak_start + timedelta(days=i)
            has_review = CardReview.query.join(Card).join(Deck).filter(
                Deck.user_id == user_id,
                CardReview.user_id == user_id,
                db.func.date(CardReview.reviewed_at) == check_date
            ).first()
            
            if not has_review:
                streak = i
                break
    else:
        streak_start = None
    
    # Get longest streak
    longest_streak = _calculate_longest_streak(user_id)
    
    return jsonify({
        'current_streak': streak,
        'streak_start_date': streak_start.isoformat() if streak_start else None,
        'longest_streak': longest_streak
    }), 200


def _calculate_streak(user_id: int) -> int:
    """Calculate current consecutive days with reviews"""
    today = datetime.utcnow().date()
    streak = 0
    
    # Check backwards from today
    for i in range(365):  # Max 1 year
        check_date = today - timedelta(days=i)
        has_review = CardReview.query.join(Card).join(Deck).filter(
            Deck.user_id == user_id,
            CardReview.user_id == user_id,
            db.func.date(CardReview.reviewed_at) == check_date
        ).first()
        
        if has_review:
            streak += 1
        else:
            break
    
    return streak


def _calculate_longest_streak(user_id: int) -> int:
    """Calculate longest streak in user's history"""
    # Get all unique review dates
    review_dates = db.session.query(
        db.func.date(CardReview.reviewed_at).label('review_date')
    ).join(Card).join(Deck).filter(
        Deck.user_id == user_id,
        CardReview.user_id == user_id
    ).distinct().order_by('review_date').all()
    
    if not review_dates:
        return 0
    
    dates = [row.review_date for row in review_dates]
    
    longest = 1
    current = 1
    
    for i in range(1, len(dates)):
        if (dates[i] - dates[i-1]).days == 1:
            current += 1
            longest = max(longest, current)
        else:
            current = 1
    
    return longest

