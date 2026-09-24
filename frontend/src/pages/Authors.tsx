import React, { useState, useEffect } from 'react';
import { Feather, Plus, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Author } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';

export const Authors: React.FC = () => {
  const toast = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [deleteAuthor, setDeleteAuthor] = useState<Author | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/authors');
      setAuthors(res.data.authors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setBiography('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (author: Author) => {
    setIsEditing(true);
    setEditId(author.id);
    setName(author.name);
    setBiography(author.biography || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isEditing && editId) {
        await api.put(`/authors/${editId}`, { name, biography });
        toast.success(`Author '${name}' updated successfully.`);
      } else {
        await api.post('/authors', { name, biography });
        toast.success(`Author '${name}' added to directory.`);
      }
      setIsModalOpen(false);
      fetchAuthors();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save author';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (author: Author) => {
    setDeleteAuthor(author);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAuthor) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/authors/${deleteAuthor.id}`);
      toast.success(`Author '${deleteAuthor.name}' removed from directory.`);
      setDeleteAuthor(null);
      fetchAuthors();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete author';
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Authors Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered literary authors, contributors, and publication histories
          </p>
        </div>
        {canManage && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Add Author
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading authors...</div>
      ) : authors.length === 0 ? (
        <EmptyState
          icon={Feather}
          title="No Authors"
          description="No authors have been added to the library database yet."
          actionLabel={canManage ? 'Add Author' : undefined}
          onAction={canManage ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                    {author.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {author.books_count || 0} books
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{author.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {author.biography || 'No biography recorded for this author.'}
                </p>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(author)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(author)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Author' : 'Add New Author'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Donald Knuth"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Biography
            </label>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Short bio or notable research works..."
            />
          </div>
          <div className="pt-3 flex items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              Save Author
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Author Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteAuthor !== null}
        onClose={() => setDeleteAuthor(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteSubmitting}
        title="Delete Author"
        message={
          deleteAuthor ? (
            <span>
              Are you sure you want to delete author <strong>"{deleteAuthor.name}"</strong>? Any books attributed to this author should be re-associated.
            </span>
          ) : (
            'Are you sure you want to delete this author?'
          )
        }
        confirmText="Delete Author"
        variant="danger"
      />
    </div>
  );
};
