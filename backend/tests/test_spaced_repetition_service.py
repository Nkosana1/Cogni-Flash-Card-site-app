"""
Comprehensive unit tests for SpacedRepetitionService and SM-2 algorithm.

Tests cover:
- Algorithm accuracy and edge cases
- Service methods (process_review, get_due_cards, get_study_queue)
- Quality rating validation
- Database integration
- User preferences integration
"""
import pytest
from datetime import datetime, timedelta
from app import create_app, db
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.models.deck import Deck
from app.models.card import Card, CardType
from app.models.card_review import CardReview
from app.services.spaced_repetition import SpacedRepetitionService, calculate_sm2


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
    """Create test user with preferences"""
    user = User(username='testuser', email='test@example.com')
    user.set_password('testpass')
    db.session.add(user)
    db.session.commit()
    
    # Create default preferences
    prefs = UserPreferences.create_default(user.id)
    db.session.add(prefs)
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
    card = Card(
        front_content='Question',
        back_content='Answer',
        deck_id=deck.id,
        card_type=CardType.BASIC
    )
    db.session.add(card)
    db.session.commit()
    return card


@pytest.fixture
def service(app):
    """Create SpacedRepetitionService instance"""
    return SpacedRepetitionService(db.session)


class TestCalculateSM2:
    """Tests for the core SM-2 algorithm calculation"""
    
    def test_quality_0_again_resets(self):
        """Quality 0 (Again) should reset repetitions and interval"""
        result = calculate_sm2(quality=0, ease_factor=2.5, interval=10, repetitions=5)
        
        assert result['repetitions'] == 0
        assert result['interval'] == 1
        assert result['ease_factor'] < 2.5  # Ease factor should decrease
    
    def test_quality_1_hard_resets(self):
        """Quality 1 (Hard) should reset repetitions and interval"""
        result = calculate_sm2(quality=1, ease_factor=2.5, interval=10, repetitions=5)
        
        assert result['repetitions'] == 0
        assert result['interval'] == 1
        assert result['ease_factor'] < 2.5
    
    def test_quality_2_good_resets(self):
        """Quality 2 (Good) should reset repetitions and interval"""
        result = calculate_sm2(quality=2, ease_factor=2.5, interval=10, repetitions=5)
        
        assert result['repetitions'] == 0
        assert result['interval'] == 1
        assert result['ease_factor'] < 2.5
    
    def test_quality_3_easy_first_review(self):
        """Quality 3 (Easy) on first review should set interval to 1"""
        result = calculate_sm2(quality=3, ease_factor=2.5, interval=1, repetitions=0)
        
        assert result['repetitions'] == 1
        assert result['interval'] == 1
        assert result['ease_factor'] > 2.5
    
    def test_quality_3_easy_second_review(self):
        """Quality 3 (Easy) on second review should set interval to 6"""
        result = calculate_sm2(quality=3, ease_factor=2.6, interval=1, repetitions=1)
        
        assert result['repetitions'] == 2
        assert result['interval'] == 6
        assert result['ease_factor'] > 2.6
    
    def test_quality_3_easy_third_review(self):
        """Quality 3 (Easy) on third review should multiply interval by ease factor"""
        result = calculate_sm2(quality=3, ease_factor=2.6, interval=6, repetitions=2)
        
        assert result['repetitions'] == 3
        assert result['interval'] == round(6 * 2.6)  # Should be 16
        assert result['ease_factor'] > 2.6
    
    def test_quality_4_very_easy_increases_ease(self):
        """Quality 4 (Very Easy) should significantly increase ease factor"""
        result = calculate_sm2(quality=4, ease_factor=2.5, interval=1, repetitions=0)
        
        assert result['repetitions'] == 1
        assert result['interval'] == 1
        assert result['ease_factor'] > 2.5
    
    def test_quality_5_perfect_increases_ease_most(self):
        """Quality 5 (Perfect) should increase ease factor the most"""
        result = calculate_sm2(quality=5, ease_factor=2.5, interval=1, repetitions=0)
        
        assert result['repetitions'] == 1
        assert result['interval'] == 1
        assert result['ease_factor'] > 2.5
        
        # Quality 5 should increase ease more than quality 4
        result4 = calculate_sm2(quality=4, ease_factor=2.5, interval=1, repetitions=0)
        assert result['ease_factor'] > result4['ease_factor']
    
    def test_ease_factor_minimum_1_3(self):
        """Ease factor should never go below 1.3"""
        # Even with very poor quality, ease factor should be at least 1.3
        result = calculate_sm2(quality=0, ease_factor=1.3, interval=1, repetitions=0)
        
        assert result['ease_factor'] >= 1.3
    
    def test_ease_factor_decreases_on_poor_quality(self):
        """Poor quality should decrease ease factor"""
        result = calculate_sm2(quality=0, ease_factor=2.5, interval=10, repetitions=5)
        
        assert result['ease_factor'] < 2.5
    
    def test_ease_factor_increases_on_good_quality(self):
        """Good quality should increase ease factor"""
        result = calculate_sm2(quality=5, ease_factor=2.5, interval=10, repetitions=5)
        
        assert result['ease_factor'] > 2.5
    
    def test_interval_rounding(self):
        """Interval should be rounded when calculated"""
        result = calculate_sm2(quality=3, ease_factor=2.5, interval=6, repetitions=2)
        
        # interval = round(6 * 2.5) = round(15.0) = 15
        assert result['interval'] == 15
        assert isinstance(result['interval'], int)
    
    def test_next_review_date(self):
        """Next review date should be calculated correctly"""
        result = calculate_sm2(quality=3, ease_factor=2.5, interval=6, repetitions=1)
        
        assert 'next_review' in result
        assert isinstance(result['next_review'], datetime)
        
        # Should be approximately 6 days from now
        expected_date = datetime.utcnow() + timedelta(days=6)
        time_diff = abs((result['next_review'] - expected_date).total_seconds())
        assert time_diff < 60  # Within 1 minute
    
    def test_invalid_quality_negative(self):
        """Should raise ValueError for negative quality"""
        with pytest.raises(ValueError, match="Quality must be between 0 and 5"):
            calculate_sm2(quality=-1, ease_factor=2.5, interval=1, repetitions=0)
    
    def test_invalid_quality_too_high(self):
        """Should raise ValueError for quality > 5"""
        with pytest.raises(ValueError, match="Quality must be between 0 and 5"):
            calculate_sm2(quality=6, ease_factor=2.5, interval=1, repetitions=0)
    
    def test_algorithm_consistency(self):
        """Test algorithm produces consistent results for same inputs"""
        result1 = calculate_sm2(quality=4, ease_factor=2.5, interval=6, repetitions=2)
        result2 = calculate_sm2(quality=4, ease_factor=2.5, interval=6, repetitions=2)
        
        assert result1 == result2


class TestSpacedRepetitionService:
    """Tests for SpacedRepetitionService methods"""
    
    def test_process_review_first_review(self, service, card, user):
        """Test processing first review of a card"""
        result = service.process_review(card_id=card.id, user_id=user.id, quality=4)
        
        assert result['card_id'] == card.id
        assert result['user_id'] == user.id
        assert result['quality'] == 4
        assert 'review_id' in result
        assert result['repetitions'] == 1
        assert result['interval'] == 1
        assert result['ease_factor'] > 2.5
        
        # Verify review was saved
        review = CardReview.query.get(result['review_id'])
        assert review is not None
        assert review.quality == 4
    
    def test_process_review_second_review(self, service, card, user):
        """Test processing second review"""
        # First review
        service.process_review(card_id=card.id, user_id=user.id, quality=4)
        
        # Second review
        result = service.process_review(card_id=card.id, user_id=user.id, quality=4)
        
        assert result['repetitions'] == 2
        assert result['interval'] == 6
    
    def test_process_review_failed_recall(self, service, card, user):
        """Test processing failed recall (quality < 3)"""
        # First review with good quality
        service.process_review(card_id=card.id, user_id=user.id, quality=4)
        
        # Second review with failed recall
        result = service.process_review(card_id=card.id, user_id=user.id, quality=0)
        
        assert result['repetitions'] == 0
        assert result['interval'] == 1
    
    def test_process_review_invalid_quality(self, service, card, user):
        """Test processing review with invalid quality"""
        with pytest.raises(ValueError):
            service.process_review(card_id=card.id, user_id=user.id, quality=6)
        
        with pytest.raises(ValueError):
            service.process_review(card_id=card.id, user_id=user.id, quality=-1)
    
    def test_process_review_card_not_found(self, service, user):
        """Test processing review for non-existent card"""
        with pytest.raises(ValueError, match="not found"):
            service.process_review(card_id=99999, user_id=user.id, quality=4)
    
    def test_get_due_cards_new_cards(self, service, user, deck):
        """Test getting due cards includes new cards"""
        # Create cards
        card1 = Card(front_content='Q1', back_content='A1', deck_id=deck.id)
        card2 = Card(front_content='Q2', back_content='A2', deck_id=deck.id)
        db.session.add_all([card1, card2])
        db.session.commit()
        
        due_cards = service.get_due_cards(user_id=user.id)
        
        assert len(due_cards) == 2
        assert card1 in due_cards
        assert card2 in due_cards
    
    def test_get_due_cards_with_reviews(self, service, user, deck, card):
        """Test getting due cards with existing reviews"""
        # Create review with next_review in the past
        review = CardReview(
            card_id=card.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=1,
            repetitions=1,
            next_review=datetime.utcnow() - timedelta(days=1)  # Overdue
        )
        db.session.add(review)
        db.session.commit()
        
        due_cards = service.get_due_cards(user_id=user.id)
        
        assert len(due_cards) >= 1
        assert card in due_cards
    
    def test_get_due_cards_not_due(self, service, user, deck, card):
        """Test cards not due are not returned"""
        # Create review with next_review in the future
        review = CardReview(
            card_id=card.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=10,
            repetitions=3,
            next_review=datetime.utcnow() + timedelta(days=10)  # Not due
        )
        db.session.add(review)
        db.session.commit()
        
        due_cards = service.get_due_cards(user_id=user.id)
        
        assert card not in due_cards
    
    def test_get_due_cards_deck_filter(self, service, user):
        """Test filtering due cards by deck"""
        deck1 = Deck(name='Deck 1', user_id=user.id)
        deck2 = Deck(name='Deck 2', user_id=user.id)
        db.session.add_all([deck1, deck2])
        db.session.commit()
        
        card1 = Card(front_content='Q1', back_content='A1', deck_id=deck1.id)
        card2 = Card(front_content='Q2', back_content='A2', deck_id=deck2.id)
        db.session.add_all([card1, card2])
        db.session.commit()
        
        due_cards = service.get_due_cards(user_id=user.id, deck_id=deck1.id)
        
        assert len(due_cards) == 1
        assert card1 in due_cards
        assert card2 not in due_cards
    
    def test_get_due_cards_limit(self, service, user, deck):
        """Test limiting number of due cards"""
        # Create 10 cards
        cards = [
            Card(front_content=f'Q{i}', back_content=f'A{i}', deck_id=deck.id)
            for i in range(10)
        ]
        db.session.add_all(cards)
        db.session.commit()
        
        due_cards = service.get_due_cards(user_id=user.id, limit=5)
        
        assert len(due_cards) == 5
    
    def test_get_due_cards_priority_ordering(self, service, user, deck):
        """Test due cards are ordered by priority (overdue first)"""
        card1 = Card(front_content='Q1', back_content='A1', deck_id=deck.id)
        card2 = Card(front_content='Q2', back_content='A2', deck_id=deck.id)
        card3 = Card(front_content='Q3', back_content='A3', deck_id=deck.id)
        db.session.add_all([card1, card2, card3])
        db.session.commit()
        
        # Card1: overdue by 3 days
        review1 = CardReview(
            card_id=card1.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=1,
            repetitions=1,
            next_review=datetime.utcnow() - timedelta(days=3)
        )
        # Card2: due today
        review2 = CardReview(
            card_id=card2.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=1,
            repetitions=1,
            next_review=datetime.utcnow()
        )
        # Card3: new card (no review)
        db.session.add_all([review1, review2])
        db.session.commit()
        
        due_cards = service.get_due_cards(user_id=user.id)
        
        # Card1 (most overdue) should come first
        assert due_cards[0].id == card1.id
        # Card2 (due today) should come second
        assert due_cards[1].id == card2.id
        # Card3 (new) should come last
        assert card3 in due_cards
    
    def test_get_study_queue(self, service, user, deck):
        """Test getting study queue with due and new cards"""
        # Create cards
        card1 = Card(front_content='Q1', back_content='A1', deck_id=deck.id)
        card2 = Card(front_content='Q2', back_content='A2', deck_id=deck.id)
        db.session.add_all([card1, card2])
        db.session.commit()
        
        # Create review for card1 (making it due)
        review = CardReview(
            card_id=card1.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=1,
            repetitions=1,
            next_review=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(review)
        db.session.commit()
        
        queue = service.get_study_queue(user_id=user.id)
        
        assert 'due_cards' in queue
        assert 'new_cards' in queue
        assert 'total_cards' in queue
        assert queue['due_count'] == 1
        assert queue['new_count'] == 1
        assert queue['total_cards'] == 2
    
    def test_get_study_queue_respects_new_cards_limit(self, service, user, deck):
        """Test study queue respects new_cards_per_day limit"""
        # Update user preferences
        prefs = UserPreferences.query.filter_by(user_id=user.id).first()
        prefs.new_cards_per_day = 2
        db.session.commit()
        
        # Create 5 new cards
        cards = [
            Card(front_content=f'Q{i}', back_content=f'A{i}', deck_id=deck.id)
            for i in range(5)
        ]
        db.session.add_all(cards)
        db.session.commit()
        
        queue = service.get_study_queue(user_id=user.id)
        
        assert queue['new_count'] == 2
        assert len(queue['new_cards']) == 2
    
    def test_get_latest_review(self, service, user, card):
        """Test getting latest review for a card"""
        # Create multiple reviews
        review1 = CardReview(
            card_id=card.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=1,
            repetitions=1,
            reviewed_at=datetime.utcnow() - timedelta(days=2)
        )
        review2 = CardReview(
            card_id=card.id,
            user_id=user.id,
            quality=5,
            ease_factor=2.6,
            interval=6,
            repetitions=2,
            reviewed_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add_all([review1, review2])
        db.session.commit()
        
        latest = service.get_latest_review(card.id, user.id)
        
        assert latest is not None
        assert latest.id == review2.id
        assert latest.quality == 5
    
    def test_get_latest_review_none(self, service, user, card):
        """Test getting latest review when none exists"""
        latest = service.get_latest_review(card.id, user.id)
        
        assert latest is None
    
    def test_get_review_stats(self, service, user, deck, card):
        """Test getting review statistics"""
        # Create review
        review = CardReview(
            card_id=card.id,
            user_id=user.id,
            quality=4,
            ease_factor=2.5,
            interval=1,
            repetitions=1,
            reviewed_at=datetime.utcnow()
        )
        db.session.add(review)
        db.session.commit()
        
        stats = service.get_review_stats(user_id=user.id)
        
        assert 'total_cards' in stats
        assert 'due_cards' in stats
        assert 'reviewed_today' in stats
        assert 'cards_with_reviews' in stats
        assert 'new_cards' in stats
        assert stats['total_cards'] == 1
        assert stats['cards_with_reviews'] == 1
        assert stats['new_cards'] == 0


class TestEdgeCases:
    """Tests for edge cases and boundary conditions"""
    
    def test_rapid_successive_reviews(self, service, user, card):
        """Test rapid successive reviews don't break algorithm"""
        # Process multiple reviews quickly
        for quality in [4, 4, 5, 4]:
            result = service.process_review(card.id, user.id, quality)
            assert result['repetitions'] > 0
            assert result['interval'] > 0
    
    def test_extreme_ease_factor_values(self, service, user, card):
        """Test algorithm handles extreme ease factor values"""
        # Start with very low ease factor
        result = service.process_review(card.id, user.id, quality=5)
        assert result['ease_factor'] >= 1.3
        
        # Process many perfect reviews to increase ease factor
        for _ in range(10):
            service.process_review(card.id, user.id, quality=5)
        
        latest = service.get_latest_review(card.id, user.id)
        assert latest.ease_factor >= 1.3
    
    def test_alternating_quality_scores(self, service, user, card):
        """Test alternating good and bad quality scores"""
        qualities = [4, 0, 4, 0, 4]
        
        for quality in qualities:
            result = service.process_review(card.id, user.id, quality)
            if quality < 3:
                assert result['repetitions'] == 0
                assert result['interval'] == 1
            else:
                assert result['repetitions'] > 0
    
    def test_all_quality_levels(self, service, user, card):
        """Test all quality levels (0-5) work correctly"""
        for quality in range(6):
            result = service.process_review(card.id, user.id, quality)
            assert 'ease_factor' in result
            assert 'interval' in result
            assert 'repetitions' in result
            assert result['ease_factor'] >= 1.3
            assert result['interval'] >= 1
            assert result['repetitions'] >= 0

