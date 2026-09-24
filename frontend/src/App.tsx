import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { BookDetail } from './pages/BookDetail';
import { Students } from './pages/Students';
import { Authors } from './pages/Authors';
import { Categories } from './pages/Categories';
import { IssueBook } from './pages/IssueBook';
import { ReturnBook } from './pages/ReturnBook';
import { Transactions } from './pages/Transactions';
import { Fines } from './pages/Fines';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { Role } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: Role[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <ToastContainer />
              <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="books" element={<Books />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="authors"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <Authors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="issue-book"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <IssueBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="return-book"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <ReturnBook />
                  </ProtectedRoute>
                }
              />
              <Route path="transactions" element={<Transactions />} />
              <Route path="fines" element={<Fines />} />
              <Route path="notifications" element={<Notifications />} />
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'librarian']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
</ErrorBoundary>
  );
};

export default App;
