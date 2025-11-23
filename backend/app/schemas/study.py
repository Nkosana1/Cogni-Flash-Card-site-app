"""
Study session request schemas
"""
from marshmallow import Schema, fields, validate


class ReviewSchema(Schema):
    """Schema for submitting a card review"""
    card_id = fields.Int(required=True)
    quality = fields.Int(required=True, validate=validate.Range(min=0, max=5))


class StudySessionStartSchema(Schema):
    """Schema for starting a study session"""
    deck_id = fields.Int(required=True)

