"""
Rate limiting utilities
"""
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timedelta
from collections import defaultdict
import threading


# In-memory rate limit storage (use Redis in production)
_rate_limit_storage = defaultdict(list)
_rate_limit_lock = threading.Lock()


def rate_limit(max_requests: int = 60, window_seconds: int = 60, per_user: bool = False):
    """
    Rate limiting decorator.
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        per_user: If True, rate limit per user; if False, per IP
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get identifier (user ID or IP address)
            if per_user:
                try:
                    identifier = str(get_jwt_identity())
                except:
                    return jsonify({'error': 'Authentication required'}), 401
            else:
                identifier = request.remote_addr or 'unknown'
            
            now = datetime.utcnow()
            window_start = now - timedelta(seconds=window_seconds)
            
            with _rate_limit_lock:
                # Clean old entries
                _rate_limit_storage[identifier] = [
                    timestamp for timestamp in _rate_limit_storage[identifier]
                    if timestamp > window_start
                ]
                
                # Check rate limit
                if len(_rate_limit_storage[identifier]) >= max_requests:
                    return jsonify({
                        'error': 'Rate limit exceeded',
                        'message': f'Maximum {max_requests} requests per {window_seconds} seconds'
                    }), 429
                
                # Add current request
                _rate_limit_storage[identifier].append(now)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

