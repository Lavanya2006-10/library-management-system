import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  BookOpen,
  User,
  ArrowRight,
} from 'lucide-react';
import api, { downloadFile } from '../services/api';
import { Transaction } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const Transactions: React.FC = () => {
  const toast = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '12',
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      toast.info('Preparing transactions audit log export...');
      await downloadFile('/reports/export-csv?type=transactions', 'nexus_transactions_audit.csv');
      toast.success('Transactions audit log exported successfully.');
    } catch (err) {
      toast.error('Failed to export transactions log');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-blue-600" />
            Circulation Transactions Audit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical and active record log of checkout issues, due schedules, and returns ({total} total records)
          </p>
        </div>

        {!isStudent && (
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            isLoading={exporting}
            onClick={handleExportCSV}
          >
            Export Audit Log (CSV)
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">Filter Status:</span>
          {['all', 'borrowed', 'returned', 'overdue'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No Transactions Found"
          description="There are currently no transaction records under this filter."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tx ID</th>
                  <th className="px-4 py-3">Borrower</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Penalty Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">#TX-{tx.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <div>{tx.student_name}</div>
                      <div className="text-[10px] text-slate-400">{tx.student_number}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate">
                      {tx.book_title}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{tx.issue_date}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {tx.due_date}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{tx.return_date || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          tx.status === 'borrowed'
                            ? 'primary'
                            : tx.status === 'overdue'
                            ? 'danger'
                            : 'success'
                        }
                        dot
                        size="sm"
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {tx.fine ? (
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span
                            className={
                              tx.fine.status === 'paid'
                                ? 'text-emerald-600'
                                : tx.fine.status === 'waived'
                                ? 'text-slate-400 line-through'
                                : 'text-rose-600'
                            }
                          >
                            ${tx.fine.amount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">({tx.fine.status})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
    </div>
  );
};
