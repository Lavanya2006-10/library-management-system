import os
from app import create_app
from app.models import db
from seed import seed_database

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        # Create tables automatically
        db.create_all()
        # Seed if empty
        seed_database()

    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Smart Library API on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
