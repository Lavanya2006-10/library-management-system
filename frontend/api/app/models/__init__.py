from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from app.models.user import User
from app.models.author import Author
from app.models.category import Category
from app.models.book import Book
from app.models.student import Student
from app.models.transaction import Transaction
from app.models.fine import Fine
from app.models.notification import Notification
from app.models.log import ActivityLog
from app.models.setting import SystemSetting

__all__ = [
    "db",
    "User",
    "Author",
    "Category",
    "Book",
    "Student",
    "Transaction",
    "Fine",
    "Notification",
    "ActivityLog",
    "SystemSetting",
]
