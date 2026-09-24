import urllib.request
import json
from app import create_app
from app.models import db, User

app = create_app()

with app.app_context():
    user = User.query.filter_by(email="admin@smartlib.io").first()
    if user:
        print(f"User in DB: {user.email}, password check: {user.check_password('adminpassword')}")
    else:
        print("User NOT found in DB!")

try:
    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/auth/login",
        data=json.dumps({"email": "admin@smartlib.io", "password": "adminpassword"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        print(f"HTTP Server response: {response.status}, {response.read().decode('utf-8')}")
except Exception as e:
    print(f"HTTP Server test failed: {e}")
