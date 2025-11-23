"""
Cloze deletion card service.

Handles parsing, validation, and generation of cloze deletion cards.
Cloze syntax: {{c1::hidden text::hint}} or {{c1::hidden text}}
"""
import re
from typing import Dict, Any, List, Optional, Tuple
from app.models.card import Card, CardType


class ClozeCardService:
    """Service for handling cloze deletion cards"""
    
    # Cloze pattern: {{c1::text::hint}} or {{c1::text}}
    CLOZE_PATTERN = re.compile(r'\{\{c(\d+)::([^:}]+)(?:::(.+?))?\}\}')
    
    @staticmethod
    def parse_cloze_text(text: str) -> List[Dict[str, Any]]:
        """
        Parse cloze text and extract all deletions.
        
        Args:
            text: Text containing cloze deletions
        
        Returns:
            List of cloze deletion dictionaries with:
            - index: Cloze number (c1, c2, etc.)
            - text: Hidden text
            - hint: Optional hint text
            - position: Character position in original text
        """
        deletions = []
        matches = ClozeCardService.CLOZE_PATTERN.finditer(text)
        
        for match in matches:
            cloze_num = int(match.group(1))
            hidden_text = match.group(2)
            hint = match.group(3) if match.group(3) else None
            
            deletions.append({
                'index': cloze_num,
                'text': hidden_text,
                'hint': hint,
                'position': match.start(),
                'full_match': match.group(0)
            })
        
        return deletions
    
    @staticmethod
    def validate_cloze_syntax(text: str) -> Tuple[bool, Optional[str]]:
        """
        Validate cloze syntax in text.
        
        Args:
            text: Text to validate
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not text:
            return False, "Text cannot be empty"
        
        # Check for unclosed cloze markers
        open_count = text.count('{{')
        close_count = text.count('}}')
        
        if open_count != close_count:
            return False, "Unclosed cloze markers detected"
        
        # Check for valid cloze patterns
        matches = ClozeCardService.CLOZE_PATTERN.findall(text)
        if not matches:
            return False, "No valid cloze deletions found"
        
        # Check for nested cloze markers (not supported)
        if '{{' in text and '}}' in text:
            # Simple check for nested markers
            text_copy = text
            while '{{' in text_copy and '}}' in text_copy:
                start = text_copy.find('{{')
                end = text_copy.find('}}', start)
                if end == -1:
                    break
                inner = text_copy[start+2:end]
                if '{{' in inner:
                    return False, "Nested cloze markers are not supported"
                text_copy = text_copy[end+2:]
        
        return True, None
    
    @staticmethod
    def generate_card_views(card: Card) -> List[Dict[str, Any]]:
        """
        Generate multiple card views from a single cloze card.
        Each deletion becomes a separate reviewable card.
        
        Args:
            card: Cloze card instance
        
        Returns:
            List of card view dictionaries, each representing one cloze deletion
        """
        if card.card_type != CardType.CLOZE:
            return []
        
        deletions = ClozeCardService.parse_cloze_text(card.front_content)
        
        if not deletions:
            return []
        
        views = []
        for deletion in deletions:
            # Create view with this deletion hidden
            view_text = ClozeCardService.CLOZE_PATTERN.sub(
                lambda m: f"[...]" if int(m.group(1)) == deletion['index'] else m.group(2),
                card.front_content
            )
            
            views.append({
                'cloze_index': deletion['index'],
                'front': view_text,
                'back': deletion['text'],
                'hint': deletion.get('hint'),
                'full_text': card.front_content
            })
        
        return views
    
    @staticmethod
    def render_cloze_text(text: str, show_index: Optional[int] = None) -> str:
        """
        Render cloze text with specified deletion shown or all hidden.
        
        Args:
            text: Cloze text
            show_index: If provided, show this cloze index; otherwise hide all
        
        Returns:
            Rendered HTML/text with deletions shown/hidden
        """
        if show_index is None:
            # Hide all deletions
            return ClozeCardService.CLOZE_PATTERN.sub(
                lambda m: f"[...]",
                text
            )
        else:
            # Show only the specified deletion
            def replace_func(m):
                if int(m.group(1)) == show_index:
                    return m.group(2)  # Show the text
                else:
                    return "[...]"  # Hide others
            
            return ClozeCardService.CLOZE_PATTERN.sub(replace_func, text)
    
    @staticmethod
    def extract_cloze_data(card: Card) -> Dict[str, Any]:
        """
        Extract and structure cloze data from a card.
        
        Args:
            card: Cloze card instance
        
        Returns:
            Dictionary with cloze metadata
        """
        deletions = ClozeCardService.parse_cloze_text(card.front_content)
        
        return {
            'total_deletions': len(deletions),
            'deletions': deletions,
            'cloze_numbers': sorted(set(d['index'] for d in deletions))
        }

