import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookmarkPlus,
  Search,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { Student, Book } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const IssueBook: React.FC = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get('book_id');
  const preselectedStudentId = searchParams.get('student_id');

  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const [issueDate, setIssueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await api.get('/students?per_page=50');
        setStudents(res.data.students);
        if (preselectedStudentId) {
          const found = res.data.students.find((s: Student) => String(s.id) === preselectedStudentId);
          if (found) setSelectedStudent(found);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadStudents();
  }, [preselectedStudentId]);

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await api.get('/books?per_page=50&status=available');
        setBooks(res.data.books);
        if (preselectedBookId) {
          const found = res.data.books.find((b: Book) => String(b.id) === preselectedBookId);
          if (found) setSelectedBook(found);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadBooks();
  }, [preselectedBookId]);

  // Auto-recalculate due date when issue date changes (+14 days)
  const handleIssueDateChange = (val: string) => {
    setIssueDate(val);
    if (val) {
      const d = new Date(val);
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().split('T')[0]);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.student_id.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author_name.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const isLimitReached =
    selectedStudent && selectedStudent.currently_borrowed >= selectedStudent.max_borrow_limit;
  const isBookUnavailable = selectedBook && selectedBook.available_copies <= 0;

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedStudent || !selectedBook) {
      setErrorMessage('Please select both a student and a book to issue.');
      return;
    }

    if (isLimitReached) {
      setErrorMessage(
        `Cannot issue: Student ${selectedStudent.name} has reached the maximum borrowing limit of ${selectedStudent.max_borrow_limit} books.`
      );
      return;
    }

    if (isBookUnavailable) {
      setErrorMessage(`Cannot issue: '${selectedBook.title}' has no copies currently available.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/transactions/issue', {
        student_id: selectedStudent.id,
        book_id: selectedBook.id,
        due_date: dueDate,
        notes,
      });

      const msg = res.data.message || 'Book issued successfully!';
      setSuccessMessage(msg);
      toast.success(`Successfully checked out '${selectedBook.title}' to ${selectedStudent.name}.`);
      // Update local state
      setSelectedBook(null);
      setSelectedStudent(null);
      setNotes('');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to issue book';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <BookmarkPlus className="w-6 h-6 text-blue-600" />
          Issue Book Workflow
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Validate student eligibility, check book stock, and execute automated loan checkout
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/transactions')}>
            View Transactions
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleIssue} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Student Selection Card */}
          <Card
            title="Step 1: Select Student"
            subtitle="Search by name, student number, or email"
            className="flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student directory..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Student Dropdown List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No students found</div>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudent?.id === s.id;
                    const atLimit = s.currently_borrowed >= s.max_borrow_limit;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.student_id} &bull; {s.department}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={atLimit ? 'danger' : 'primary'} size="sm">
                            {s.currently_borrowed}/{s.max_borrow_limit} borrowed
                          </Badge>
                          {s.outstanding_fines > 0 && (
                            <span className="text-[10px] text-rose-500 block mt-0.5">
                              ${s.outstanding_fines.toFixed(2)} fine
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Student Confirmation */}
              {selectedStudent && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      Selected Borrower
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedStudent.name} ({selectedStudent.student_id})
                    </div>
                  </div>
                  <Badge variant={isLimitReached ? 'danger' : 'success'} dot>
                    {isLimitReached ? 'Limit Reached' : 'Eligible'}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* 2. Book Selection Card */}
          <Card
            title="Step 2: Select Book"
            subtitle="Search available titles with active physical stock"
            className="flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by title, author, or ISBN..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Book List */}
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                {filteredBooks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No available books found</div>
                ) : (
                  filteredBooks.map((b) => {
                    const isSelected = selectedBook?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBook(b)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 max-w-[70%]">
                          <img
                            src={b.cover_url}
                            alt={b.title}
                            className="w-7 h-10 object-cover rounded shadow-xs flex-shrink-0"
                          />
                          <div className="truncate">
                            <div className="font-semibold truncate">{b.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {b.author_name} &bull; {b.category_name}
                            </div>
                          </div>
                        </div>
                        <Badge variant={b.available_copies > 0 ? 'success' : 'danger'} size="sm">
                          {b.available_copies} avail
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Book Confirmation */}
              {selectedBook && (
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      Selected Title
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate max-w-xs">
                      {selectedBook.title}
                    </div>
                  </div>
                  <Badge variant="success" dot>
                    {selectedBook.available_copies} copies
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Step 3: Dates & Confirmation */}
        <Card
          title="Step 3: Loan Terms & Due Date"
          subtitle="Standard 14-day borrowing duration with auto-calculated due date"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Checkout Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => handleIssueDateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date (Auto-calculated)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-blue-600 dark:text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Circulation Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Special course reserve loan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              A transaction will be logged and available stock decremented automatically.
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              disabled={!selectedStudent || !selectedBook || isLimitReached || isBookUnavailable}
              icon={<BookmarkPlus className="w-5 h-5" />}
            >
              Confirm & Issue Book
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
