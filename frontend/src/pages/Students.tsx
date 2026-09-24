import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookmarkPlus,
  Receipt,
  Mail,
  Phone,
  GraduationCap,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import api from '../services/api';
import { Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const Students: React.FC = () => {
  const toast = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Profile Drawer / Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Add / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formDept, setFormDept] = useState('Information Technology');
  const [formYear, setFormYear] = useState(1);
  const [formPhone, setFormPhone] = useState('');
  const [formLimit, setFormLimit] = useState(3);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '10',
      });
      if (search) params.append('q', search);
      if (selectedDept && selectedDept !== 'all') params.append('department', selectedDept);

      const res = await api.get(`/students?${params.toString()}`);
      setStudents(res.data.students);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedDept]);

  const handleOpenProfile = async (id: number) => {
    setIsProfileModalOpen(true);
    setProfileLoading(true);
    try {
      const res = await api.get(`/students/${id}`);
      setSelectedStudent(res.data.student);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormName('');
    setFormEmail('');
    setFormStudentId('');
    setFormDept('Information Technology');
    setFormYear(1);
    setFormPhone('');
    setFormLimit(3);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (stu: Student) => {
    setIsEditing(true);
    setEditId(stu.id);
    setFormName(stu.name);
    setFormEmail(stu.email);
    setFormStudentId(stu.student_id);
    setFormDept(stu.department);
    setFormYear(stu.year);
    setFormPhone(stu.phone || '');
    setFormLimit(stu.max_borrow_limit);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const payload = {
        name: formName,
        email: formEmail,
        student_id: formStudentId,
        department: formDept,
        year: Number(formYear),
        phone: formPhone,
        max_borrow_limit: Number(formLimit),
      };

      if (isEditing && editId) {
        await api.put(`/students/${editId}`, payload);
        toast.success(`Student profile for ${formName} updated successfully.`);
      } else {
        await api.post('/students', payload);
        toast.success(`Student ${formName} registered successfully.`);
      }

      setIsFormModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save student record';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = (stu: Student) => {
    setDeleteTarget(stu);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      toast.success(`Student record for ${deleteTarget.name} has been removed.`);
      setDeleteTarget(null);
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to delete student';
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student registrations, loan quotas, and overdue fines ({total} active members)
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
            Register Student
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Departments</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
            <option value="Electronics & Communication Eng">Electronics & Communication Eng</option>
            <option value="Electrical & Electronics Eng">Electrical & Electronics Eng</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Mechatronics Engineering">Mechatronics Engineering</option>
            <option value="Biomedical Engineering">Biomedical Engineering</option>
            <option value="Chemical Engineering">Chemical Engineering</option>
            <option value="Automobile Engineering">Automobile Engineering</option>
            <option value="Food Technology">Food Technology</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="No student records match your query or filter parameters."
          actionLabel={canManage ? 'Add Student' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Department & Year</th>
                  <th className="px-4 py-3">Active Loans</th>
                  <th className="px-4 py-3">Fines</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm shadow-blue-500/20 uppercase tracking-wide">
                          {stu.name ? stu.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'ST'}
                        </div>
                        <div>
                          <button
                            onClick={() => handleOpenProfile(stu.id)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 text-left"
                          >
                            {stu.name}
                          </button>
                          <div className="text-[11px] text-slate-400">{stu.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {stu.student_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 dark:text-white font-medium">{stu.department}</div>
                      <div className="text-[11px] text-slate-400">Year {stu.year}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          stu.currently_borrowed >= stu.max_borrow_limit ? 'warning' : 'primary'
                        }
                        size="sm"
                      >
                        {stu.currently_borrowed} / {stu.max_borrow_limit} books
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {stu.outstanding_fines > 0 ? (
                        <Badge variant="danger" size="sm" dot>
                          ${stu.outstanding_fines.toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          Clear
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenProfile(stu.id)}
                          className="text-blue-600"
                        >
                          Profile
                        </Button>
                        {canManage && (
                          <button
                            onClick={() => handleOpenEditModal(stu)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleDelete(stu)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete Student"
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">
            Page {page} of {pages}
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

      {/* Student Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Student Profile & Circulation History"
        maxWidth="2xl"
      >
        {profileLoading || !selectedStudent ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading student records...</div>
        ) : (
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudent.student_id} &bull; {selectedStudent.email}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    {selectedStudent.department} (Year {selectedStudent.year})
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                <span className="text-xs text-slate-400 block">Outstanding Fines</span>
                <span
                  className={`text-lg font-bold ${
                    selectedStudent.outstanding_fines > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  ${selectedStudent.outstanding_fines.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Currently Borrowed Books */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Currently Borrowed Books ({selectedStudent.active_loans?.length || 0})
              </h4>
              {selectedStudent.active_loans && selectedStudent.active_loans.length > 0 ? (
                <div className="space-y-2">
                  {selectedStudent.active_loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {loan.book_title}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Issued: {loan.issue_date} &bull; Due: {loan.due_date}
                        </div>
                      </div>
                      <Badge variant={loan.status === 'overdue' ? 'danger' : 'primary'} dot>
                        {loan.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  No active loans currently checked out.
                </p>
              )}
            </div>

            {/* Fines */}
            {selectedStudent.fines && selectedStudent.fines.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  Recorded Fines
                </h4>
                <div className="space-y-1.5">
                  {selectedStudent.fines.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ${f.amount.toFixed(2)}
                        </span>
                        <span className="text-slate-400 ml-2">({f.late_days} days late)</span>
                        {f.notes && <p className="text-[10px] text-slate-500">{f.notes}</p>}
                      </div>
                      <Badge
                        variant={
                          f.status === 'paid' ? 'success' : f.status === 'waived' ? 'neutral' : 'danger'
                        }
                      >
                        {f.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Student Profile' : 'Register New Student'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Liam Miller"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              University Email *
            </label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="student@university.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student ID Number
            </label>
            <input
              type="text"
              value={formStudentId}
              onChange={(e) => setFormStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Leave blank for auto-generated STU..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication Eng">Electronics & Communication Eng</option>
                <option value="Electrical & Electronics Eng">Electrical & Electronics Eng</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Mechatronics Engineering">Mechatronics Engineering</option>
                <option value="Biomedical Engineering">Biomedical Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Food Technology">Food Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year of Study
              </label>
              <select
                value={formYear}
                onChange={(e) => setFormYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Borrow Limit
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formLimit}
                onChange={(e) => setFormLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={formSubmitting}>
              {isEditing ? 'Update Student' : 'Register'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Student Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteSubmitting}
        title="Remove Student Profile"
        message={
          deleteTarget ? (
            <span>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.student_id})? If they have active loans or pending fines, deletion will be safely restricted.
            </span>
          ) : (
            'Are you sure you want to delete this student?'
          )
        }
        confirmText="Delete Student"
        variant="danger"
      />
    </div>
  );
};
