from app.routes.auth import auth_bp
from app.routes.books import books_bp
from app.routes.students import students_bp
from app.routes.authors import authors_bp
from app.routes.categories import categories_bp
from app.routes.transactions import transactions_bp
from app.routes.fines import fines_bp
from app.routes.notifications import notifications_bp
from app.routes.dashboard import dashboard_bp
from app.routes.reports import reports_bp
from app.routes.settings import settings_bp
from app.routes.search import search_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(books_bp, url_prefix="/api/books")
    app.register_blueprint(students_bp, url_prefix="/api/students")
    app.register_blueprint(authors_bp, url_prefix="/api/authors")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(transactions_bp, url_prefix="/api/transactions")
    app.register_blueprint(fines_bp, url_prefix="/api/fines")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")
    app.register_blueprint(search_bp, url_prefix="/api/search")
