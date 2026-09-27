from datetime import date
from flask import Blueprint, request, jsonify
from app.models import db, Fine, Student, ActivityLog
from app.utils.auth_helper import token_required, roles_accepted

fines_bp = Blueprint("fines", __name__)

@fines_bp.route("", methods=["GET"])
@token_required
def get_fines(current_user):
    query = Fine.query

    if current_user.role == "student":
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({"fines": [], "total": 0}), 200
        query = query.filter(Fine.student_id == student.id)
    else:
        student_id = request.args.get("student_id")
        if student_id:
            query = query.filter(Fine.student_id == student_id)

    status = request.args.get("status")
    if status and status != "all":
        query = query.filter(Fine.status == status)

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 15))

    query = query.order_by(Fine.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    total_unpaid = db.session.query(db.func.sum(Fine.amount)).filter(Fine.status == "pending").scalar() or 0.0

    return jsonify({
        "fines": [f.to_dict() for f in pagination.items],
        "total": pagination.total,
        "total_unpaid_sum": float(total_unpaid),
        "page": page,
        "pages": pagination.pages,
        "per_page": per_page
    }), 200

@fines_bp.route("/<int:id>/pay", methods=["PUT"])
@token_required
@roles_accepted("admin", "librarian")
def pay_fine(current_user, id):
    fine = Fine.query.get_or_404(id)
    if fine.status == "paid":
        return jsonify({"error": "This fine has already been paid"}), 400

    data = request.get_json() or {}
    fine.status = "paid"
    fine.payment_date = date.today()
    fine.payment_method = data.get("payment_method", "cash")
    if data.get("notes"):
        fine.notes = (fine.notes + "\n" + data["notes"]) if fine.notes else data["notes"]

    log = ActivityLog(
        user_id=current_user.id,
        action="pay_fine",
        entity_type="fine",
        entity_id=fine.id,
        details=f"Fine of ${fine.amount:.2f} marked as paid for student {fine.student.name} via {fine.payment_method}"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Fine payment recorded successfully", "fine": fine.to_dict()}), 200

@fines_bp.route("/<int:id>/waive", methods=["PUT"])
@token_required
@roles_accepted("admin", "librarian")
def waive_fine(current_user, id):
    fine = Fine.query.get_or_404(id)
    if fine.status != "pending":
        return jsonify({"error": f"Cannot waive fine with status '{fine.status}'"}), 400

    data = request.get_json() or {}
    reason = data.get("reason", "Waived by librarian/admin")
    fine.status = "waived"
    fine.payment_date = date.today()
    fine.payment_method = "waived"
    fine.notes = (fine.notes + f"\nReason: {reason}") if fine.notes else f"Reason: {reason}"

    log = ActivityLog(
        user_id=current_user.id,
        action="waive_fine",
        entity_type="fine",
        entity_id=fine.id,
        details=f"Fine of ${fine.amount:.2f} waived for student {fine.student.name}. Reason: {reason}"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Fine waived successfully", "fine": fine.to_dict()}), 200
