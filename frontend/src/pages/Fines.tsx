import React, { useState, useEffect } from 'react';
import {
  BadgeAlert,
  Search,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Ban,
} from 'lucide-react';
import api from '../services/api';
import { Fine } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const Fines: React.FC = () => {
  const toast = useToast();
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Pay Modal
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');

  // Waive Modal
  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false);
  const [waiveReason, setWaiveReason] = useState('Medical absence excused');

  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'librarian';

  const fetchFines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '12',
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/fines?${params.toString()}`);
      setFines(res.data.fines);
      setTotalUnpaid(res.data.total_unpaid_sum);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [page, statusFilter]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    setSubmitting(true);
    try {
      await api.put(`/fines/${selectedFine.id}/pay`, {
        payment_method: paymentMethod,
        notes: payNotes,
      });
      setIsPayModalOpen(false);
      toast.success(`Payment of $${selectedFine.amount.toFixed(2)} collected successfully.`);
      fetchFines();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Payment collection failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    setSubmitting(true);
    try {
      await api.put(`/fines/${selectedFine.id}/waive`, {
        reason: waiveReason,
      });
      setIsWaiveModalOpen(false);
      toast.success(`Fine of $${selectedFine.amount.toFixed(2)} was waived.`);
      fetchFines();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Waiver failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BadgeAlert className="w-6 h-6 text-amber-500" />
            Overdue Penalty & Fine Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor accrued penalties, process payments, and record authorized fee waivers
          </p>
        </div>

        <div className="p-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            $
          </div>
          <div>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider block">
              Total Outstanding Unpaid Fines
            </span>
            <span className="text-lg font-extrabold text-amber-900 dark:text-amber-200">
              ${totalUnpaid.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-2">Status:</span>
        {['all', 'pending', 'paid', 'waived'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : fines.length === 0 ? (
        <EmptyState
          icon={BadgeAlert}
          title="No Fines Found"
          description="There are currently no fine records matching this filter."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Overdue Days</th>
                  <th className="px-4 py-3">Penalty Amount</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Method / Date</th>
                  {canManage && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <div>{f.student_name}</div>
                      <div className="text-[10px] text-slate-400">{f.student_number}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate">
                      {f.book_title || 'Catalog Book'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                      {f.late_days} days late
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-sm">
                      ${f.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={f.status === 'paid' ? 'success' : f.status === 'waived' ? 'neutral' : 'danger'}
                        dot
                      >
                        {f.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {f.payment_date ? (
                        <div>
                          <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                            {f.payment_method}
                          </span>
                          <div className="text-[10px] text-slate-400">{f.payment_date}</div>
                        </div>
                      ) : (
                        <span>Pending collection</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        {f.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedFine(f);
                                setIsPayModalOpen(true);
                              }}
                            >
                              Collect
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFine(f);
                                setIsWaiveModalOpen(true);
                              }}
                            >
                              Waive
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Fine Payment"
        maxWidth="sm"
      >
        <form onSubmit={handlePay} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Student:</span>
              <span className="font-semibold">{selectedFine?.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Due:</span>
              <span className="font-bold text-sm text-emerald-600">${selectedFine?.amount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="cash">Cash (Front Desk)</option>
              <option value="card">Credit / Debit Card</option>
              <option value="online">Online Student Portal</option>
              <option value="campus_card">Campus ID Card Balance</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Receipt / Transaction Note (Optional)
            </label>
            <input
              type="text"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="e.g. Receipt #4092"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Confirm Payment Received
            </Button>
          </div>
        </form>
      </Modal>

      {/* Waive Modal */}
      <Modal
        isOpen={isWaiveModalOpen}
        onClose={() => setIsWaiveModalOpen(false)}
        title="Authorize Fine Waiver"
        maxWidth="sm"
      >
        <form onSubmit={handleWaive} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Waiving the fine of <strong>${selectedFine?.amount.toFixed(2)}</strong> for{' '}
            <strong>{selectedFine?.student_name}</strong> will remove the debt without collecting payment.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Justification Reason *
            </label>
            <input
              type="text"
              required
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              placeholder="e.g. Health center medical excuse on file"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsWaiveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit" isLoading={submitting}>
              Authorize Waiver
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
