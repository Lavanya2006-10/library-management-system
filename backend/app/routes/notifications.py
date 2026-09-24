from flask import Blueprint, jsonify
from app.models import db, Notification
from app.utils.auth_helper import token_required

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("", methods=["GET"])
@token_required
def get_notifications(current_user):
    notifs = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(30).all()
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count
    }), 200

@notifications_bp.route("/<int:id>/read", methods=["PUT"])
@token_required
def mark_read(current_user, id):
    notif = Notification.query.filter_by(id=id, user_id=current_user.id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read", "notification": notif.to_dict()}), 200

@notifications_bp.route("/read-all", methods=["PUT"])
@token_required
def mark_all_read(current_user):
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200
