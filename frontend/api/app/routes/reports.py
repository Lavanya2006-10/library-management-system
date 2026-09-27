import io
import csv
from flask import Blueprint, request, jsonify, Response
from app.models import db, Book, Student, Transaction, Fine, Category
from app.utils.auth_helper import token_required, roles_accepted

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/summary", methods=["GET"])
@token_required
@roles_accepted("admin", "librarian")
def get_reports_summary(current_user):
    total_books = Book.query.count()
    borrowed_books = Transaction.query.filter(Transaction.status.in_(["borrowed", "overdue"])).count()
    returned_books = Transaction.query.filter_by(status="returned").count()
    overdue_books = Transaction.query.filter_by(status="overdue").count()
    total_students = Student.query.count()
    total_fines_collected = db.session.query(db.func.sum(Fine.amount)).filter(Fine.status == "paid").scalar() or 0.0
    pending_fines = db.session.query(db.func.sum(Fine.amount)).filter(Fine.status == "pending").scalar() or 0.0

    return jsonify({
        "total_books": total_books,
        "borrowed_books": borrowed_books,
        "returned_books": returned_books,
        "overdue_books": overdue_books,
        "total_students": total_students,
        "fines_collected": float(total_fines_collected),
        "pending_fines": float(pending_fines)
    }), 200

@reports_bp.route("/export-csv", methods=["GET"])
@token_required
@roles_accepted("admin", "librarian")
def export_csv(current_user):
    report_type = request.args.get("type", "books") # books, transactions, fines, students

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "books":
        writer.writerow(["ID", "ISBN", "Title", "Author", "Category", "Total Copies", "Available Copies", "Shelf Location", "Status"])
        for b in Book.query.all():
            writer.writerow([
                b.id, b.isbn, b.title,
                b.author.name if b.author else "Unknown",
                b.category.name if b.category else "Uncategorized",
                b.total_copies, b.available_copies, b.shelf_location, b.status
            ])
        filename = "library_books_inventory.csv"

    elif report_type == "transactions":
        writer.writerow(["Transaction ID", "Student ID", "Student Name", "Book Title", "ISBN", "Issue Date", "Due Date", "Return Date", "Status", "Late Days"])
        for t in Transaction.query.order_by(Transaction.created_at.desc()).all():
            writer.writerow([
                t.id,
                t.student.student_id if t.student else "",
                t.student.name if t.student else "",
                t.book.title if t.book else "",
                t.book.isbn if t.book else "",
                t.issue_date.isoformat() if t.issue_date else "",
                t.due_date.isoformat() if t.due_date else "",
                t.return_date.isoformat() if t.return_date else "",
                t.status,
                t.calculate_late_days()
            ])
        filename = "library_transactions.csv"

    elif report_type == "fines":
        writer.writerow(["Fine ID", "Student ID", "Student Name", "Book Title", "Late Days", "Amount ($)", "Status", "Payment Date", "Payment Method"])
        for f in Fine.query.order_by(Fine.created_at.desc()).all():
            writer.writerow([
                f.id,
                f.student.student_id if f.student else "",
                f.student.name if f.student else "",
                f.transaction.book.title if f.transaction and f.transaction.book else "",
                f.late_days,
                f.amount,
                f.status,
                f.payment_date.isoformat() if f.payment_date else "",
                f.payment_method or ""
            ])
        filename = "library_fines_report.csv"

    else: # students
        writer.writerow(["ID", "Student Number", "Name", "Email", "Department", "Year", "Active Loans", "Max Limit"])
        for s in Student.query.all():
            writer.writerow([
                s.id, s.student_id, s.name, s.email, s.department, s.year,
                s.currently_borrowed_count, s.max_borrow_limit
            ])
        filename = "library_students_list.csv"

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename={filename}"}
    )
