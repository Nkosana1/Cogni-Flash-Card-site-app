"""
Marshmallow schemas for request validation
"""
from app.schemas.auth import RegisterSchema, LoginSchema
from app.schemas.deck import DeckCreateSchema, DeckUpdateSchema
from app.schemas.card import CardCreateSchema, CardUpdateSchema, CardBatchSchema
from app.schemas.study import ReviewSchema, StudySessionStartSchema

__all__ = [
    'RegisterSchema',
    'LoginSchema',
    'DeckCreateSchema',
    'DeckUpdateSchema',
    'CardCreateSchema',
    'CardUpdateSchema',
    'CardBatchSchema',
    'ReviewSchema',
    'StudySessionStartSchema'
]

