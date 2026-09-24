from flask import Blueprint, request, jsonify
from app.models import db, Author
from app.utils.auth_helper import token_required, roles_accepted

authors_bp = Blueprint("authors", __name__)

@authors_bp.route("", methods=["GET"])
def get_authors():
    q = request.args.get("q", "").strip().lower()
    query = Author.query
    if q:
        query = query.filter(Author.name.ilike(f"%{q}%"))
    authors = query.order_by(Author.name.asc()).all()
    return jsonify({"authors": [a.to_dict() for a in authors]}), 200

@authors_bp.route("", methods=["POST"])
@token_required
@roles_accepted("admin", "librarian")
def create_author(current_user):
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Author name is required"}), 400

    if Author.query.filter(Author.name.ilike(name)).first():
        return jsonify({"error": "Author already exists"}), 409

    author = Author(name=name, biography=data.get("biography"))
    db.session.add(author)
    db.session.commit()
    return jsonify({"message": "Author created successfully", "author": author.to_dict()}), 201

@authors_bp.route("/<int:id>", methods=["PUT"])
@token_required
@roles_accepted("admin", "librarian")
def update_author(current_user, id):
    author = Author.query.get_or_404(id)
    data = request.get_json() or {}
    if "name" in data:
        author.name = data["name"].strip()
    if "biography" in data:
        author.biography = data["biography"]
    db.session.commit()
    return jsonify({"message": "Author updated successfully", "author": author.to_dict()}), 200

@authors_bp.route("/<int:id>", methods=["DELETE"])
@token_required
@roles_accepted("admin", "librarian")
def delete_author(current_user, id):
    author = Author.query.get_or_404(id)
    if len(author.books) > 0:
        return jsonify({"error": f"Cannot delete author '{author.name}' because {len(author.books)} book(s) are assigned to them."}), 400
    db.session.delete(author)
    db.session.commit()
    return jsonify({"message": "Author deleted successfully"}), 200
