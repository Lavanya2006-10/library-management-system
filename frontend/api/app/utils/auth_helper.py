import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from app.models.user import User

def generate_token(user: User) -> str:
    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]

        # Support query parameter fallback for direct downloads or links
        if not token:
            token = request.args.get("token")

        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"error": "User no longer exists"}), 401

        return f(current_user=user, *args, **kwargs)
    return decorated

def roles_accepted(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user: User, *args, **kwargs):
            if current_user.role not in roles:
                return jsonify({"error": f"Unauthorized access. Required roles: {list(roles)}"}), 403
            return f(current_user=current_user, *args, **kwargs)
        return decorated_function
    return decorator
