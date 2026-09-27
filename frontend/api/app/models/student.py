from datetime import datetime
from app.models import db

class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(30), nullable=True)
    department = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False, default=1)
    max_borrow_limit = db.Column(db.Integer, nullable=False, default=3)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", back_populates="student_profile")
    transactions = db.relationship("Transaction", back_populates="student", cascade="all, delete-orphan")
    fines = db.relationship("Fine", back_populates="student", cascade="all, delete-orphan")

    @property
    def currently_borrowed_count(self):
        return sum(1 for t in self.transactions if t.status in ["borrowed", "overdue"])

    @property
    def outstanding_fines_total(self):
        return sum(f.amount for f in self.fines if f.status == "pending")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "department": self.department,
            "year": self.year,
            "max_borrow_limit": self.max_borrow_limit,
            "currently_borrowed": self.currently_borrowed_count,
            "total_borrowed": len(self.transactions),
            "outstanding_fines": float(self.outstanding_fines_total),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
