from datetime import datetime
from app.models import db

class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.String(255), nullable=True)
    color_code = db.Column(db.String(20), default="#2563EB")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    books = db.relationship("Book", back_populates="category", cascade="all, delete-orphan")

    def to_dict(self, include_books_count=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "color_code": self.color_code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_books_count:
            data["books_count"] = len(self.books)
        return data
