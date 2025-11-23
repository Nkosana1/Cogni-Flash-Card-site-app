"""
UserPreferences model for user-specific settings.

This model stores user preferences including daily review limits, new cards per day,
timezone, and notification settings in a one-to-one relationship with User.
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app import db
import json


class UserPreferences(db.Model):
    """
    UserPreferences model for user-specific settings.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to User (unique, indexed)
        daily_review_limit: Maximum reviews per day
        new_cards_per_day: Maximum new cards to introduce per day
        timezone: User's timezone (e.g., 'UTC', 'America/New_York')
        notification_settings: JSON object for notification preferences
    
    Relationships:
        - One-to-one with User
    """
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        unique=True,
        nullable=False,
        index=True
    )
    daily_review_limit = db.Column(db.Integer, default=100, nullable=False)
    new_cards_per_day = db.Column(db.Integer, default=20, nullable=False)
    timezone = db.Column(db.String(50), default='UTC', nullable=False)
    notification_settings = db.Column(db.JSON, default=dict, nullable=False)
    
    def validate(self) -> tuple:
        """
        Validate preferences data.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if self.daily_review_limit < 0:
            return False, "Daily review limit must be non-negative"
        
        if self.new_cards_per_day < 0:
            return False, "New cards per day must be non-negative"
        
        if not self.timezone or len(self.timezone.strip()) == 0:
            return False, "Timezone is required"
        
        if self.notification_settings and not isinstance(self.notification_settings, dict):
            return False, "Notification settings must be a dictionary"
        
        return True, None
    
    def get_notification_setting(self, key: str, default: Any = None) -> Any:
        """
        Get a notification setting value.
        
        Args:
            key: Setting key
            default: Default value if key doesn't exist
        
        Returns:
            Setting value or default
        """
        if not self.notification_settings:
            return default
        return self.notification_settings.get(key, default)
    
    def set_notification_setting(self, key: str, value: Any) -> None:
        """
        Set a notification setting value.
        
        Args:
            key: Setting key
            value: Setting value
        """
        if not self.notification_settings:
            self.notification_settings = {}
        self.notification_settings[key] = value
    
    def update_daily_limits(self, review_limit: Optional[int] = None, new_cards: Optional[int] = None) -> None:
        """
        Update daily review and new card limits.
        
        Args:
            review_limit: New daily review limit (optional)
            new_cards: New cards per day limit (optional)
        """
        if review_limit is not None:
            if review_limit < 0:
                raise ValueError("Daily review limit must be non-negative")
            self.daily_review_limit = review_limit
        
        if new_cards is not None:
            if new_cards < 0:
                raise ValueError("New cards per day must be non-negative")
            self.new_cards_per_day = new_cards
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert preferences to dictionary for API responses.
        
        Returns:
            Dictionary representation of preferences
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'daily_review_limit': self.daily_review_limit,
            'new_cards_per_day': self.new_cards_per_day,
            'timezone': self.timezone,
            'notification_settings': self.notification_settings or {}
        }
    
    @classmethod
    def create_default(cls, user_id: int) -> 'UserPreferences':
        """
        Create default preferences for a user.
        
        Args:
            user_id: User ID to create preferences for
        
        Returns:
            New UserPreferences instance with defaults
        """
        return cls(
            user_id=user_id,
            daily_review_limit=100,
            new_cards_per_day=20,
            timezone='UTC',
            notification_settings={
                'email_notifications': True,
                'push_notifications': True,
                'daily_reminder': True,
                'reminder_time': '09:00'
            }
        )
    
    def __repr__(self) -> str:
        return f'<UserPreferences user_id={self.user_id}>'
