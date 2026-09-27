from datetime import date, timedelta
from flask import Blueprint, jsonify
from app.models import db, Book, Student, Transaction, Fine, Category, ActivityLog
from app.services.library_service import sync_overdue_transactions
from app.utils.auth_helper import token_required

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/stats", methods=["GET"])
@token_required
def get_dashboard_stats(current_user):
    sync_overdue_transactions()

    # Base KPIs
    total_books_titles = Book.query.count()
    total_book_copies = db.session.query(db.func.sum(Book.total_copies)).scalar() or 0
    available_copies = db.session.query(db.func.sum(Book.available_copies)).scalar() or 0
    issued_count = Transaction.query.filter(Transaction.status.in_(["borrowed", "overdue"])).count()
    total_students = Student.query.count()
    overdue_count = Transaction.query.filter(Transaction.status == "overdue").count()
    total_fines_unpaid = db.session.query(db.func.sum(Fine.amount)).filter(Fine.status == "pending").scalar() or 0.0

    # Monthly Trends (last 6 months)
    today = date.today()
    monthly_trends = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for i in range(5, -1, -1):
        # Calculate target year and month
        month_idx = (today.month - 1 - i) % 12
        year_offset = (today.month - 1 - i) // 12
        target_year = today.year + year_offset
        target_month = month_idx + 1

        issued_in_month = Transaction.query.filter(
            db.extract("year", Transaction.issue_date) == target_year,
            db.extract("month", Transaction.issue_date) == target_month
        ).count()

        returned_in_month = Transaction.query.filter(
            Transaction.return_date.isnot(None),
            db.extract("year", Transaction.return_date) == target_year,
            db.extract("month", Transaction.return_date) == target_month
        ).count()

        monthly_trends.append({
            "month": f"{month_names[month_idx]} {str(target_year)[2:]}",
            "issued": issued_in_month,
            "returned": returned_in_month
        })

    # Category Distribution
    categories = Category.query.all()
    category_data = []
    for cat in categories:
        count = len(cat.books)
        if count > 0:
            category_data.append({
                "name": cat.name,
                "count": count,
                "color": cat.color_code or "#2563EB"
            })

    # Popular Books (top 5 by total borrowings)
    popular_books_query = db.session.query(
        Book, db.func.count(Transaction.id).label("borrow_count")
    ).join(Transaction, Transaction.book_id == Book.id, isouter=True)\
     .group_by(Book.id)\
     .order_by(db.desc("borrow_count"))\
     .limit(5).all()

    popular_books = []
    for book, count in popular_books_query:
        b_dict = book.to_dict()
        b_dict["borrow_count"] = count
        popular_books.append(b_dict)

    # Recent Transactions (latest 6)
    recent_txs = Transaction.query.order_by(Transaction.created_at.desc()).limit(6).all()

    # Overdue list
    overdue_txs = Transaction.query.filter(Transaction.status == "overdue").order_by(Transaction.due_date.asc()).limit(6).all()

    # Recent Activity logs
    recent_logs = ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(8).all()

    # Student-specific dashboard stats if role is student
    student_stats = None
    if current_user.role == "student" and current_user.student_profile:
        s = current_user.student_profile
        my_active = Transaction.query.filter(
            Transaction.student_id == s.id,
            Transaction.status.in_(["borrowed", "overdue"])
        ).all()
        my_fines = Fine.query.filter_by(student_id=s.id, status="pending").all()
        student_stats = {
            "currently_borrowed": len(my_active),
            "max_limit": s.max_borrow_limit,
            "total_borrowed_history": len(s.transactions),
            "unpaid_fines": sum(f.amount for f in my_fines),
            "active_loans": [t.to_dict() for t in my_active]
        }

    return jsonify({
        "kpis": {
            "total_titles": total_books_titles,
            "total_copies": total_book_copies,
            "available_copies": available_copies,
            "issued_books": issued_count,
            "total_students": total_students,
            "overdue_books": overdue_count,
            "total_fines_unpaid": float(total_fines_unpaid),
            "utilization_rate": round((issued_count / total_book_copies * 100), 1) if total_book_copies > 0 else 0
        },
        "monthly_trends": monthly_trends,
        "category_distribution": category_data,
        "popular_books": popular_books,
        "recent_transactions": [t.to_dict() for t in recent_txs],
        "overdue_transactions": [t.to_dict() for t in overdue_txs],
        "recent_activity": [log.to_dict() for log in recent_logs],
        "student_stats": student_stats
    }), 200
