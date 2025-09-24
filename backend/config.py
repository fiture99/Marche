import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:sa@localhost:5432/marche_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Upload Configuration
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH') or 16 * 1024 * 1024)  # 16MB
    
    # CORS - Add all possible development origins
    CORS_ORIGINS = [
        'http://localhost:5173', 
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
        'https://fiture99.github.io',
        'https://fiture99.github.io/Marche'
    ]
    
    # Pagination
    PRODUCTS_PER_PAGE = 20
    VENDORS_PER_PAGE = 12
    ORDERS_PER_PAGE = 10

class DevelopmentConfig(Config):
    DEBUG = True
    # Add more origins for development if needed
    CORS_ORIGINS = Config.CORS_ORIGINS + [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'https://fiture99.github.io',
        'https://fiture99.github.io/Marche'
    ]

class ProductionConfig(Config):
    DEBUG = False
    # Update with your production domain
    CORS_ORIGINS = [
        'https://fiture99.github.io',
        'https://fiture99.github.io/Marche'
    ]

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://localhost/marche_test_db'
    CORS_ORIGINS = ['http://localhost:5173']

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}