from datetime import datetime
from app.models import db

class Author(db.Model):
    __tablename__ = "authors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, unique=True, index=True)
    biography = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    books = db.relationship("Book", back_populates="author", cascade="all, delete-orphan")

    def to_dict(self, include_books_count=True):
        data = {
            "id": self.id,
            "name": self.name,
            "biography": self.biography,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_books_count:
            data["books_count"] = len(self.books)
        return data
