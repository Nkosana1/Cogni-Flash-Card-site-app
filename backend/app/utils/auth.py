"""
Authentication utilities
"""
from flask_jwt_extended import get_jwt_identity


def get_current_user_id():
    """
    Get current authenticated user ID as integer.
    
    JWT identity is stored as string, but we need integer for database queries.
    
    Returns:
        int: User ID
    """
    return int(get_jwt_identity())

