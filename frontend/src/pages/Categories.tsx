import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';

export const Categories: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorCode, setColorCode] = useState('#2563EB');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setDescription('');
    setColorCode('#2563EB');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setIsEditing(true);
    setEditId(c.id);
    setName(c.name);
    setDescription(c.description || '');
    setColorCode(c.color_code || '#2563EB');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isEditing && editId) {
        await api.put(`/categories/${editId}`, { name, description, color_code: colorCode });
        toast.success(`Category '${name}' updated successfully.`);
      } else {
        await api.post('/categories', { name, description, color_code: colorCode });
        toast.success(`Category '${name}' created successfully.`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save category';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (c: Category) => {
    setDeleteCategory(c);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategory) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/categories/${deleteCategory.id}`);
      toast.success(`Category '${deleteCategory.name}' removed.`);
      setDeleteCategory(null);
      fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete category';
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
            Book Categories & Genres
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize catalog inventory into distinct disciplines, themes, and departments
          </p>
        </div>
        {canManage && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
            Add Category
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading categories...</div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No Categories"
          description="No categories have been created yet."
          actionLabel={canManage ? 'Add Category' : undefined}
          onAction={canManage ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
            >
              {/* Color Stripe Top */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: c.color_code || '#2563EB' }}
              />

              <div>
                <div className="flex items-center justify-between mb-2 mt-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs"
                    style={{ backgroundColor: c.color_code || '#2563EB' }}
                  />
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    {c.books_count || 0} titles
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1">{c.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {c.description || 'General collection category.'}
                </p>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
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
        title={isEditing ? 'Edit Category' : 'Create New Category'}
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
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Artificial Intelligence"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Description of the category..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5"
              />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{colorCode}</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCategory !== null}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteSubmitting}
        title="Delete Category"
        message={
          deleteCategory ? (
            <span>
              Are you sure you want to delete category <strong>"{deleteCategory.name}"</strong>? Books currently belonging to this category will need re-assignment.
            </span>
          ) : (
            'Are you sure you want to delete this category?'
          )
        }
        confirmText="Delete Category"
        variant="danger"
      />
    </div>
  );
};
