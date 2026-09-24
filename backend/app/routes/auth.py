from flask import Blueprint, request, jsonify
from app.models import db, User, Student, ActivityLog
from app.utils.auth_helper import generate_token, token_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user)

    # Activity log
    log = ActivityLog(user_id=user.id, action="login", details=f"User {user.email} logged in")
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student").strip().lower()
    department = data.get("department", "General Studies").strip()
    year = int(data.get("year", 1))

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if role not in ["admin", "librarian", "student"]:
        role = "student"

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    new_user = User(
        name=name,
        email=email,
        role=role,
        avatar_url=None
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.flush()

    if role == "student":
        # Generate clean student ID
        count = Student.query.count() + 1
        stu_num = f"STU{202600 + count}"
        student_profile = Student(
            student_id=stu_num,
            user_id=new_user.id,
            name=name,
            email=email,
            department=department,
            year=year,
            max_borrow_limit=3
        )
        db.session.add(student_profile)

    db.session.commit()
    token = generate_token(new_user)

    return jsonify({
        "message": "Registration successful",
        "token": token,
        "user": new_user.to_dict()
    }), 201

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user: User):
    data = current_user.to_dict()
    if current_user.student_profile:
        data["student_profile"] = current_user.student_profile.to_dict()
    return jsonify({"user": data}), 200

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user: User):
    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        current_user.name = data["name"].strip()
        if current_user.student_profile:
            current_user.student_profile.name = current_user.name
    if "avatar_url" in data:
        current_user.avatar_url = data["avatar_url"]
    if "password" in data and data["password"]:
        if len(data["password"]) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        current_user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": current_user.to_dict()}), 200

@auth_bp.route("/demo-users", methods=["GET"])
def get_demo_users():
    """Returns demo credentials for easy 1-click testing in development / viva."""
    return jsonify({
        "demo_accounts": [
            {
                "role": "Admin",
                "email": "admin@smartlib.io",
                "password": "adminpassword",
                "description": "Full access to settings, inventory, users, and audit logs."
            },
            {
                "role": "Librarian",
                "email": "librarian@smartlib.io",
                "password": "librarianpassword",
                "description": "Manage catalog, students, issue & return, and fines."
            },
            {
                "role": "Student",
                "email": "lavanyas.24it@kongu.edu",
                "password": "studentpassword",
                "description": "Information Technology (B.Tech IT) student - Browse catalog, view active loans, borrowing history, and fines."
            }
        ]
    }), 200

@auth_bp.route("/reset-demo-data", methods=["POST"])
def reset_demo_data():
    from seed import seed_database
    seed_database(force=True)
    return jsonify({"message": "Database successfully reseeded with Lavanya S and Engineering courses!"}), 200
