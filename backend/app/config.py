import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-library-super-secret-key-2026-prod")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-super-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # SQLite default fallback with full MySQL support via DATABASE_URL
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(BASE_DIR, 'library.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Library Business Rule Defaults
    DEFAULT_BORROW_DAYS = int(os.environ.get("DEFAULT_BORROW_DAYS", 14))
    DEFAULT_FINE_PER_DAY = float(os.environ.get("DEFAULT_FINE_PER_DAY", 1.50))
    DEFAULT_MAX_BORROW_LIMIT = int(os.environ.get("DEFAULT_MAX_BORROW_LIMIT", 3))
    LIBRARY_NAME = os.environ.get("LIBRARY_NAME", "Nexus Smart Library")
