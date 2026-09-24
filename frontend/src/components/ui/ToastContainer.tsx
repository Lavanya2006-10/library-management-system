import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, ToastType } from '../../context/ToastContext';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900',
  error: 'border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-900',
  warning: 'border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-900',
  info: 'border-blue-200 dark:border-blue-800/60 bg-white dark:bg-slate-900',
};

const indicatorStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${borderStyles[toast.type]} transition-all duration-300 transform translate-y-0 opacity-100 relative overflow-hidden`}
          role="alert"
        >
          {/* Top colored accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${indicatorStyles[toast.type]}`} />

          <div className="mt-0.5">{icons[toast.type]}</div>

          <div className="flex-1 min-w-0 pr-1">
            {toast.title && (
              <h4 className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                {toast.title}
              </h4>
            )}
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
