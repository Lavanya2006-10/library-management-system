import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Search,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  DollarSign,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { Transaction } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const ReturnBook: React.FC = () => {
  const toast = useToast();
  const [activeLoans, setActiveLoans] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Transaction | null>(null);

  const [returnNotes, setReturnNotes] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'warning'; text: string } | null>(
    null
  );

  const navigate = useNavigate();

  const fetchActiveLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions/active-loans');
      setActiveLoans(res.data.active_loans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const filteredLoans = activeLoans.filter(
    (loan) =>
      loan.student_name.toLowerCase().includes(search.toLowerCase()) ||
      loan.student_number.toLowerCase().includes(search.toLowerCase()) ||
      loan.book_title.toLowerCase().includes(search.toLowerCase()) ||
      loan.book_isbn.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate live preview for selected loan
  const today = new Date().toISOString().split('T')[0];
  const lateDays = selectedLoan
    ? Math.max(0, Math.floor((new Date(today).getTime() - new Date(selectedLoan.due_date).getTime()) / (1000 * 3600 * 24)))
    : 0;
  const estimatedFine = lateDays * 1.5; // $1.50 per day

  const handleReturn = async () => {
    if (!selectedLoan) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/transactions/${selectedLoan.id}/return`, {
        notes: returnNotes,
      });

      setIsConfirmModalOpen(false);
      const fineMsg = res.data.fine_message;
      const finalMsg = fineMsg
        ? `${res.data.message}. ${fineMsg}`
        : res.data.message || 'Book returned on time without fines.';

      setResultMessage({
        type: fineMsg ? 'warning' : 'success',
        text: finalMsg,
      });

      if (fineMsg) {
        toast.warning(finalMsg);
      } else {
        toast.success(finalMsg);
      }

      setSelectedLoan(null);
      setReturnNotes('');
      fetchActiveLoans();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to process return';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <RotateCcw className="w-6 h-6 text-emerald-600" />
          Process Book Returns
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select an active checkout to check-in, calculate overdue duration, and assess penalty fines
        </p>
      </div>

      {resultMessage && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center justify-between shadow-sm ${
            resultMessage.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultMessage.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            )}
            <span>{resultMessage.text}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/transactions')}>
            View Transactions
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Loans Selector */}
        <Card
          title="Active Checked-Out Loans"
          subtitle={`Select a loan record to process (${activeLoans.length} books in circulation)`}
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search active loans by student or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading active loans...</div>
            ) : filteredLoans.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active loans match your search.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-h-[460px] overflow-y-auto">
                {filteredLoans.map((loan) => {
                  const isSelected = selectedLoan?.id === loan.id;
                  const isOverdue = loan.status === 'overdue';
                  return (
                    <div
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={loan.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                          alt={loan.book_title}
                          className="w-8 h-12 object-cover rounded shadow-xs flex-shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-sm">
                            {loan.book_title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Borrower: <span className="font-semibold text-slate-700 dark:text-slate-300">{loan.student_name}</span> ({loan.student_number})
                          </p>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Due: {loan.due_date} &bull; Checked out: {loan.issue_date}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant={isOverdue ? 'danger' : 'primary'} dot size="sm">
                          {isOverdue ? `${loan.late_days}d OVERDUE` : 'ACTIVE LOAN'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Right 1 Col: Live Fine & Return Assessment Preview */}
        <Card
          title="Return Summary & Assessment"
          subtitle="Instant fine calculations and stock restoration"
        >
          {selectedLoan ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedLoan.student_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Book Title:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                    {selectedLoan.book_title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Checkout Date:</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedLoan.issue_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Due:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {selectedLoan.due_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Return Date:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">Today ({today})</span>
                </div>
              </div>

              {/* Late & Fine calculation box */}
              <div
                className={`p-4 rounded-xl border ${
                  lateDays > 0
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>Overdue Duration:</span>
                  <span>{lateDays > 0 ? `${lateDays} days late` : 'On Time'}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold mt-2 pt-2 border-t border-current/20">
                  <span>Calculated Fine:</span>
                  <span>${estimatedFine.toFixed(2)}</span>
                </div>
                <p className="text-[11px] opacity-80 mt-1">
                  Formula: {lateDays} overdue day(s) &times; $1.50/day
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Return Condition Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Excellent condition, no damages"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Confirm Return & Check-in
              </Button>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              <RotateCcw className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              Select a loan from the list on the left to review return details.
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Book Return"
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to mark <strong>{selectedLoan?.book_title}</strong> returned by{' '}
            <strong>{selectedLoan?.student_name}</strong>?
          </p>
          {lateDays > 0 && (
            <p className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              ⚠️ An automated overdue fine of ${estimatedFine.toFixed(2)} will be assigned to this student.
            </p>
          )}
          <div className="pt-3 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submitting}
              onClick={handleReturn}
            >
              Confirm Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
