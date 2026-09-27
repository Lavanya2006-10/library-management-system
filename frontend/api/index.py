import os
import sys
import shutil

# Ensure the api directory is in sys.path so app, seed, etc. can be imported
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# SQLite database setup for serverless environment
# /tmp is writable in AWS Lambda / Vercel Serverless runtimes
tmp_db_path = "/tmp/library.db"
seed_db_path = os.path.join(CURRENT_DIR, "library.db")

if os.environ.get("VERCEL"):
    if not os.path.exists(tmp_db_path) and os.path.exists(seed_db_path):
        try:
            shutil.copy2(seed_db_path, tmp_db_path)
            print("Copied seed library.db to /tmp/library.db")
        except Exception as e:
            print("Warning: Failed to copy seed db to /tmp:", e)
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db_path}"

from app import create_app
from app.models import db
from seed import seed_database

flask_app = create_app()

# Auto-seed if running on cold start
with flask_app.app_context():
    try:
        db.create_all()
        seed_database()
    except Exception as e:
        print("Database initialization notice:", e)

# WSGI prefix middleware to ensure /api/* routes always resolve
class WSGIPrefixMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        if not path.startswith('/api'):
            environ['PATH_INFO'] = '/api' + path
        return self.wsgi_app(environ, start_response)

flask_app.wsgi_app = WSGIPrefixMiddleware(flask_app.wsgi_app)
app = flask_app
