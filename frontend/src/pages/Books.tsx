import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  BookmarkPlus,
  Layers,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { Book, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TableSkeleton, CardGridSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const Books: React.FC = () => {
  const toast = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState<number | ''>(2024);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalCopies, setTotalCopies] = useState<number>(3);
  const [shelfLocation, setShelfLocation] = useState('Main Stacks A-1');

  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '12',
        sort_by: sortBy,
      });
      if (search) params.append('q', search);
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await api.get(`/books?${params.toString()}`);
      setBooks(res.data.books);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Failed to load books', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, search, selectedCategory, selectedStatus, sortBy]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentBookId(null);
    setTitle('');
    setIsbn('');
    setAuthorName('');
    setCategoryName(categories[0]?.name || 'Computer Science');
    setPublisher('');
    setPublicationYear(2024);
    setDescription('');
    setCoverUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
    setTotalCopies(3);
    setShelfLocation('Main Stacks A-1');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setIsEditing(true);
    setCurrentBookId(book.id);
    setTitle(book.title);
    setIsbn(book.isbn);
    setAuthorName(book.author_name);
    setCategoryName(book.category_name);
    setPublisher(book.publisher || '');
    setPublicationYear(book.publication_year || '');
    setDescription(book.description || '');
    setCoverUrl(book.cover_url || '');
    setTotalCopies(book.total_copies);
    setShelfLocation(book.shelf_location);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const payload = {
        title,
        isbn,
        author_name: authorName,
        category_name: categoryName,
        publisher,
        publication_year: publicationYear ? Number(publicationYear) : null,
        description,
        cover_url: coverUrl,
        total_copies: Number(totalCopies),
        shelf_location: shelfLocation,
      };

      if (isEditing && currentBookId) {
        await api.put(`/books/${currentBookId}`, payload);
        toast.success(`'${title}' was updated successfully.`);
      } else {
        await api.post('/books', payload);
        toast.success(`'${title}' was added to the catalog.`);
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save book record';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await api.delete(`/books/${id}`);
      setDeleteConfirmId(null);
      toast.success('Book title deleted from catalog.');
      fetchBooks();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete book';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Book Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and manage university library inventory ({total} titles)
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
            Add New Book
          </Button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable (0 copies)</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="year_desc">Year (Newest First)</option>
              <option value="copies_desc">Most Copies Available</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Listings */}
      {loading ? (
        viewMode === 'grid' ? <CardGridSkeleton count={8} /> : <TableSkeleton rows={8} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Books Found"
          description="Try broadening your search terms or clearing the selected filters."
          actionLabel={canManage ? 'Add a Book' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col group"
            >
              {/* Cover Image Container */}
              <div
                className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={book.available_copies > 0 ? 'success' : 'danger'} dot size="sm">
                    {book.available_copies > 0 ? `${book.available_copies} Available` : 'Unavailable'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="secondary" size="sm">
                    {book.category_name}
                  </Badge>
                </div>
              </div>

              {/* Book Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">by {book.author_name}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      ISBN: {book.isbn.substring(0, 10)}...
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {book.shelf_location.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      {book.available_copies > 0 && (
                        <button
                          onClick={() => navigate(`/issue-book?book_id=${book.id}`)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Issue This Book"
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(book.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3">Shelf</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-8 h-12 object-cover rounded shadow-xs flex-shrink-0"
                        />
                        <div
                          onClick={() => navigate(`/books/${book.id}`)}
                          className="font-medium text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer line-clamp-1 max-w-xs"
                        >
                          {book.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.author_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" size="sm">
                        {book.category_name}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{book.isbn}</td>
                    <td className="px-4 py-3 text-slate-500">{book.shelf_location}</td>
                    <td className="px-4 py-3">
                      <Badge variant={book.available_copies > 0 ? 'success' : 'danger'} dot size="sm">
                        {book.available_copies} / {book.total_copies}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && book.available_copies > 0 && (
                          <button
                            onClick={() => navigate(`/issue-book?book_id=${book.id}`)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Issue"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => setDeleteConfirmId(book.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">
            Page {page} of {pages} ({total} total books)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Book Details' : 'Add New Book to Catalog'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Clean Architecture"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ISBN *
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="978-0134494166"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Author Name *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Robert C. Martin"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                list="category-suggestions"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Select or type category"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Prentice Hall"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Publication Year
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="2017"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Copies
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shelf Location
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Stack CS-106"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Abstract
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Brief synopsis of the book..."
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={formSubmitting}>
              {isEditing ? 'Save Changes' : 'Add Book'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteBook(deleteConfirmId)}
        title="Delete Book from Catalog"
        message="Are you sure you want to permanently remove this book title? If there are active loans, deletion will be blocked by the server to protect transaction history."
        confirmText="Delete Title"
        variant="danger"
      />
    </div>
  );
};
