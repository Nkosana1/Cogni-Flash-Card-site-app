"""
Card generation services for reverse and multiple choice cards.
"""
from typing import Dict, Any, List, Optional
from app.models.card import Card, CardType
from app import db


class ReverseCardService:
    """Service for generating reverse cards automatically"""
    
    @staticmethod
    def generate_reverse_card(original_card: Card) -> Card:
        """
        Generate a reverse card from a basic card.
        
        Args:
            original_card: Original card to reverse
        
        Returns:
            New Card instance with front and back swapped
        """
        if original_card.card_type != CardType.BASIC:
            raise ValueError("Reverse cards can only be generated from basic cards")
        
        reverse_card = Card(
            deck_id=original_card.deck_id,
            front_content=original_card.back_content,
            back_content=original_card.front_content,
            card_type=CardType.REVERSE,
            card_data={
                'original_card_id': original_card.id,
                'is_reverse': True
            }
        )
        
        return reverse_card
    
    @staticmethod
    def create_reverse_pair(card: Card) -> List[Card]:
        """
        Create both original and reverse cards as a pair.
        
        Args:
            card: Original card
        
        Returns:
            List containing [original_card, reverse_card]
        """
        reverse_card = ReverseCardService.generate_reverse_card(card)
        
        # Mark original card as having a reverse
        if not card.card_data:
            card.card_data = {}
        card.card_data['has_reverse'] = True
        card.card_data['reverse_card_id'] = None  # Will be set after reverse card is saved
        
        return [card, reverse_card]


class MultipleChoiceService:
    """Service for generating multiple choice cards"""
    
    @staticmethod
    def generate_from_deck(deck_id: int, num_options: int = 4) -> List[Card]:
        """
        Generate multiple choice cards from all basic cards in a deck.
        
        Args:
            deck_id: Deck ID
            num_options: Number of answer options (default: 4)
        
        Returns:
            List of generated multiple choice cards
        """
        # Get all basic cards from deck
        basic_cards = Card.query.filter_by(
            deck_id=deck_id,
            card_type=CardType.BASIC
        ).all()
        
        if not basic_cards:
            return []
        
        # Get all possible answers
        all_answers = [card.back_content for card in basic_cards]
        
        multiple_choice_cards = []
        
        for card in basic_cards:
            # Create multiple choice version
            mc_card = Card(
                deck_id=deck_id,
                front_content=card.front_content,
                back_content=card.back_content,
                card_type=CardType.MULTIPLE_CHOICE,
                card_data={
                    'original_card_id': card.id,
                    'options': MultipleChoiceService._generate_options(
                        correct_answer=card.back_content,
                        all_answers=all_answers,
                        num_options=num_options
                    )
                }
            )
            multiple_choice_cards.append(mc_card)
        
        return multiple_choice_cards
    
    @staticmethod
    def _generate_options(correct_answer: str, all_answers: List[str], num_options: int) -> List[Dict[str, Any]]:
        """
        Generate multiple choice options.
        
        Args:
            correct_answer: The correct answer
            all_answers: All possible answers to choose distractors from
            num_options: Total number of options
        
        Returns:
            List of option dictionaries with 'text' and 'is_correct' fields
        """
        import random
        
        # Remove correct answer from pool
        distractor_pool = [a for a in all_answers if a != correct_answer]
        
        # Select random distractors
        num_distractors = min(num_options - 1, len(distractor_pool))
        distractors = random.sample(distractor_pool, num_distractors) if distractor_pool else []
        
        # Create options
        options = [{'text': correct_answer, 'is_correct': True}]
        options.extend([{'text': distractor, 'is_correct': False} for distractor in distractors])
        
        # Shuffle options
        random.shuffle(options)
        
        # Add index to each option
        for i, option in enumerate(options):
            option['index'] = i + 1
        
        return options
    
    @staticmethod
    def validate_answer(card: Card, selected_index: int) -> bool:
        """
        Validate selected answer for multiple choice card.
        
        Args:
            card: Multiple choice card
            selected_index: Index of selected option (1-based)
        
        Returns:
            True if correct, False otherwise
        """
        if card.card_type != CardType.MULTIPLE_CHOICE:
            raise ValueError("Card is not a multiple choice card")
        
        card_data = card.card_data or {}
        options = card_data.get('options', [])
        
        if selected_index < 1 or selected_index > len(options):
            return False
        
        selected_option = options[selected_index - 1]
        return selected_option.get('is_correct', False)

