import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, User, Sparkles, Folder, ArrowRight, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    books: any[];
    students: any[];
    authors: any[];
    categories: any[];
  }>({ books: [], students: [], authors: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ books: [], students: [], authors: [], categories: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ books: [], students: [], authors: [], categories: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search/global?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data.results);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.books.length + results.students.length + results.authors.length + results.categories.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-2xl transform divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
        {/* Search Input Box */}
        <div className="relative flex items-center px-4 py-3.5">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="h-10 w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-base"
            placeholder="Search books, ISBN, authors, students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-3 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {query.trim().length >= 2 && !loading && totalResults === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              No results found for &ldquo;{query}&rdquo;. Try another title, author, or student name.
            </div>
          )}

          {/* Quick Suggestions when empty */}
          {!query && (
            <div className="p-2 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => {
                    navigate('/books');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Book className="w-4 h-4 text-blue-500" /> Browse All Books
                </button>
                <button
                  onClick={() => {
                    navigate('/issue-book');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-500" /> Issue Book
                </button>
                <button
                  onClick={() => {
                    navigate('/students');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <User className="w-4 h-4 text-purple-500" /> Student Directory
                </button>
                <button
                  onClick={() => {
                    navigate('/fines');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" /> Manage Fines
                </button>
              </div>
            </div>
          )}

          {/* Books Results */}
          {results.books.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                Books ({results.books.length})
              </div>
              <div className="space-y-1">
                {results.books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      navigate(`/books/${book.id}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-11 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0 shadow-sm">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <Book className="w-4 h-4 m-auto text-slate-400 mt-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {book.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          by {book.author_name} &bull; ISBN: {book.isbn}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {book.available_copies > 0 ? `${book.available_copies} avail` : 'Unavailable'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students Results */}
          {results.students.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                Students ({results.students.length})
              </div>
              <div className="space-y-1">
                {results.students.map((stu) => (
                  <button
                    key={stu.id}
                    onClick={() => {
                      navigate(`/students?highlight=${stu.id}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold">
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {stu.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {stu.student_id} &bull; {stu.department}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {stu.currently_borrowed} borrowed
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories Results */}
          {results.categories.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                Categories
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-1">
                {results.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/books?category_id=${c.id}`);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Folder className="w-3.5 h-3.5 text-blue-500" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span>Smart Global Search</span>
        </div>
      </div>
    </div>
  );
};
