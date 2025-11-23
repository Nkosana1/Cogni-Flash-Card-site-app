"""
Image occlusion card service.

Handles processing and generation of image occlusion cards where
specific regions of images are hidden for learning.
"""
from typing import Dict, Any, List, Optional, Tuple
from app.models.card import Card, CardType
import base64
import json


class ImageOcclusionService:
    """Service for handling image occlusion cards"""
    
    @staticmethod
    def process_image_upload(image_data: Dict[str, Any], regions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process image upload with occlusion regions.
        
        Args:
            image_data: Dictionary with image information
                - url: Image URL
                - width: Image width in pixels
                - height: Image height in pixels
            regions: List of region dictionaries
                - x: X coordinate (0-1 normalized)
                - y: Y coordinate (0-1 normalized)
                - width: Width (0-1 normalized)
                - height: Height (0-1 normalized)
                - label: Label for the region
                - hint: Optional hint text
        
        Returns:
            Dictionary with processed image and region data
        """
        processed_regions = []
        
        for i, region in enumerate(regions):
            processed_region = {
                'id': i + 1,
                'x': float(region.get('x', 0)),
                'y': float(region.get('y', 0)),
                'width': float(region.get('width', 0)),
                'height': float(region.get('height', 0)),
                'label': region.get('label', f'Region {i + 1}'),
                'hint': region.get('hint')
            }
            
            # Validate coordinates
            if not (0 <= processed_region['x'] <= 1 and 
                    0 <= processed_region['y'] <= 1 and
                    0 < processed_region['width'] <= 1 and
                    0 < processed_region['height'] <= 1):
                raise ValueError(f"Invalid region coordinates: {processed_region}")
            
            processed_regions.append(processed_region)
        
        return {
            'image': image_data,
            'regions': processed_regions,
            'total_regions': len(processed_regions)
        }
    
    @staticmethod
    def get_occluded_image(card: Card, region_index: Optional[int] = None) -> Dict[str, Any]:
        """
        Get image with specific region occluded.
        
        Args:
            card: Image occlusion card instance
            region_index: Index of region to occlude (None = all regions)
        
        Returns:
            Dictionary with image data and occlusion information
        """
        if card.card_type != CardType.IMAGE_OCCLUSION:
            raise ValueError("Card is not an image occlusion card")
        
        card_data = card.card_data or {}
        image_data = card_data.get('image', {})
        regions = card_data.get('regions', [])
        
        if region_index is None:
            # Return all regions as occluded
            occluded_regions = regions
        else:
            # Return only the specified region as occluded
            occluded_regions = [
                r for r in regions if r.get('id') == region_index
            ]
        
        return {
            'image_url': image_data.get('url'),
            'image_width': image_data.get('width'),
            'image_height': image_data.get('height'),
            'occluded_regions': occluded_regions,
            'all_regions': regions
        }
    
    @staticmethod
    def generate_card_views(card: Card) -> List[Dict[str, Any]]:
        """
        Generate multiple card views from a single image occlusion card.
        Each region becomes a separate reviewable card.
        
        Args:
            card: Image occlusion card instance
        
        Returns:
            List of card view dictionaries, each representing one occluded region
        """
        if card.card_type != CardType.IMAGE_OCCLUSION:
            return []
        
        card_data = card.card_data or {}
        regions = card_data.get('regions', [])
        
        views = []
        for region in regions:
            views.append({
                'region_id': region.get('id'),
                'region_label': region.get('label'),
                'front': {
                    'image_url': card_data.get('image', {}).get('url'),
                    'occluded_region': region
                },
                'back': {
                    'label': region.get('label'),
                    'hint': region.get('hint')
                }
            })
        
        return views
    
    @staticmethod
    def validate_occlusion_data(card_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validate image occlusion card data.
        
        Args:
            card_data: Card data dictionary
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if 'image' not in card_data:
            return False, "Image data is required"
        
        image = card_data['image']
        if 'url' not in image:
            return False, "Image URL is required"
        
        if 'regions' not in card_data:
            return False, "At least one occlusion region is required"
        
        regions = card_data['regions']
        if not isinstance(regions, list) or len(regions) == 0:
            return False, "At least one occlusion region is required"
        
        for i, region in enumerate(regions):
            required_fields = ['x', 'y', 'width', 'height', 'label']
            for field in required_fields:
                if field not in region:
                    return False, f"Region {i+1} missing required field: {field}"
            
            # Validate coordinates are in range [0, 1]
            coords = ['x', 'y', 'width', 'height']
            for coord in coords:
                value = region[coord]
                if not isinstance(value, (int, float)) or not (0 <= value <= 1):
                    return False, f"Region {i+1} has invalid {coord} value: {value}"
        
        return True, None

