from flask import Blueprint, request, jsonify
from app.models import db, Student, User, Transaction, Fine, ActivityLog
from app.utils.auth_helper import token_required, roles_accepted

students_bp = Blueprint("students", __name__)

@students_bp.route("", methods=["GET"])
@token_required
def get_students(current_user):
    # Students can only view their own profile unless librarian/admin
    if current_user.role == "student":
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({"students": [], "total": 0}), 200
        return jsonify({
            "students": [student.to_dict()],
            "total": 1,
            "page": 1,
            "pages": 1
        }), 200

    q = request.args.get("q", "").strip().lower()
    department = request.args.get("department")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    query = Student.query

    if q:
        query = query.filter(
            (Student.name.ilike(f"%{q}%")) |
            (Student.student_id.ilike(f"%{q}%")) |
            (Student.email.ilike(f"%{q}%")) |
            (Student.department.ilike(f"%{q}%"))
        )

    if department and department != "all":
        query = query.filter(Student.department == department)

    query = query.order_by(Student.name.asc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "students": [s.to_dict() for s in pagination.items],
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages,
        "per_page": per_page
    }), 200

@students_bp.route("/<int:id>", methods=["GET"])
@token_required
def get_student(current_user, id):
    student = Student.query.get_or_404(id)

    # Authorization check for students
    if current_user.role == "student" and (not student.user_id or student.user_id != current_user.id):
        return jsonify({"error": "Unauthorized to view other students' profiles"}), 403

    data = student.to_dict()
    # Active borrowings
    active_loans = Transaction.query.filter(
        Transaction.student_id == id,
        Transaction.status.in_(["borrowed", "overdue"])
    ).order_by(Transaction.due_date.asc()).all()
    data["active_loans"] = [t.to_dict() for t in active_loans]

    # History
    history = Transaction.query.filter(
        Transaction.student_id == id,
        Transaction.status == "returned"
    ).order_by(Transaction.return_date.desc()).limit(15).all()
    data["history"] = [t.to_dict() for t in history]

    # Fines
    fines = Fine.query.filter_by(student_id=id).order_by(Fine.created_at.desc()).all()
    data["fines"] = [f.to_dict() for f in fines]

    return jsonify({"student": data}), 200

@students_bp.route("", methods=["POST"])
@token_required
@roles_accepted("admin", "librarian")
def create_student(current_user):
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    student_id = data.get("student_id", "").strip().upper()
    department = data.get("department", "Computer Science").strip()
    year = int(data.get("year", 1))
    phone = data.get("phone", "").strip()
    max_borrow_limit = int(data.get("max_borrow_limit", 3))

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    if Student.query.filter_by(email=email).first():
        return jsonify({"error": "A student with this email already exists"}), 409

    if not student_id:
        count = Student.query.count() + 1
        student_id = f"STU{202600 + count}"
    elif Student.query.filter_by(student_id=student_id).first():
        return jsonify({"error": "A student with this ID already exists"}), 409

    student = Student(
        student_id=student_id,
        name=name,
        email=email,
        phone=phone,
        department=department,
        year=year,
        max_borrow_limit=max_borrow_limit
    )
    db.session.add(student)
    db.session.flush()

    log = ActivityLog(
        user_id=current_user.id,
        action="add_student",
        entity_type="student",
        entity_id=student.id,
        details=f"Added student {name} ({student_id})"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Student created successfully", "student": student.to_dict()}), 201

@students_bp.route("/<int:id>", methods=["PUT"])
@token_required
@roles_accepted("admin", "librarian")
def update_student(current_user, id):
    student = Student.query.get_or_404(id)
    data = request.get_json() or {}

    if "name" in data:
        student.name = data["name"].strip()
    if "email" in data:
        email = data["email"].strip().lower()
        existing = Student.query.filter(Student.email == email, Student.id != id).first()
        if existing:
            return jsonify({"error": "Email is already taken by another student"}), 409
        student.email = email
    if "phone" in data:
        student.phone = data["phone"].strip()
    if "department" in data:
        student.department = data["department"].strip()
    if "year" in data:
        student.year = int(data["year"])
    if "max_borrow_limit" in data:
        student.max_borrow_limit = int(data["max_borrow_limit"])

    db.session.commit()
    return jsonify({"message": "Student updated successfully", "student": student.to_dict()}), 200

@students_bp.route("/<int:id>", methods=["DELETE"])
@token_required
@roles_accepted("admin", "librarian")
def delete_student(current_user, id):
    student = Student.query.get_or_404(id)

    if student.currently_borrowed_count > 0:
        return jsonify({"error": f"Cannot delete {student.name} because they have {student.currently_borrowed_count} actively borrowed book(s)."}), 400

    if student.outstanding_fines_total > 0:
        return jsonify({"error": f"Cannot delete {student.name} because they have outstanding unpaid fines of ${student.outstanding_fines_total:.2f}."}), 400

    name = student.name
    db.session.delete(student)

    log = ActivityLog(
        user_id=current_user.id,
        action="delete_student",
        entity_type="student",
        entity_id=id,
        details=f"Deleted student {name}"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Student '{name}' was deleted successfully"}), 200
