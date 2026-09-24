from datetime import datetime
from app.models import db

class Book(db.Model):
    __tablename__ = "books"

    id = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(20), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("authors.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    publisher = db.Column(db.String(150), nullable=True)
    publication_year = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    cover_url = db.Column(db.String(500), nullable=True)
    total_copies = db.Column(db.Integer, nullable=False, default=1)
    available_copies = db.Column(db.Integer, nullable=False, default=1)
    shelf_location = db.Column(db.String(50), nullable=True, default="General Shelf")
    status = db.Column(db.String(20), nullable=False, default="available") # available, unavailable, reserved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    author = db.relationship("Author", back_populates="books")
    category = db.relationship("Category", back_populates="books")
    transactions = db.relationship("Transaction", back_populates="book", cascade="all, delete-orphan")

    def sync_status(self):
        if self.available_copies <= 0:
            self.status = "unavailable"
            self.available_copies = 0
        else:
            self.status = "available"

    def to_dict(self):
        return {
            "id": self.id,
            "isbn": self.isbn,
            "title": self.title,
            "author_id": self.author_id,
            "author_name": self.author.name if self.author else "Unknown Author",
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else "Uncategorized",
            "category_color": self.category.color_code if self.category else "#2563EB",
            "publisher": self.publisher,
            "publication_year": self.publication_year,
            "description": self.description,
            "cover_url": self.cover_url,
            "total_copies": self.total_copies,
            "available_copies": self.available_copies,
            "shelf_location": self.shelf_location,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
