import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-xl shadow-rose-500/10">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Something unexpected occurred
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
            The application encountered an unhandled view error. Your session data is intact.
          </p>

          {this.state.error && (
            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left max-w-lg w-full font-mono text-xs text-rose-600 dark:text-rose-400 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" icon={<RotateCcw className="w-4 h-4" />} onClick={this.handleReload}>
              Reload App
            </Button>
            <Button variant="primary" icon={<Home className="w-4 h-4" />} onClick={this.handleGoHome}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
