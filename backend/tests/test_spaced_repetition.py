"""
Unit tests for spaced repetition algorithm
"""
import pytest
from datetime import datetime, timedelta
from app import create_app, db
from app.models.user import User
from app.models.deck import Deck
from app.models.card import Card
from app.services.spaced_repetition import SpacedRepetitionService


@pytest.fixture
def app():
    """Create test application"""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def user(app):
    """Create test user"""
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass')
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def deck(app, user):
    """Create test deck"""
    deck = Deck(name='Test Deck', user_id=user.id)
    db.session.add(deck)
    db.session.commit()
    return deck


@pytest.fixture
def card(app, deck):
    """Create test card"""
    card = Card(front='Question', back='Answer', deck_id=deck.id)
    db.session.add(card)
    db.session.commit()
    return card


def test_sm2_quality_less_than_3(app, card):
    """Test SM-2 algorithm with quality < 3 (reset)"""
    result = SpacedRepetitionService.calculate_next_review(card, quality=2)
    
    assert card.repetitions == 0
    assert card.interval == 1
    assert result['repetitions'] == 0
    assert result['interval'] == 1


def test_sm2_first_review(app, card):
    """Test SM-2 algorithm for first successful review"""
    result = SpacedRepetitionService.calculate_next_review(card, quality=4)
    
    assert card.repetitions == 1
    assert card.interval == 1
    assert result['repetitions'] == 1
    assert result['interval'] == 1


def test_sm2_second_review(app, card):
    """Test SM-2 algorithm for second review"""
    # First review
    SpacedRepetitionService.calculate_next_review(card, quality=4)
    db.session.commit()
    
    # Second review
    result = SpacedRepetitionService.calculate_next_review(card, quality=4)
    
    assert card.repetitions == 2
    assert card.interval == 6
    assert result['repetitions'] == 2
    assert result['interval'] == 6


def test_sm2_ease_factor_adjustment(app, card):
    """Test ease factor adjustment based on quality"""
    initial_ef = card.ease_factor
    
    # Good review (quality 4)
    SpacedRepetitionService.calculate_next_review(card, quality=4)
    ef_after_good = card.ease_factor
    assert ef_after_good > initial_ef
    
    # Easy review (quality 5)
    SpacedRepetitionService.calculate_next_review(card, quality=5)
    ef_after_easy = card.ease_factor
    assert ef_after_easy > ef_after_good
    
    # Hard review (quality 3)
    SpacedRepetitionService.calculate_next_review(card, quality=3)
    ef_after_hard = card.ease_factor
    assert ef_after_hard < ef_after_easy


def test_get_due_cards(app, user, deck):
    """Test getting due cards"""
    # Create cards with different next_review dates
    card1 = Card(front='Q1', back='A1', deck_id=deck.id, next_review=datetime.utcnow() - timedelta(days=1))
    card2 = Card(front='Q2', back='A2', deck_id=deck.id, next_review=datetime.utcnow() + timedelta(days=1))
    db.session.add_all([card1, card2])
    db.session.commit()
    
    due_cards = SpacedRepetitionService.get_due_cards(user.id).all()
    
    assert len(due_cards) == 1
    assert due_cards[0].id == card1.id

