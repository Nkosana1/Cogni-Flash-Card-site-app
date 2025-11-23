"""
Unit tests for database models
"""
import pytest
from app import create_app, db
from app.models.user import User
from app.models.deck import Deck
from app.models.card import Card


@pytest.fixture
def app():
    """Create test application"""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def user(app):
    """Create test user"""
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass')
    db.session.add(user)
    db.session.commit()
    return user


def test_user_creation(app, user):
    """Test user creation and password hashing"""
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    assert user.check_password('testpass')
    assert not user.check_password('wrongpass')


def test_deck_creation(app, user):
    """Test deck creation"""
    deck = Deck(name='Test Deck', description='Test', user_id=user.id)
    db.session.add(deck)
    db.session.commit()
    
    assert deck.name == 'Test Deck'
    assert deck.user_id == user.id
    assert deck in user.decks.all()


def test_card_creation(app, user):
    """Test card creation"""
    deck = Deck(name='Test Deck', user_id=user.id)
    db.session.add(deck)
    db.session.commit()
    
    card = Card(front='Question', back='Answer', deck_id=deck.id)
    db.session.add(card)
    db.session.commit()
    
    assert card.front == 'Question'
    assert card.back == 'Answer'
    assert card.deck_id == deck.id
    assert card.ease_factor == 2.5  # Default value
    assert card.interval == 1  # Default value

