"""
Card import/export service for bulk operations.

Supports importing/exporting cards in various formats (JSON, CSV, Anki format).
"""
from typing import Dict, Any, List, Optional
from app.models.card import Card, CardType
from app.models.deck import Deck
from app import db
import csv
import io
import json


class CardImportExportService:
    """Service for importing and exporting cards"""
    
    @staticmethod
    def export_deck_to_json(deck_id: int) -> Dict[str, Any]:
        """
        Export deck cards to JSON format.
        
        Args:
            deck_id: Deck ID to export
        
        Returns:
            Dictionary with deck and cards data
        """
        deck = Deck.query.get(deck_id)
        if not deck:
            raise ValueError(f"Deck {deck_id} not found")
        
        cards = Card.query.filter_by(deck_id=deck_id).all()
        
        return {
            'deck': {
                'title': deck.title,
                'description': deck.description,
                'tags': deck.tags
            },
            'cards': [card.to_dict() for card in cards],
            'total_cards': len(cards)
        }
    
    @staticmethod
    def import_cards_from_json(deck_id: int, json_data: Dict[str, Any], user_id: int) -> List[Card]:
        """
        Import cards from JSON format.
        
        Args:
            deck_id: Deck ID to import into
            json_data: JSON data with cards array
            user_id: User ID for validation
        
        Returns:
            List of created Card instances
        """
        # Verify deck ownership
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            raise ValueError("Deck not found or access denied")
        
        cards_data = json_data.get('cards', [])
        created_cards = []
        
        for card_data in cards_data:
            card = Card(
                deck_id=deck_id,
                front_content=card_data.get('front_content', ''),
                back_content=card_data.get('back_content', ''),
                card_type=CardType[card_data.get('card_type', 'basic').upper()],
                media_attachments=card_data.get('media_attachments', []),
                card_data=card_data.get('card_data', {})
            )
            
            # Validate card
            is_valid, error_msg = card.validate()
            if not is_valid:
                continue  # Skip invalid cards
            
            db.session.add(card)
            created_cards.append(card)
        
        db.session.commit()
        return created_cards
    
    @staticmethod
    def export_deck_to_csv(deck_id: int) -> str:
        """
        Export deck cards to CSV format.
        
        Args:
            deck_id: Deck ID to export
        
        Returns:
            CSV string
        """
        deck = Deck.query.get(deck_id)
        if not deck:
            raise ValueError(f"Deck {deck_id} not found")
        
        cards = Card.query.filter_by(deck_id=deck_id).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Front', 'Back', 'Type', 'Media Attachments'])
        
        # Write cards
        for card in cards:
            media_str = json.dumps(card.media_attachments) if card.media_attachments else ''
            writer.writerow([
                card.front_content,
                card.back_content,
                card.card_type.value,
                media_str
            ])
        
        return output.getvalue()
    
    @staticmethod
    def import_cards_from_csv(deck_id: int, csv_content: str, user_id: int) -> List[Card]:
        """
        Import cards from CSV format.
        
        Args:
            deck_id: Deck ID to import into
            csv_content: CSV content string
            user_id: User ID for validation
        
        Returns:
            List of created Card instances
        """
        # Verify deck ownership
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            raise ValueError("Deck not found or access denied")
        
        reader = csv.reader(io.StringIO(csv_content))
        header = next(reader, None)  # Skip header
        
        created_cards = []
        
        for row in reader:
            if len(row) < 2:
                continue
            
            front = row[0].strip()
            back = row[1].strip()
            card_type = CardType[row[2].strip().upper()] if len(row) > 2 and row[2].strip() else CardType.BASIC
            
            if not front or not back:
                continue
            
            card = Card(
                deck_id=deck_id,
                front_content=front,
                back_content=back,
                card_type=card_type
            )
            
            # Parse media attachments if provided
            if len(row) > 3 and row[3].strip():
                try:
                    card.media_attachments = json.loads(row[3])
                except:
                    pass
            
            db.session.add(card)
            created_cards.append(card)
        
        db.session.commit()
        return created_cards
    
    @staticmethod
    def export_to_anki_format(deck_id: int) -> List[Dict[str, Any]]:
        """
        Export cards to Anki-compatible format.
        
        Args:
            deck_id: Deck ID to export
        
        Returns:
            List of Anki-format card dictionaries
        """
        cards = Card.query.filter_by(deck_id=deck_id).all()
        
        anki_cards = []
        for card in cards:
            anki_card = {
                'Front': card.front_content,
                'Back': card.back_content,
                'Tags': ' '.join(card.deck.tags) if card.deck.tags else ''
            }
            
            # Add card type specific data
            if card.card_type == CardType.CLOZE:
                anki_card['Cloze'] = card.front_content
            elif card.card_type == CardType.IMAGE_OCCLUSION:
                card_data = card.card_data or {}
                anki_card['Image'] = card_data.get('image', {}).get('url', '')
            
            anki_cards.append(anki_card)
        
        return anki_cards

