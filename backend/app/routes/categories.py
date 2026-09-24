from flask import Blueprint, request, jsonify
from app.models import db, Category
from app.utils.auth_helper import token_required, roles_accepted

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({"categories": [c.to_dict() for c in categories]}), 200

@categories_bp.route("", methods=["POST"])
@token_required
@roles_accepted("admin", "librarian")
def create_category(current_user):
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Category name is required"}), 400

    if Category.query.filter(Category.name.ilike(name)).first():
        return jsonify({"error": "Category already exists"}), 409

    category = Category(
        name=name,
        description=data.get("description"),
        color_code=data.get("color_code", "#2563EB")
    )
    db.session.add(category)
    db.session.commit()
    return jsonify({"message": "Category created successfully", "category": category.to_dict()}), 201

@categories_bp.route("/<int:id>", methods=["PUT"])
@token_required
@roles_accepted("admin", "librarian")
def update_category(current_user, id):
    category = Category.query.get_or_404(id)
    data = request.get_json() or {}
    if "name" in data:
        category.name = data["name"].strip()
    if "description" in data:
        category.description = data["description"]
    if "color_code" in data:
        category.color_code = data["color_code"]
    db.session.commit()
    return jsonify({"message": "Category updated successfully", "category": category.to_dict()}), 200

@categories_bp.route("/<int:id>", methods=["DELETE"])
@token_required
@roles_accepted("admin", "librarian")
def delete_category(current_user, id):
    category = Category.query.get_or_404(id)
    if len(category.books) > 0:
        return jsonify({"error": f"Cannot delete category '{category.name}' because {len(category.books)} book(s) belong to it."}), 400
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted successfully"}), 200
