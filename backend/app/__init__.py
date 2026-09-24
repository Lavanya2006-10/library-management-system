from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.models import db
from app.routes import register_blueprints

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend Vite development port (5173) and any origin
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    register_blueprints(app)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Smart Library Management System API",
            "version": "1.0.0"
        }), 200

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred"}), 500

    return app
