from datetime import date, timedelta
from app.models import db, Book, Student, Transaction, Fine, Notification, ActivityLog, SystemSetting

def get_setting(key: str, default=None):
    setting = SystemSetting.query.get(key)
    if setting:
        return setting.value
    return default

def get_borrow_duration_days() -> int:
    val = get_setting("borrow_duration_days", "14")
    try:
        return int(val)
    except ValueError:
        return 14

def get_fine_per_day() -> float:
    val = get_setting("fine_per_day", "1.50")
    try:
        return float(val)
    except ValueError:
        return 1.50

def get_max_borrow_limit() -> int:
    val = get_setting("max_borrow_limit", "3")
    try:
        return int(val)
    except ValueError:
        return 3

def sync_overdue_transactions():
    """Scans all borrowed transactions and flags overdue ones."""
    today = date.today()
    overdue_txs = Transaction.query.filter(
        Transaction.status == "borrowed",
        Transaction.due_date < today
    ).all()

    for tx in overdue_txs:
        tx.status = "overdue"
        # Notify student if not notified today
        if tx.student and tx.student.user:
            existing_notif = Notification.query.filter_by(
                user_id=tx.student.user.id,
                title="Book Overdue Alert"
            ).first()
            if not existing_notif:
                notif = Notification(
                    user_id=tx.student.user.id,
                    title="Book Overdue Alert",
                    message=f"The book '{tx.book.title}' was due on {tx.due_date.isoformat()}. Please return it to avoid additional fines.",
                    type="overdue"
                )
                db.session.add(notif)
    db.session.commit()

def issue_book(student_id: int, book_id: int, issued_by_user_id: int, custom_due_date: date = None, notes: str = None):
    student = Student.query.get(student_id)
    if not student:
        raise ValueError("Student not found")

    book = Book.query.get(book_id)
    if not book:
        raise ValueError("Book not found")

    if book.available_copies <= 0 or book.status == "unavailable":
        raise ValueError(f"No copies available for '{book.title}'")

    max_limit = student.max_borrow_limit or get_max_borrow_limit()
    if student.currently_borrowed_count >= max_limit:
        raise ValueError(f"Student has reached maximum borrow limit ({max_limit} books)")

    # Check if student already has a copy of this book currently borrowed
    existing_loan = Transaction.query.filter(
        Transaction.student_id == student.id,
        Transaction.book_id == book.id,
        Transaction.status.in_(["borrowed", "overdue"])
    ).first()
    if existing_loan:
        raise ValueError(f"Student already currently has an active loan for '{book.title}'")

    issue_d = date.today()
    due_d = custom_due_date if custom_due_date else issue_d + timedelta(days=get_borrow_duration_days())

    # Create transaction
    tx = Transaction(
        student_id=student.id,
        book_id=book.id,
        issued_by_user_id=issued_by_user_id,
        issue_date=issue_d,
        due_date=due_d,
        status="borrowed",
        notes=notes
    )
    db.session.add(tx)

    # Decrement available copies
    book.available_copies -= 1
    book.sync_status()

    # Log activity
    log = ActivityLog(
        user_id=issued_by_user_id,
        action="issue_book",
        entity_type="transaction",
        details=f"Issued '{book.title}' to student {student.name} ({student.student_id}). Due: {due_d.isoformat()}"
    )
    db.session.add(log)

    # Student Notification
    if student.user:
        notif = Notification(
            user_id=student.user.id,
            title="Book Issued Successfully",
            message=f"You have borrowed '{book.title}'. Due date is {due_d.isoformat()}.",
            type="info"
        )
        db.session.add(notif)

    db.session.commit()
    return tx

def return_book(transaction_id: int, user_id: int, notes: str = None):
    tx = Transaction.query.get(transaction_id)
    if not tx:
        raise ValueError("Transaction not found")

    if tx.status == "returned":
        raise ValueError("This transaction has already been returned")

    return_d = date.today()
    tx.return_date = return_d
    tx.status = "returned"
    if notes:
        tx.notes = (tx.notes + "\n" + notes) if tx.notes else notes

    # Increment available copies
    book = tx.book
    book.available_copies += 1
    book.sync_status()

    # Calculate fine
    late_days = tx.calculate_late_days(check_date=return_d)
    fine_record = None

    if late_days > 0:
        fine_rate = get_fine_per_day()
        fine_amount = round(late_days * fine_rate, 2)
        fine_record = Fine(
            transaction_id=tx.id,
            student_id=tx.student_id,
            amount=fine_amount,
            late_days=late_days,
            status="pending",
            notes=f"Generated automatically for {late_days} overdue days."
        )
        db.session.add(fine_record)

        # Notify student about fine
        if tx.student and tx.student.user:
            fine_notif = Notification(
                user_id=tx.student.user.id,
                title="Fine Generated for Overdue Book",
                message=f"A fine of ${fine_amount:.2f} was generated for returning '{book.title}' {late_days} days late.",
                type="alert"
            )
            db.session.add(fine_notif)

    # Activity Log
    log = ActivityLog(
        user_id=user_id,
        action="return_book",
        entity_type="transaction",
        entity_id=tx.id,
        details=f"Returned '{book.title}' from {tx.student.name}. Late days: {late_days}."
    )
    db.session.add(log)

    # Notification
    if tx.student and tx.student.user:
        notif = Notification(
            user_id=tx.student.user.id,
            title="Book Returned Successfully",
            message=f"'{book.title}' was marked returned.",
            type="success"
        )
        db.session.add(notif)

    db.session.commit()
    return tx, fine_record
