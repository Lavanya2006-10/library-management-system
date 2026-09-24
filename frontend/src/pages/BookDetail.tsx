import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  Building,
  BookmarkPlus,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.book);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading book details...</div>;
  }

  if (!book) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-base text-slate-600 dark:text-slate-300">Book not found.</p>
        <Button variant="outline" onClick={() => navigate('/books')}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/books')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      {/* Main Info Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover image */}
          <div className="w-full md:w-64 h-80 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800">
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{book.category_name}</Badge>
                <Badge variant={book.available_copies > 0 ? 'success' : 'danger'} dot>
                  {book.available_copies > 0 ? `${book.available_copies} Copies Available` : 'Out of Stock'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {book.title}
              </h1>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                by {book.author_name}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">ISBN</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {book.isbn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Publisher</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {book.publisher || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Year</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {book.publication_year || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Shelf Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {book.shelf_location}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <h4 className="font-semibold text-slate-900 dark:text-white">Synopsis & Abstract</h4>
                <p>{book.description || 'No detailed description available for this title.'}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              {canManage && book.available_copies > 0 && (
                <Button
                  variant="primary"
                  icon={<BookmarkPlus className="w-4 h-4" />}
                  onClick={() => navigate(`/issue-book?book_id=${book.id}`)}
                >
                  Issue This Book
                </Button>
              )}
              {canManage && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/transactions?book_id=${book.id}`)}
                >
                  View All Transaction Records
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Circulation History Table */}
      {canManage && (
        <Card
          title="Recent Borrowing History"
          subtitle="Past circulation transactions for this specific title"
        >
          {book.history && book.history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Student</th>
                    <th className="px-3 py-2.5">Issued Date</th>
                    <th className="px-3 py-2.5">Due Date</th>
                    <th className="px-3 py-2.5">Returned Date</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {book.history.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
                        {tx.student_name} ({tx.student_number})
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{tx.issue_date}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{tx.due_date}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                        {tx.return_date || '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            tx.status === 'borrowed'
                              ? 'primary'
                              : tx.status === 'overdue'
                              ? 'danger'
                              : 'success'
                          }
                          dot
                        >
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No borrowing history recorded yet for this book.
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
