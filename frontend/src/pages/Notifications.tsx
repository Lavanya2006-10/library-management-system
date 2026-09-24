import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  CheckCheck,
} from 'lucide-react';
import api from '../services/api';
import { NotificationItem } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time library alerts, due date reminders, and activity dispatches ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! There are no active notices or alerts for your account."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isAlert = n.type === 'overdue' || n.type === 'alert';
            const isSuccess = n.type === 'success';

            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkSingleRead(n.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  !n.is_read
                    ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900 shadow-sm ring-1 ring-blue-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-85'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isAlert
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                      : isSuccess
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                  }`}
                >
                  {isAlert ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400">
                        {new Date(n.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
