from datetime import datetime, date
from app.models import db

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False, index=True)
    issued_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    issue_date = db.Column(db.Date, nullable=False, default=date.today)
    due_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="borrowed") # borrowed, returned, overdue
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student = db.relationship("Student", back_populates="transactions")
    book = db.relationship("Book", back_populates="transactions")
    issued_by = db.relationship("User", foreign_keys=[issued_by_user_id])
    fine = db.relationship("Fine", back_populates="transaction", uselist=False, cascade="all, delete-orphan")

    def calculate_late_days(self, check_date: date = None) -> int:
        if not check_date:
            check_date = self.return_date if self.return_date else date.today()
        if check_date > self.due_date:
            return (check_date - self.due_date).days
        return 0

    def check_and_update_overdue(self):
        if self.status == "borrowed" and date.today() > self.due_date:
            self.status = "overdue"

    def to_dict(self):
        late_days = self.calculate_late_days()
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_number": self.student.student_id if self.student else "",
            "student_name": self.student.name if self.student else "Unknown Student",
            "student_email": self.student.email if self.student else "",
            "student_department": self.student.department if self.student else "",
            "book_id": self.book_id,
            "book_isbn": self.book.isbn if self.book else "",
            "book_title": self.book.title if self.book else "Unknown Book",
            "book_author": self.book.author.name if self.book and self.book.author else "",
            "book_cover": self.book.cover_url if self.book else None,
            "issued_by": self.issued_by.name if self.issued_by else "System",
            "issue_date": self.issue_date.isoformat() if self.issue_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "return_date": self.return_date.isoformat() if self.return_date else None,
            "status": self.status,
            "late_days": late_days,
            "notes": self.notes,
            "fine": self.fine.to_dict(include_relations=False) if self.fine else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
