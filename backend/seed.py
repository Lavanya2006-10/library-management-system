from datetime import date, timedelta
from app.models import (
    db, User, Author, Category, Book, Student, Transaction, Fine, Notification, ActivityLog, SystemSetting
)

def seed_database(force=False):
    if not force and User.query.first():
        print("Database already contains data. Skipping initial seeding.")
        return

    if force:
        print("Forced seeding: dropping all existing tables...")
        db.drop_all()
        db.create_all()

    print("Seeding database with realistic demonstration data...")

    # 1. System Settings
    settings = [
        SystemSetting(key="library_name", value="Nexus Smart Library", description="Name of the university library"),
        SystemSetting(key="fine_per_day", value="1.50", description="Fine amount per overdue day in USD"),
        SystemSetting(key="borrow_duration_days", value="14", description="Standard loan period in days"),
        SystemSetting(key="max_borrow_limit", value="3", description="Maximum active books per student"),
        SystemSetting(key="allow_self_renewal", value="true", description="Allow students to renew books online"),
    ]
    db.session.add_all(settings)

    # 2. Users (Customized with Lavanya S, no external photos)
    admin = User(
        name="Lavanya S (Chief Admin)",
        email="admin@smartlib.io",
        role="admin",
        avatar_url=None
    )
    admin.set_password("adminpassword")

    librarian = User(
        name="Lavanya S (Head Librarian)",
        email="librarian@smartlib.io",
        role="librarian",
        avatar_url=None
    )
    librarian.set_password("librarianpassword")

    lavanya_user = User(
        name="Lavanya S",
        email="lavanyas.24it@kongu.edu",
        role="student",
        avatar_url=None
    )
    lavanya_user.set_password("studentpassword")

    db.session.add_all([admin, librarian, lavanya_user])
    db.session.flush()

    # 3. Categories
    categories_data = [
        {"name": "Computer Science", "description": "Algorithms, Systems, and Software Architecture", "color": "#2563EB"},
        {"name": "Artificial Intelligence", "description": "Machine Learning, Deep Learning, and Neural Networks", "color": "#7C3AED"},
        {"name": "Software Engineering", "description": "Clean Code, Design Patterns, and Testing", "color": "#0284C7"},
        {"name": "Business & Economics", "description": "Finance, Entrepreneurship, and Management", "color": "#059669"},
        {"name": "Psychology & Mindset", "description": "Behavioral Economics, Habit Formation, and Cognition", "color": "#D97706"},
        {"name": "Sci-Fi & Fantasy", "description": "Speculative Fiction and World Building", "color": "#9333EA"},
        {"name": "Classic Literature", "description": "Timeless Masterpieces and Historical Fiction", "color": "#DC2626"},
        {"name": "Mathematics & Physics", "description": "Theoretical Physics, Statistics, and Calculus", "color": "#0891B2"},
    ]
    categories = {}
    for cat in categories_data:
        c = Category(name=cat["name"], description=cat["description"], color_code=cat["color"])
        db.session.add(c)
        db.session.flush()
        categories[cat["name"]] = c

    # 4. Authors
    authors_data = [
        {"name": "Robert C. Martin", "bio": "Software engineer and author of Clean Code and Agile Principles."},
        {"name": "Martin Kleppmann", "bio": "Researcher in distributed systems at the University of Cambridge."},
        {"name": "Thomas H. Cormen", "bio": "Professor of Computer Science and co-author of CLRS Introduction to Algorithms."},
        {"name": "Stuart Russell & Peter Norvig", "bio": "Pioneering authors of Artificial Intelligence: A Modern Approach."},
        {"name": "James Clear", "bio": "Specialist in habits and decision making, author of Atomic Habits."},
        {"name": "Daniel Kahneman", "bio": "Nobel laureate in Economics, pioneer in behavioral psychology."},
        {"name": "Frank Herbert", "bio": "American science-fiction author best known for the novel Dune."},
        {"name": "F. Scott Fitzgerald", "bio": "Celebrated novelist of the Jazz Age, author of The Great Gatsby."},
        {"name": "George Orwell", "bio": "English novelist, essayist, and critic, author of 1984 and Animal Farm."},
        {"name": "Yuval Noah Harari", "bio": "Historian, philosopher, and bestselling author of Sapiens."},
        {"name": "Eric Ries", "bio": "Entrepreneur and creator of the Lean Startup methodology."},
        {"name": "Cal Newport", "bio": "Associate Professor of Computer Science at Georgetown University, author of Deep Work."},
        {"name": "Richard Feynman", "bio": "Theoretical physicist and Nobel laureate known for quantum electrodynamics."},
        {"name": "Andrew Ng", "bio": "Co-founder of Coursera and adjunct professor at Stanford University."},
    ]
    authors = {}
    for auth in authors_data:
        a = Author(name=auth["name"], biography=auth["bio"])
        db.session.add(a)
        db.session.flush()
        authors[auth["name"]] = a

    # 5. Books (25+ real books)
    books_data = [
        {
            "isbn": "978-0132350884",
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "category": "Software Engineering",
            "publisher": "Prentice Hall",
            "year": 2008,
            "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
            "cover": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack CS-101"
        },
        {
            "isbn": "978-1449373320",
            "title": "Designing Data-Intensive Applications",
            "author": "Martin Kleppmann",
            "category": "Computer Science",
            "publisher": "O'Reilly Media",
            "year": 2017,
            "description": "Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability.",
            "cover": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack CS-104"
        },
        {
            "isbn": "978-0262033848",
            "title": "Introduction to Algorithms (CLRS 3rd Edition)",
            "author": "Thomas H. Cormen",
            "category": "Computer Science",
            "publisher": "MIT Press",
            "year": 2009,
            "description": "Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness.",
            "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
            "copies": 6,
            "shelf": "Stack CS-102"
        },
        {
            "isbn": "978-0136042594",
            "title": "Artificial Intelligence: A Modern Approach",
            "author": "Stuart Russell & Peter Norvig",
            "category": "Artificial Intelligence",
            "publisher": "Pearson",
            "year": 2020,
            "description": "The leading textbook on artificial intelligence, exploring search algorithms, probabilistic reasoning, machine learning, deep learning, and natural language processing.",
            "cover": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack AI-201"
        },
        {
            "isbn": "978-0735211292",
            "title": "Atomic Habits: An Easy & Proven Way to Build Good Habits",
            "author": "James Clear",
            "category": "Psychology & Mindset",
            "publisher": "Avery",
            "year": 2018,
            "description": "No matter your goals, Atomic Habits offers a proven framework for improving every day by mastering the tiny behaviors that lead to remarkable results.",
            "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack PSY-301"
        },
        {
            "isbn": "978-0374533557",
            "title": "Thinking, Fast and Slow",
            "author": "Daniel Kahneman",
            "category": "Psychology & Mindset",
            "publisher": "Farrar, Straus and Giroux",
            "year": 2011,
            "description": "The landmark book that explains the two systems that drive the way we think: System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.",
            "cover": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack PSY-302"
        },
        {
            "isbn": "978-0441172719",
            "title": "Dune",
            "author": "Frank Herbert",
            "category": "Sci-Fi & Fantasy",
            "publisher": "Chilton Books",
            "year": 1965,
            "description": "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who will inherit the mantle of power and lead a desert revolution for control of the spice melange.",
            "cover": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack FIC-401"
        },
        {
            "isbn": "978-0743273565",
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald",
            "category": "Classic Literature",
            "publisher": "Scribner",
            "year": 1925,
            "description": "The tragic story of Jay Gatsby, a self-made millionaire, and his pursuit of Daisy Buchanan, a wealthy young woman whom he loved in his youth.",
            "cover": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack LIT-501"
        },
        {
            "isbn": "978-0451524935",
            "title": "1984: A Novel",
            "author": "George Orwell",
            "category": "Classic Literature",
            "publisher": "Signet Classic",
            "year": 1949,
            "description": "Winston Smith toes the Party line, rewriting history to satisfy the Ministry of Truth. With each lie he writes, Winston grows to hate the Party that seeks power for its own sake.",
            "cover": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack LIT-502"
        },
        {
            "isbn": "978-0062316097",
            "title": "Sapiens: A Brief History of Humankind",
            "author": "Yuval Noah Harari",
            "category": "Business & Economics",
            "publisher": "Harper",
            "year": 2014,
            "description": "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
            "cover": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack HIS-601"
        },
        {
            "isbn": "978-0307887894",
            "title": "The Lean Startup",
            "author": "Eric Ries",
            "category": "Business & Economics",
            "publisher": "Crown Business",
            "year": 2011,
            "description": "Most startups fail. But many of those failures are preventable. The Lean Startup is a new approach being adopted across the globe, changing the way companies are built and products are launched.",
            "cover": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack BUS-701"
        },
        {
            "isbn": "978-1455586691",
            "title": "Deep Work: Rules for Focused Success in a Distracted World",
            "author": "Cal Newport",
            "category": "Psychology & Mindset",
            "publisher": "Grand Central Publishing",
            "year": 2016,
            "description": "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.",
            "cover": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack PSY-303"
        },
        {
            "isbn": "978-0465023820",
            "title": "Six Easy Pieces: Essentials of Physics Explained by Its Most Brilliant Teacher",
            "author": "Richard Feynman",
            "category": "Mathematics & Physics",
            "publisher": "Basic Books",
            "year": 1994,
            "description": "Learn the essentials of atoms, basic physics, the relation of physics to other sciences, energy, and gravitation from Nobel Prize winning physicist Richard P. Feynman.",
            "cover": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
            "copies": 3,
            "shelf": "Stack SCI-801"
        },
        {
            "isbn": "978-0131103627",
            "title": "The C Programming Language (2nd Edition)",
            "author": "Robert C. Martin",
            "category": "Computer Science",
            "publisher": "Prentice Hall",
            "year": 1988,
            "description": "Known as K&R, this book introduces the fundamental principles of C programming with clarity, authority, and brevity.",
            "cover": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack CS-105"
        },
        {
            "isbn": "978-0134494166",
            "title": "Clean Architecture: A Craftsman's Guide to Software Structure",
            "author": "Robert C. Martin",
            "category": "Software Engineering",
            "publisher": "Prentice Hall",
            "year": 2017,
            "description": "By applying universal rules of software architecture, you can dramatically improve developer productivity throughout the life of any software system.",
            "cover": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack CS-106"
        },
        {
            "isbn": "978-0201633610",
            "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
            "author": "Robert C. Martin",
            "category": "Software Engineering",
            "publisher": "Addison-Wesley",
            "year": 1994,
            "description": "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.",
            "cover": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack CS-107"
        },
        {
            "isbn": "978-0262035613",
            "title": "Deep Learning (Adaptive Computation and Machine Learning)",
            "author": "Andrew Ng",
            "category": "Artificial Intelligence",
            "publisher": "MIT Press",
            "year": 2016,
            "description": "An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background, deep learning techniques used in industry, and research perspectives.",
            "cover": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
            "copies": 3,
            "shelf": "Stack AI-202"
        },
        {
            "isbn": "978-0385547345",
            "title": "The Innovator's Dilemma",
            "author": "Eric Ries",
            "category": "Business & Economics",
            "publisher": "Harvard Business Review Press",
            "year": 2011,
            "description": "Clayton Christensen's historic masterpiece explaining why outstanding companies can do everything right and still lose their market leadership to disruptive innovations.",
            "cover": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80",
            "copies": 3,
            "shelf": "Stack BUS-702"
        },
        {
            "isbn": "978-0061122415",
            "title": "The Alchemist",
            "author": "F. Scott Fitzgerald",
            "category": "Classic Literature",
            "publisher": "HarperOne",
            "year": 1988,
            "description": "A magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found.",
            "cover": "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80",
            "copies": 5,
            "shelf": "Stack LIT-503"
        },
        {
            "isbn": "978-0452284234",
            "title": "Animal Farm",
            "author": "George Orwell",
            "category": "Classic Literature",
            "publisher": "Plume",
            "year": 1945,
            "description": "George Orwell's timeless satire on the corrupting influence of absolute power, starring the rebellious animals of Manor Farm.",
            "cover": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack LIT-504"
        },
        {
            "isbn": "978-0143127741",
            "title": "Zero to One: Notes on Startups, or How to Build the Future",
            "author": "Eric Ries",
            "category": "Business & Economics",
            "publisher": "Currency",
            "year": 2014,
            "description": "The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. Peter Thiel shows how we can find singular ways to create those new things.",
            "cover": "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&auto=format&fit=crop&q=80",
            "copies": 4,
            "shelf": "Stack BUS-703"
        },
        {
            "isbn": "978-0321751041",
            "title": "The Art of Computer Programming, Vol. 1",
            "author": "Thomas H. Cormen",
            "category": "Computer Science",
            "publisher": "Addison-Wesley",
            "year": 1997,
            "description": "The bible of fundamental algorithms and data structures written by Donald E. Knuth, foundational to the entire computing discipline.",
            "cover": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80",
            "copies": 2,
            "shelf": "Stack CS-103"
        }
    ]

    books = []
    for b_data in books_data:
        author = authors.get(b_data["author"])
        category = categories.get(b_data["category"])
        book = Book(
            isbn=b_data["isbn"],
            title=b_data["title"],
            author_id=author.id,
            category_id=category.id,
            publisher=b_data["publisher"],
            publication_year=b_data["year"],
            description=b_data["description"],
            cover_url=b_data["cover"],
            total_copies=b_data["copies"],
            available_copies=b_data["copies"],
            shelf_location=b_data["shelf"],
            status="available"
        )
        db.session.add(book)
        books.append(book)
    db.session.flush()

    # 6. Students (Information Technology & Major Engineering Courses)
    students_data = [
        {"num": "24IT001", "name": "Lavanya S", "email": "lavanyas.24it@kongu.edu", "dept": "Information Technology", "year": 2, "phone": "+91 98765 43210", "user": lavanya_user},
        {"num": "24CS002", "name": "Karthik R", "email": "karthik.cse@kongu.edu", "dept": "Computer Science & Engineering", "year": 2, "phone": "+91 98765 43211"},
        {"num": "24AI003", "name": "Sneha M", "email": "sneha.aids@kongu.edu", "dept": "Artificial Intelligence & Data Science", "year": 2, "phone": "+91 98765 43212"},
        {"num": "24EC004", "name": "Dinesh Kumar", "email": "dinesh.ece@kongu.edu", "dept": "Electronics & Communication Eng", "year": 3, "phone": "+91 98765 43213"},
        {"num": "24EE005", "name": "Pooja V", "email": "pooja.eee@kongu.edu", "dept": "Electrical & Electronics Eng", "year": 1, "phone": "+91 98765 43214"},
        {"num": "24ME006", "name": "Vignesh S", "email": "vignesh.mech@kongu.edu", "dept": "Mechanical Engineering", "year": 4, "phone": "+91 98765 43215"},
        {"num": "24CE007", "name": "Ananya P", "email": "ananya.civil@kongu.edu", "dept": "Civil Engineering", "year": 3, "phone": "+91 98765 43216"},
        {"num": "24MT008", "name": "Gokul N", "email": "gokul.mts@kongu.edu", "dept": "Mechatronics Engineering", "year": 2, "phone": "+91 98765 43217"},
        {"num": "24BM009", "name": "Harini K", "email": "harini.bme@kongu.edu", "dept": "Biomedical Engineering", "year": 2, "phone": "+91 98765 43218"},
        {"num": "24CH010", "name": "Mano Raj", "email": "mano.chem@kongu.edu", "dept": "Chemical Engineering", "year": 3, "phone": "+91 98765 43219"},
        {"num": "24AT011", "name": "Sanjay B", "email": "sanjay.auto@kongu.edu", "dept": "Automobile Engineering", "year": 3, "phone": "+91 98765 43220"},
        {"num": "24FT012", "name": "Deepa T", "email": "deepa.ft@kongu.edu", "dept": "Food Technology", "year": 2, "phone": "+91 98765 43221"},
    ]

    students = []
    for s_info in students_data:
        student = Student(
            student_id=s_info["num"],
            name=s_info["name"],
            email=s_info["email"],
            department=s_info["dept"],
            year=s_info["year"],
            phone=s_info["phone"],
            user_id=s_info.get("user").id if s_info.get("user") else None,
            max_borrow_limit=3
        )
        db.session.add(student)
        students.append(student)
    db.session.flush()

    # 7. Transactions & Overdue & Fines
    today = date.today()

    # Transaction 1: Active loan for Alex Chen (Clean Code) - Due in 8 days
    b0 = books[0]
    tx1 = Transaction(
        student_id=students[0].id,
        book_id=b0.id,
        issued_by_user_id=librarian.id,
        issue_date=today - timedelta(days=6),
        due_date=today + timedelta(days=8),
        status="borrowed",
        notes="Student requested copy for Software Architecture assignment."
    )
    b0.available_copies -= 1

    # Transaction 2: OVERDUE loan for Alex Chen (Designing Data-Intensive Applications) - Due 4 days ago!
    b1 = books[1]
    tx2 = Transaction(
        student_id=students[0].id,
        book_id=b1.id,
        issued_by_user_id=librarian.id,
        issue_date=today - timedelta(days=18),
        due_date=today - timedelta(days=4),
        status="overdue",
        notes="Auto-flagged overdue."
    )
    b1.available_copies -= 1

    # Transaction 3: Active loan for Sophia Rodriguez (Introduction to Algorithms)
    b2 = books[2]
    tx3 = Transaction(
        student_id=students[1].id,
        book_id=b2.id,
        issued_by_user_id=librarian.id,
        issue_date=today - timedelta(days=3),
        due_date=today + timedelta(days=11),
        status="borrowed"
    )
    b2.available_copies -= 1

    # Transaction 4: OVERDUE loan for Liam Patel (Dune) - Due 9 days ago
    b6 = books[6]
    tx4 = Transaction(
        student_id=students[2].id,
        book_id=b6.id,
        issued_by_user_id=librarian.id,
        issue_date=today - timedelta(days=23),
        due_date=today - timedelta(days=9),
        status="overdue"
    )
    b6.available_copies -= 1

    # Transaction 5: Returned with PAID Fine (Atomic Habits - returned 5 days late)
    b4 = books[4]
    tx5 = Transaction(
        student_id=students[3].id,
        book_id=b4.id,
        issued_by_user_id=librarian.id,
        issue_date=today - timedelta(days=30),
        due_date=today - timedelta(days=16),
        return_date=today - timedelta(days=11),
        status="returned",
        notes="Returned 5 days late. Paid at circulation desk."
    )
    fine1 = Fine(
        transaction=tx5,
        student_id=students[3].id,
        amount=7.50, # 5 days * 1.50
        late_days=5,
        status="paid",
        payment_date=today - timedelta(days=11),
        payment_method="cash",
        notes="Settled in full at counter."
    )
    db.session.add(fine1)

    # Transaction 6: Returned with WAIVED Fine (Thinking Fast and Slow - 2 days late)
    b5 = books[5]
    tx6 = Transaction(
        student_id=students[5].id,
        book_id=b5.id,
        issued_by_user_id=admin.id,
        issue_date=today - timedelta(days=20),
        due_date=today - timedelta(days=6),
        return_date=today - timedelta(days=4),
        status="returned",
        notes="Medical leave excused."
    )
    fine2 = Fine(
        transaction=tx6,
        student_id=students[5].id,
        amount=3.00,
        late_days=2,
        status="waived",
        payment_date=today - timedelta(days=4),
        payment_method="waived",
        notes="Excused due to documented campus health clinic visit."
    )
    db.session.add(fine2)

    # Transaction 7: On-time Return (1984)
    b8 = books[8]
    tx7 = Transaction(
        student_id=students[4].id,
        book_id=b8.id,
        issued_by_user_id=librarian.id,
        issue_date=today - timedelta(days=15),
        due_date=today - timedelta(days=1),
        return_date=today - timedelta(days=2),
        status="returned",
        notes="Returned in excellent condition."
    )

    db.session.add_all([tx1, tx2, tx3, tx4, tx5, tx6, tx7])

    # Fine for active overdue book (tx2 - 4 days overdue = $6.00 pending)
    fine3 = Fine(
        transaction=tx2,
        student_id=students[0].id,
        amount=6.00,
        late_days=4,
        status="pending",
        notes="Pending overdue fine (4 days late)."
    )
    # Fine for active overdue book (tx4 - 9 days overdue = $13.50 pending)
    fine4 = Fine(
        transaction=tx4,
        student_id=students[2].id,
        amount=13.50,
        late_days=9,
        status="pending",
        notes="Pending overdue fine (9 days late)."
    )
    db.session.add_all([fine3, fine4])

    # 8. Notifications for Demo Student Lavanya S
    n1 = Notification(
        user_id=lavanya_user.id,
        title="Book Due Soon",
        message="Your borrowed book 'Clean Code' is due in 8 days on " + (today + timedelta(days=8)).isoformat(),
        type="due_soon",
        is_read=False
    )
    n2 = Notification(
        user_id=lavanya_user.id,
        title="Book Overdue Notice",
        message="CRITICAL: 'Designing Data-Intensive Applications' is 4 days overdue. Outstanding fine: $6.00. Please return immediately.",
        type="overdue",
        is_read=False
    )
    n3 = Notification(
        user_id=lavanya_user.id,
        title="Welcome to Nexus Smart Library",
        message="Your student account has been activated. You can borrow up to 3 books concurrently.",
        type="info",
        is_read=True
    )
    db.session.add_all([n1, n2, n3])

    # 9. Activity Logs
    logs = [
        ActivityLog(user_id=admin.id, action="system_init", details="Initialized Smart Library Management System with default parameters"),
        ActivityLog(user_id=librarian.id, action="issue_book", details=f"Issued '{b0.title}' to Lavanya S"),
        ActivityLog(user_id=librarian.id, action="issue_book", details=f"Issued '{b1.title}' to Lavanya S"),
        ActivityLog(user_id=librarian.id, action="issue_book", details=f"Issued '{b2.title}' to Karthik R"),
        ActivityLog(user_id=librarian.id, action="return_book", details=f"Processed return of '{b4.title}' from Dinesh Kumar"),
        ActivityLog(user_id=librarian.id, action="pay_fine", details="Recorded cash payment of $7.50 for Dinesh Kumar"),
        ActivityLog(user_id=admin.id, action="waive_fine", details="Waived $3.00 late fee for Vignesh S (medical excuse)"),
    ]
    db.session.add_all(logs)

    # Sync availability statuses
    for b in books:
        b.sync_status()

    db.session.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    import sys
    from app import create_app
    app = create_app()
    with app.app_context():
        force = "--force" in sys.argv or "-f" in sys.argv
        if not force:
            db.create_all()
        seed_database(force=force)
