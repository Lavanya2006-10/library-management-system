import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  BookOpen,
  BookmarkPlus,
  RotateCcw,
  AlertTriangle,
  Receipt,
  Users,
} from 'lucide-react';
import api, { downloadFile } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Reports: React.FC = () => {
  const toast = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('books');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/reports/summary');
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      toast.info(`Preparing ${type.toUpperCase()} CSV export...`);
      await downloadFile(`/reports/export-csv?type=${type}`, `nexus_${type}_export.csv`);
      toast.success(`${type.toUpperCase()} export completed.`);
    } catch (err: any) {
      toast.error('Failed to export report CSV');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Executive Reports & Data Exports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregate institutional statistics, circulation metrics, and download audit-ready CSV exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Report
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            isLoading={exporting}
            onClick={() => handleExport(reportType)}
          >
            Export Selected (CSV)
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Overview */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Total Titles</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{summary.total_books}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Active Borrowed</span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {summary.borrowed_books}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Total Returned</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {summary.returned_books}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Overdue Titles</span>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {summary.overdue_books}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Registered Students</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {summary.total_students}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400">Fines Collected</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${summary.fines_collected.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Export Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Catalog Inventory Report"
          subtitle="Full list of titles, authors, categories, ISBNs, shelf locations, and copies"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Export complete metadata of physical inventory including available vs total stock counts.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExport('books')}
            >
              Download Books Catalog (.csv)
            </Button>
          </div>
        </Card>

        <Card
          title="Circulation & Loan History Report"
          subtitle="Audit trail of checkouts, active borrowings, return timestamps, and late days"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Detailed breakdown of all borrowing operations indexed by borrower student and book title.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExport('transactions')}
            >
              Download Transactions Log (.csv)
            </Button>
          </div>
        </Card>

        <Card
          title="Overdue Penalties & Fines Ledger"
          subtitle="Comprehensive financial breakdown of pending, collected, and waived fees"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Itemized ledger of overdue penalty fines generated with settlement timestamps and methods.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExport('fines')}
            >
              Download Fines Ledger (.csv)
            </Button>
          </div>
        </Card>

        <Card
          title="Student Roster & Activity Report"
          subtitle="Directory of enrolled student library members and their current loan statuses"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Membership directory with student IDs, departments, year of study, and active borrow counts.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExport('students')}
            >
              Download Student Directory (.csv)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
