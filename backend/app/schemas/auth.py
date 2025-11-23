"""
Authentication request schemas
"""
from marshmallow import Schema, fields, validate, ValidationError


class RegisterSchema(Schema):
    """Schema for user registration"""
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6, max=128))


class LoginSchema(Schema):
    """Schema for user login"""
    username = fields.Str(required=True)
    password = fields.Str(required=True)

