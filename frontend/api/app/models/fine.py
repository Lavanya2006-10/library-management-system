from datetime import datetime, date
from app.models import db

class Fine(db.Model):
    __tablename__ = "fines"

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey("transactions.id"), unique=True, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    late_days = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default="pending") # pending, paid, waived
    payment_date = db.Column(db.Date, nullable=True)
    payment_method = db.Column(db.String(50), nullable=True) # cash, online, card, waived
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    transaction = db.relationship("Transaction", back_populates="fine")
    student = db.relationship("Student", back_populates="fines")

    def to_dict(self, include_relations=True):
        data = {
            "id": self.id,
            "transaction_id": self.transaction_id,
            "student_id": self.student_id,
            "amount": float(self.amount),
            "late_days": self.late_days,
            "status": self.status,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
            "payment_method": self.payment_method,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_relations:
            data["student_name"] = self.student.name if self.student else "Unknown Student"
            data["student_number"] = self.student.student_id if self.student else ""
            data["student_email"] = self.student.email if self.student else ""
            if self.transaction and self.transaction.book:
                data["book_title"] = self.transaction.book.title
                data["book_isbn"] = self.transaction.book.isbn
                data["due_date"] = self.transaction.due_date.isoformat() if self.transaction.due_date else None
                data["return_date"] = self.transaction.return_date.isoformat() if self.transaction.return_date else None
        return data
