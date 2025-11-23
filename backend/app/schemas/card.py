"""
Card request schemas
"""
from marshmallow import Schema, fields, validate
from app.models.card import CardType


class CardCreateSchema(Schema):
    """Schema for creating a card"""
    front_content = fields.Str(required=True, validate=validate.Length(min=1))
    back_content = fields.Str(required=True, validate=validate.Length(min=1))
    card_type = fields.Str(missing='basic', validate=validate.OneOf(['basic', 'cloze', 'image_occlusion']))
    media_attachments = fields.List(fields.Dict(), missing=list)


class CardUpdateSchema(Schema):
    """Schema for updating a card"""
    front_content = fields.Str(validate=validate.Length(min=1))
    back_content = fields.Str(validate=validate.Length(min=1))
    card_type = fields.Str(validate=validate.OneOf(['basic', 'cloze', 'image_occlusion']))
    media_attachments = fields.List(fields.Dict())


class CardBatchItemSchema(Schema):
    """Schema for a single card in batch creation"""
    front_content = fields.Str(required=True, validate=validate.Length(min=1))
    back_content = fields.Str(required=True, validate=validate.Length(min=1))
    card_type = fields.Str(missing='basic', validate=validate.OneOf(['basic', 'cloze', 'image_occlusion']))


class CardBatchSchema(Schema):
    """Schema for batch card creation"""
    deck_id = fields.Int(required=True)
    cards = fields.List(fields.Nested(CardBatchItemSchema), required=True, validate=validate.Length(min=1, max=100))

