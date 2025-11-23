import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user:password@localhost:5432/neuroflash'
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)))
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'
    # Use SQLite for easier local development (no PostgreSQL setup required)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///neuroflash_dev.db'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

