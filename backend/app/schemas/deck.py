"""
Deck request schemas
"""
from marshmallow import Schema, fields, validate


class DeckCreateSchema(Schema):
    """Schema for creating a deck"""
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(allow_none=True, validate=validate.Length(max=1000))
    is_public = fields.Bool(load_default=False)
    tags = fields.List(fields.Str(), load_default=list)
    color = fields.Str(load_default='#3B82F6', validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))


class DeckUpdateSchema(Schema):
    """Schema for updating a deck"""
    title = fields.Str(validate=validate.Length(min=1, max=200))
    description = fields.Str(allow_none=True, validate=validate.Length(max=1000))
    is_public = fields.Bool()
    tags = fields.List(fields.Str())
    color = fields.Str(validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))

