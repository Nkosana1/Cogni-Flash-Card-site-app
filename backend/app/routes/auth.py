"""
Authentication endpoints
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.models.user_preferences import UserPreferences
from app.schemas.auth import RegisterSchema, LoginSchema
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_refresh_token,
    set_refresh_cookies,
    unset_refresh_cookies
)
from app.utils.auth import get_current_user_id
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Request body:
        - username: string (3-80 chars)
        - email: valid email
        - password: string (min 6 chars)
    
    Returns:
        - 201: User created successfully
        - 400: Validation error or user exists
    """
    schema = RegisterSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        # Create default preferences
        preferences = UserPreferences.create_default(user.id)
        db.session.add(preferences)
        
        db.session.commit()
        
        # Generate tokens (identity must be a string)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        response = jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token
        })
        
        # Set refresh token as HTTP-only cookie
        set_refresh_cookies(response, refresh_token)
        
        return response, 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT token
    
    Request body:
        - username: string
        - password: string
    
    Returns:
        - 200: Login successful
        - 401: Invalid credentials
    """
    schema = LoginSchema()
    
    try:
        data = schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'messages': err.messages}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Update last login
    user.update_last_login()
    db.session.commit()
    
    # Generate tokens (identity must be a string)
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    response = jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    })
    
    # Set refresh token as HTTP-only cookie
    set_refresh_cookies(response, refresh_token)
    
    return response, 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (revoke refresh token)
    
    Returns:
        - 200: Logout successful
    """
    # In a production system, you would add the token to a blacklist
    # For now, we just unset the refresh cookie
    response = jsonify({'message': 'Logout successful'})
    unset_refresh_cookies(response)
    
    return response, 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current authenticated user
    
    Returns:
        - 200: User data
        - 404: User not found
    """
    user_id = get_current_user_id()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict(include_sensitive=True)
    
    return jsonify(user_data), 200
