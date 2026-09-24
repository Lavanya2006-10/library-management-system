import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-lg mb-4">
        <BookX className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-2 leading-relaxed">
        The requested library page or resource does not exist or may have been relocated.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" size="sm" icon={<Home className="w-4 h-4" />} onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
