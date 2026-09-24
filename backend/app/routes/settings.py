from flask import Blueprint, request, jsonify
from app.models import db, SystemSetting, ActivityLog
from app.utils.auth_helper import token_required, roles_accepted

settings_bp = Blueprint("settings", __name__)

@settings_bp.route("", methods=["GET"])
@token_required
def get_settings(current_user):
    settings = SystemSetting.query.all()
    data = {s.key: s.value for s in settings}
    # Ensure defaults
    data.setdefault("library_name", "Nexus Smart Library")
    data.setdefault("fine_per_day", "1.50")
    data.setdefault("borrow_duration_days", "14")
    data.setdefault("max_borrow_limit", "3")
    data.setdefault("allow_self_renewal", "true")
    return jsonify({"settings": data}), 200

@settings_bp.route("", methods=["PUT"])
@token_required
@roles_accepted("admin")
def update_settings(current_user):
    data = request.get_json() or {}
    for key, value in data.items():
        setting = SystemSetting.query.get(key)
        if not setting:
            setting = SystemSetting(key=key, value=str(value))
            db.session.add(setting)
        else:
            setting.value = str(value)

    log = ActivityLog(
        user_id=current_user.id,
        action="update_settings",
        details="Updated library system settings"
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Settings updated successfully", "settings": data}), 200
