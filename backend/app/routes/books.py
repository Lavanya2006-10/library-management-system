from flask import Blueprint, request, jsonify
from app.models import db, Book, Author, Category, Transaction, ActivityLog
from app.utils.auth_helper import token_required, roles_accepted

books_bp = Blueprint("books", __name__)

@books_bp.route("", methods=["GET"])
def get_books():
    q = request.args.get("q", "").strip().lower()
    category_id = request.args.get("category_id")
    status = request.args.get("status")
    sort_by = request.args.get("sort_by", "title_asc")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 12))

    query = Book.query

    if q:
        query = query.join(Author).filter(
            (Book.title.ilike(f"%{q}%")) |
            (Book.isbn.ilike(f"%{q}%")) |
            (Author.name.ilike(f"%{q}%")) |
            (Book.publisher.ilike(f"%{q}%"))
        )

    if category_id:
        query = query.filter(Book.category_id == category_id)

    if status and status != "all":
        query = query.filter(Book.status == status)

    # Sorting
    if sort_by == "title_asc":
        query = query.order_by(Book.title.asc())
    elif sort_by == "title_desc":
        query = query.order_by(Book.title.desc())
    elif sort_by == "year_desc":
        query = query.order_by(Book.publication_year.desc().nullslast())
    elif sort_by == "copies_desc":
        query = query.order_by(Book.available_copies.desc())
    elif sort_by == "newest":
        query = query.order_by(Book.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "books": [b.to_dict() for b in pagination.items],
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages,
        "per_page": per_page
    }), 200

@books_bp.route("/<int:id>", methods=["GET"])
def get_book(id):
    book = Book.query.get_or_404(id)
    data = book.to_dict()
    # Include recent borrowing history
    history = Transaction.query.filter_by(book_id=id).order_by(Transaction.created_at.desc()).limit(10).all()
    data["history"] = [t.to_dict() for t in history]
    return jsonify({"book": data}), 200

@books_bp.route("", methods=["POST"])
@token_required
@roles_accepted("admin", "librarian")
def create_book(current_user):
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    isbn = data.get("isbn", "").strip()
    author_name = data.get("author_name", "").strip()
    category_name = data.get("category_name", "").strip()
    total_copies = int(data.get("total_copies", 1))

    if not title or not isbn or not author_name or not category_name:
        return jsonify({"error": "Title, ISBN, Author, and Category are required"}), 400

    if Book.query.filter_by(isbn=isbn).first():
        return jsonify({"error": "A book with this ISBN already exists"}), 409

    # Find or create author
    author = Author.query.filter(Author.name.ilike(author_name)).first()
    if not author:
        author = Author(name=author_name)
        db.session.add(author)
        db.session.flush()

    # Find or create category
    category = Category.query.filter(Category.name.ilike(category_name)).first()
    if not category:
        category = Category(name=category_name, color_code="#2563EB")
        db.session.add(category)
        db.session.flush()

    book = Book(
        isbn=isbn,
        title=title,
        author_id=author.id,
        category_id=category.id,
        publisher=data.get("publisher"),
        publication_year=data.get("publication_year"),
        description=data.get("description"),
        cover_url=data.get("cover_url") or "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
        total_copies=total_copies,
        available_copies=total_copies,
        shelf_location=data.get("shelf_location", "Main Stacks A-1"),
        status="available" if total_copies > 0 else "unavailable"
    )
    db.session.add(book)
    db.session.flush()

    # Activity log
    log = ActivityLog(
        user_id=current_user.id,
        action="add_book",
        entity_type="book",
        entity_id=book.id,
        details=f"Added new book '{book.title}' (ISBN: {book.isbn}) with {total_copies} copies"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Book created successfully", "book": book.to_dict()}), 201

@books_bp.route("/<int:id>", methods=["PUT"])
@token_required
@roles_accepted("admin", "librarian")
def update_book(current_user, id):
    book = Book.query.get_or_404(id)
    data = request.get_json() or {}

    if "title" in data:
        book.title = data["title"].strip()
    if "isbn" in data:
        isbn = data["isbn"].strip()
        existing = Book.query.filter(Book.isbn == isbn, Book.id != id).first()
        if existing:
            return jsonify({"error": "ISBN is already used by another book"}), 409
        book.isbn = isbn
    if "author_name" in data:
        author = Author.query.filter(Author.name.ilike(data["author_name"].strip())).first()
        if not author:
            author = Author(name=data["author_name"].strip())
            db.session.add(author)
            db.session.flush()
        book.author_id = author.id
    if "category_name" in data:
        category = Category.query.filter(Category.name.ilike(data["category_name"].strip())).first()
        if not category:
            category = Category(name=data["category_name"].strip())
            db.session.add(category)
            db.session.flush()
        book.category_id = category.id

    if "publisher" in data:
        book.publisher = data["publisher"]
    if "publication_year" in data:
        book.publication_year = data["publication_year"]
    if "description" in data:
        book.description = data["description"]
    if "cover_url" in data:
        book.cover_url = data["cover_url"]
    if "shelf_location" in data:
        book.shelf_location = data["shelf_location"]

    if "total_copies" in data:
        new_total = int(data["total_copies"])
        diff = new_total - book.total_copies
        book.total_copies = new_total
        book.available_copies = max(0, book.available_copies + diff)
        book.sync_status()

    # Activity log
    log = ActivityLog(
        user_id=current_user.id,
        action="update_book",
        entity_type="book",
        entity_id=book.id,
        details=f"Updated book details for '{book.title}'"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Book updated successfully", "book": book.to_dict()}), 200

@books_bp.route("/<int:id>", methods=["DELETE"])
@token_required
@roles_accepted("admin", "librarian")
def delete_book(current_user, id):
    book = Book.query.get_or_404(id)

    # Check for active borrowings
    active_tx = Transaction.query.filter(
        Transaction.book_id == id,
        Transaction.status.in_(["borrowed", "overdue"])
    ).first()

    if active_tx:
        return jsonify({"error": f"Cannot delete '{book.title}' because it has active borrowed copies. Please return them first."}), 400

    title = book.title
    db.session.delete(book)

    log = ActivityLog(
        user_id=current_user.id,
        action="delete_book",
        entity_type="book",
        entity_id=id,
        details=f"Deleted book '{title}'"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": f"Book '{title}' was deleted successfully"}), 200
