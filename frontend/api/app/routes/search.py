from flask import Blueprint, request, jsonify
from app.models import Book, Student, Author, Category, Transaction
from app.utils.auth_helper import token_required

search_bp = Blueprint("search", __name__)

@search_bp.route("/global", methods=["GET"])
@token_required
def global_search(current_user):
    q = request.args.get("q", "").strip()
    if not q or len(q) < 2:
        return jsonify({"results": {"books": [], "students": [], "authors": [], "categories": []}}), 200

    # Search books
    books = Book.query.join(Author).filter(
        (Book.title.ilike(f"%{q}%")) |
        (Book.isbn.ilike(f"%{q}%")) |
        (Author.name.ilike(f"%{q}%"))
    ).limit(5).all()

    # Search students (if admin or librarian)
    students = []
    if current_user.role in ["admin", "librarian"]:
        students_query = Student.query.filter(
            (Student.name.ilike(f"%{q}%")) |
            (Student.student_id.ilike(f"%{q}%")) |
            (Student.email.ilike(f"%{q}%"))
        ).limit(5).all()
        students = [s.to_dict() for s in students_query]

    # Search authors
    authors = Author.query.filter(Author.name.ilike(f"%{q}%")).limit(4).all()

    # Search categories
    categories = Category.query.filter(Category.name.ilike(f"%{q}%")).limit(4).all()

    return jsonify({
        "query": q,
        "results": {
            "books": [b.to_dict() for b in books],
            "students": students,
            "authors": [a.to_dict() for a in authors],
            "categories": [c.to_dict() for c in categories]
        }
    }), 200
