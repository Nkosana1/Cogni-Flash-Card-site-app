"""
Pagination utilities for API endpoints
"""
from typing import Dict, Any, List
from flask import request
from sqlalchemy.orm import Query


def paginate_query(query: Query, default_per_page: int = 20, max_per_page: int = 100) -> Dict[str, Any]:
    """
    Paginate a SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query object
        default_per_page: Default items per page
        max_per_page: Maximum items per page
    
    Returns:
        Dictionary with paginated results and metadata
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', default_per_page, type=int), max_per_page)
    
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = default_per_page
    
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return {
        'items': [item.to_dict() for item in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
            'next_page': pagination.next_num if pagination.has_next else None,
            'prev_page': pagination.prev_num if pagination.has_prev else None
        }
    }


def paginate_list(items: List[Any], default_per_page: int = 20, max_per_page: int = 100) -> Dict[str, Any]:
    """
    Paginate a list of items.
    
    Args:
        items: List of items to paginate
        default_per_page: Default items per page
        max_per_page: Maximum items per page
    
    Returns:
        Dictionary with paginated results and metadata
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', default_per_page, type=int), max_per_page)
    
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = default_per_page
    
    total = len(items)
    pages = (total + per_page - 1) // per_page  # Ceiling division
    
    start = (page - 1) * per_page
    end = start + per_page
    
    paginated_items = items[start:end]
    
    return {
        'items': [item.to_dict() if hasattr(item, 'to_dict') else item for item in paginated_items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': pages,
            'has_next': end < total,
            'has_prev': page > 1,
            'next_page': page + 1 if end < total else None,
            'prev_page': page - 1 if page > 1 else None
        }
    }

