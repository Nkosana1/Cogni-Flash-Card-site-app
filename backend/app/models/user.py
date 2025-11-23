"""
User model for authentication and user management.

This model represents users in the spaced repetition system with authentication,
settings, and relationships to decks, study sessions, and preferences.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
import json


class User(db.Model):
    """
    User model for authentication and user management.
    
    Attributes:
        id: Primary key
        email: Unique email address (indexed)
        username: Unique username (indexed)
        password_hash: Hashed password using bcrypt
        created_at: Account creation timestamp
        last_login: Last login timestamp
        settings_json: JSON field for flexible user settings
    
    Relationships:
        - One-to-one with UserPreferences
        - One-to-many with Deck
        - One-to-many with StudySession
        - One-to-many with CardReview
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    settings_json = db.Column(db.JSON, default=dict, nullable=False)
    
    # Relationships
    preferences = db.relationship(
        'UserPreferences',
        backref='user',
        uselist=False,
        cascade='all, delete-orphan'
    )
    decks = db.relationship(
        'Deck',
        backref='owner',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    study_sessions = db.relationship(
        'StudySession',
        backref='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    card_reviews = db.relationship(
        'CardReview',
        backref='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    def set_password(self, password: str) -> None:
        """
        Hash and set user password.
        
        Args:
            password: Plain text password to hash
        """
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """
        Verify password against stored hash.
        
        Args:
            password: Plain text password to verify
        
        Returns:
            True if password matches, False otherwise
        """
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self) -> None:
        """Update last login timestamp to current time."""
        self.last_login = datetime.utcnow()
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """
        Get a setting value from settings_json.
        
        Args:
            key: Setting key
            default: Default value if key doesn't exist
        
        Returns:
            Setting value or default
        """
        if not self.settings_json:
            return default
        return self.settings_json.get(key, default)
    
    def set_setting(self, key: str, value: Any) -> None:
        """
        Set a setting value in settings_json.
        
        Args:
            key: Setting key
            value: Setting value
        """
        if not self.settings_json:
            self.settings_json = {}
        self.settings_json[key] = value
    
    def validate(self) -> tuple:
        """
        Validate user data.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not self.email or '@' not in self.email:
            return False, "Invalid email address"
        
        if not self.username or len(self.username) < 3:
            return False, "Username must be at least 3 characters"
        
        if not self.password_hash:
            return False, "Password is required"
        
        return True, None
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """
        Convert user to dictionary for API responses.
        
        Args:
            include_sensitive: Whether to include sensitive information
        
        Returns:
            Dictionary representation of user
        """
        data = {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'settings': self.settings_json or {}
        }
        
        if include_sensitive:
            data['preferences'] = self.preferences.to_dict() if self.preferences else None
        
        return data
    
    def __repr__(self) -> str:
        return f'<User {self.username} ({self.email})>'
