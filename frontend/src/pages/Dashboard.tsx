import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  BookmarkPlus,
  Users,
  AlertTriangle,
  Receipt,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { StatCardSkeleton } from '../components/ui/LoadingSkeleton';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, monthly_trends, category_distribution, popular_books, recent_transactions, overdue_transactions, student_stats } = stats;

  const isDark = theme === 'dark';

  const kpiCards = [
    {
      title: 'Total Titles',
      value: kpis.total_titles,
      sub: `${kpis.total_copies} total copies`,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Available Copies',
      value: kpis.available_copies,
      sub: `${kpis.utilization_rate}% in circulation`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Active Loans',
      value: kpis.issued_books,
      sub: 'Currently borrowed',
      icon: BookmarkPlus,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      title: 'Total Students',
      value: kpis.total_students,
      sub: 'Registered members',
      icon: Users,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/50',
    },
    {
      title: 'Overdue Books',
      value: kpis.overdue_books,
      sub: 'Action required',
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      highlight: kpis.overdue_books > 0,
    },
    {
      title: 'Outstanding Fines',
      value: `$${kpis.total_fines_unpaid.toFixed(2)}`,
      sub: 'Pending recovery',
      icon: Receipt,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome back, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.role === 'student' ? 'Student Knowledge Hub' : 'Library Operations & Intelligence'}
          </h1>
          <p className="mt-1 text-sm text-blue-100/90 leading-relaxed">
            {user?.role === 'student'
              ? 'Track your active book loans, review due dates, and search the university catalog.'
              : 'Real-time overview of circulation velocity, inventory distribution, and active student loans.'}
          </p>
        </div>

        {/* Decorative circular shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Student Quick Status Card if Student */}
      {student_stats && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-blue-600" />
            Your Current Loans & Quota
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500">Borrowed Books</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {student_stats.currently_borrowed} / {student_stats.max_limit}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500">Total Lifetime Borrows</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {student_stats.total_borrowed_history}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500">Unpaid Fines</span>
              <p className={`text-2xl font-bold mt-1 ${student_stats.unpaid_fines > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${student_stats.unpaid_fines.toFixed(2)}
              </p>
            </div>
          </div>

          {student_stats.active_loans.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {student_stats.active_loans.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{tx.book_title}</p>
                      <p className="text-xs text-slate-500">Due: {tx.due_date}</p>
                    </div>
                  </div>
                  <Badge variant={tx.status === 'overdue' ? 'danger' : 'primary'} dot>
                    {tx.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">You currently have no active book loans. Browse the catalog to borrow!</p>
          )}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all hover:shadow-md ${
                card.highlight
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity (2 cols) */}
        <Card
          title="Monthly Circulation Trends"
          subtitle="Comparison of books issued versus books returned over the past 6 months"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="issued" name="Issued" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" name="Returned" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution Donut (1 col) */}
        <Card title="Category Distribution" subtitle="Catalog titles classified by genre & subject">
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lower Row: Popular Books & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Books (1 col) */}
        <Card
          title="Most Borrowed Books"
          subtitle="Top titles in circulation"
          action={
            <button
              onClick={() => navigate('/books')}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-3.5">
            {popular_books.map((b, idx) => (
              <div
                key={b.id}
                onClick={() => navigate(`/books/${b.id}`)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <span className="w-5 text-center font-bold text-xs text-slate-400">#{idx + 1}</span>
                <img
                  src={b.cover_url}
                  alt={b.title}
                  className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{b.author_name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge size="sm" variant="secondary">
                      {b.category_name}
                    </Badge>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{b.borrow_count}</span>
                  <span className="text-[10px] text-slate-400 block">borrows</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions & Overdue alert (2 cols) */}
        <Card
          title="Recent Circulation Activity"
          subtitle="Latest checkout and return records"
          action={
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              All Transactions <ArrowRight className="w-3 h-3" />
            </button>
          }
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">Student</th>
                  <th className="px-3 py-2.5">Book Title</th>
                  <th className="px-3 py-2.5">Due Date</th>
                  <th className="px-3 py-2.5 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recent_transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                      <div>{tx.student_name}</div>
                      <div className="text-[10px] text-slate-400">{tx.student_number}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                      {tx.book_title}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{tx.due_date}</td>
                    <td className="px-3 py-3">
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
        </Card>
      </div>
    </div>
  );
};
