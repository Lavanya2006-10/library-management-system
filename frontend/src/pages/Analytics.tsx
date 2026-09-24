import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  CheckCircle,
  AlertOctagon,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/ui/Card';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading library intelligence...</div>;
  }

  const { monthly_trends, category_distribution, popular_books, kpis } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Circulation Analytics & Intelligence
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Deep telemetry metrics, volume velocity, and inventory utilization analytics
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Inventory Utilization</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {kpis.utilization_rate}%
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Healthy collection turnover</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">On-Time Return Rate</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {kpis.issued_books > 0
                ? `${Math.round(((kpis.issued_books - kpis.overdue_books) / kpis.issued_books) * 100)}%`
                : '100%'}
            </div>
            <span className="text-[10px] text-slate-400">Borrowers returning by due date</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Overdue Rate</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-0.5">
              {kpis.issued_books > 0
                ? `${Math.round((kpis.overdue_books / kpis.issued_books) * 100)}%`
                : '0%'}
            </div>
            <span className="text-[10px] text-slate-400">{kpis.overdue_books} overdue titles</span>
          </div>
        </div>
      </div>

      {/* Full Width Area Chart */}
      <Card
        title="6-Month Borrowing Trajectory"
        subtitle="Historical trend of student checkouts over time"
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="issued"
                name="Books Issued"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIssued)"
              />
              <Area
                type="monotone"
                dataKey="returned"
                name="Books Returned"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReturned)"
              />
              <Legend verticalAlign="top" height={36} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Popular Books Chart */}
      <Card
        title="Top Titles by Total Circulation"
        subtitle="Most checked-out books across all semesters"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={popular_books.map((b) => ({
                name: b.title.length > 25 ? b.title.substring(0, 22) + '...' : b.title,
                borrows: b.borrow_count,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
              <XAxis type="number" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
              <YAxis type="category" dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} width={150} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="borrows" fill="#7C3AED" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
