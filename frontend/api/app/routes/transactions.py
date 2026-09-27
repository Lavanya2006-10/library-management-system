from datetime import datetime, date
from flask import Blueprint, request, jsonify
from app.models import db, Transaction, Student, Book
from app.services.library_service import issue_book, return_book, sync_overdue_transactions
from app.utils.auth_helper import token_required, roles_accepted

transactions_bp = Blueprint("transactions", __name__)

@transactions_bp.route("", methods=["GET"])
@token_required
def get_transactions(current_user):
    sync_overdue_transactions()

    query = Transaction.query

    # Student role restriction
    if current_user.role == "student":
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({"transactions": [], "total": 0}), 200
        query = query.filter(Transaction.student_id == student.id)
    else:
        student_id = request.args.get("student_id")
        if student_id:
            query = query.filter(Transaction.student_id == student_id)

    status = request.args.get("status")
    if status and status != "all":
        query = query.filter(Transaction.status == status)

    book_id = request.args.get("book_id")
    if book_id:
        query = query.filter(Transaction.book_id == book_id)

    date_from = request.args.get("date_from")
    if date_from:
        try:
            d_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            query = query.filter(Transaction.issue_date >= d_from)
        except ValueError:
            pass

    date_to = request.args.get("date_to")
    if date_to:
        try:
            d_to = datetime.strptime(date_to, "%Y-%m-%d").date()
            query = query.filter(Transaction.issue_date <= d_to)
        except ValueError:
            pass

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 15))

    query = query.order_by(Transaction.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "transactions": [t.to_dict() for t in pagination.items],
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages,
        "per_page": per_page
    }), 200

@transactions_bp.route("/active-loans", methods=["GET"])
@token_required
def get_active_loans(current_user):
    sync_overdue_transactions()
    query = Transaction.query.filter(Transaction.status.in_(["borrowed", "overdue"]))

    if current_user.role == "student":
        student = Student.query.filter_by(user_id=current_user.id).first()
        if not student:
            return jsonify({"active_loans": []}), 200
        query = query.filter(Transaction.student_id == student.id)

    loans = query.order_by(Transaction.due_date.asc()).all()
    return jsonify({"active_loans": [t.to_dict() for t in loans]}), 200

@transactions_bp.route("/issue", methods=["POST"])
@token_required
@roles_accepted("admin", "librarian")
def handle_issue_book(current_user):
    data = request.get_json() or {}
    student_id = data.get("student_id")
    book_id = data.get("book_id")
    due_date_str = data.get("due_date")
    notes = data.get("notes")

    if not student_id or not book_id:
        return jsonify({"error": "Student and Book selection are required"}), 400

    custom_due_date = None
    if due_date_str:
        try:
            custom_due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
            if custom_due_date <= date.today():
                return jsonify({"error": "Due date must be in the future"}), 400
        except ValueError:
            return jsonify({"error": "Invalid due date format. Use YYYY-MM-DD"}), 400

    try:
        tx = issue_book(
            student_id=student_id,
            book_id=book_id,
            issued_by_user_id=current_user.id,
            custom_due_date=custom_due_date,
            notes=notes
        )
        return jsonify({
            "message": f"Successfully issued '{tx.book.title}' to {tx.student.name}",
            "transaction": tx.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to issue book: {str(e)}"}), 500

@transactions_bp.route("/<int:id>/return", methods=["POST"])
@token_required
@roles_accepted("admin", "librarian")
def handle_return_book(current_user, id):
    data = request.get_json() or {}
    notes = data.get("notes")

    try:
        tx, fine = return_book(transaction_id=id, user_id=current_user.id, notes=notes)
        resp = {
            "message": f"Book '{tx.book.title}' returned successfully",
            "transaction": tx.to_dict(),
        }
        if fine:
            resp["fine"] = fine.to_dict()
            resp["fine_message"] = f"A late fine of ${fine.amount:.2f} was generated ({fine.late_days} days overdue)."
        return jsonify(resp), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to return book: {str(e)}"}), 500
