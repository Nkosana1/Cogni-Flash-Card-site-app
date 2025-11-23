"""
Card template system for custom styling and formatting.

Templates allow custom HTML/CSS rendering of cards.
"""
from typing import Dict, Any, Optional
from app.models.card import Card, CardType
import re


class CardTemplate:
    """Template for rendering cards with custom styling"""
    
    def __init__(self, front_template: str, back_template: str, css_style: str = ""):
        """
        Initialize card template.
        
        Args:
            front_template: HTML template for front side (supports {{variable}} syntax)
            back_template: HTML template for back side
            css_style: CSS styles for the template
        """
        self.front_template = front_template
        self.back_template = back_template
        self.css_style = css_style
    
    def render_card(self, card: Card, card_data: Optional[Dict[str, Any]] = None) -> Dict[str, str]:
        """
        Render card using template.
        
        Args:
            card: Card instance
            card_data: Additional card data for rendering
        
        Returns:
            Dictionary with 'front' and 'back' HTML strings
        """
        if card_data is None:
            card_data = {}
        
        # Prepare template variables
        variables = {
            'front_content': card.front_content,
            'back_content': card.back_content,
            'card_type': card.card_type.value,
            'card_id': card.id,
            **card_data
        }
        
        # Render front
        front_html = self._render_template(self.front_template, variables)
        
        # Render back
        back_html = self._render_template(self.back_template, variables)
        
        return {
            'front': front_html,
            'back': back_html,
            'style': self.css_style
        }
    
    def _render_template(self, template: str, variables: Dict[str, Any]) -> str:
        """
        Render template with variables.
        
        Args:
            template: Template string with {{variable}} placeholders
            variables: Dictionary of variable values
        
        Returns:
            Rendered HTML string
        """
        result = template
        
        # Replace {{variable}} with values
        for key, value in variables.items():
            placeholder = f'{{{{{key}}}}}'
            result = result.replace(placeholder, str(value))
        
        return result


class DefaultCardTemplates:
    """Default templates for each card type"""
    
    @staticmethod
    def get_basic_template() -> CardTemplate:
        """Get default template for basic cards"""
        return CardTemplate(
            front_template='<div class="card-front">{{front_content}}</div>',
            back_template='<div class="card-back">{{back_content}}</div>',
            css_style="""
                .card-front, .card-back {
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: white;
                    min-height: 200px;
                }
            """
        )
    
    @staticmethod
    def get_cloze_template() -> CardTemplate:
        """Get default template for cloze cards"""
        return CardTemplate(
            front_template='<div class="cloze-card">{{front_content}}</div>',
            back_template='<div class="cloze-answer">{{back_content}}</div>',
            css_style="""
                .cloze-card {
                    padding: 20px;
                    font-size: 18px;
                }
                .cloze-answer {
                    padding: 20px;
                    background: #f0f8ff;
                    border-left: 4px solid #3B82F6;
                }
            """
        )
    
    @staticmethod
    def get_image_occlusion_template() -> CardTemplate:
        """Get default template for image occlusion cards"""
        return CardTemplate(
            front_template='''
                <div class="image-occlusion-card">
                    <img src="{{image_url}}" style="max-width: 100%; height: auto;">
                    <div class="occlusion-overlay"></div>
                </div>
            ''',
            back_template='''
                <div class="image-occlusion-answer">
                    <img src="{{image_url}}" style="max-width: 100%; height: auto;">
                    <div class="label">{{label}}</div>
                </div>
            ''',
            css_style="""
                .image-occlusion-card {
                    position: relative;
                }
                .occlusion-overlay {
                    position: absolute;
                    background: rgba(0,0,0,0.7);
                }
            """
        )
    
    @staticmethod
    def get_template_for_card_type(card_type: CardType) -> CardTemplate:
        """
        Get appropriate template for card type.
        
        Args:
            card_type: Card type enum
        
        Returns:
            CardTemplate instance
        """
        templates = {
            CardType.BASIC: DefaultCardTemplates.get_basic_template(),
            CardType.CLOZE: DefaultCardTemplates.get_cloze_template(),
            CardType.IMAGE_OCCLUSION: DefaultCardTemplates.get_image_occlusion_template(),
        }
        
        return templates.get(card_type, DefaultCardTemplates.get_basic_template())


class CardTemplateService:
    """Service for managing card templates"""
    
    @staticmethod
    def render_card_html(card: Card, template: Optional[CardTemplate] = None) -> Dict[str, str]:
        """
        Render card as HTML using template.
        
        Args:
            card: Card instance
            template: Optional custom template (uses default if not provided)
        
        Returns:
            Dictionary with 'front', 'back', and 'style' HTML/CSS
        """
        if template is None:
            template = DefaultCardTemplates.get_template_for_card_type(card.card_type)
        
        # Get card-specific data
        card_data = card.card_data or {}
        
        return template.render_card(card, card_data)
    
    @staticmethod
    def create_custom_template(front_html: str, back_html: str, css: str = "") -> CardTemplate:
        """
        Create a custom card template.
        
        Args:
            front_html: HTML template for front
            back_html: HTML template for back
            css: CSS styles
        
        Returns:
            CardTemplate instance
        """
        return CardTemplate(front_html, back_html, css)

