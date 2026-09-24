import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, ArrowRight, Shield, BookOpen, GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Role } from '../types';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [year, setYear] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, demoLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, 'student', department, year);
        toast.success('Your student account has been created successfully! Welcome to Nexus.');
      } else {
        await login(email, password);
        toast.success('Successfully logged into Nexus Smart Library.');
      }
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Backend server is not reachable. Please make sure "python run.py" is running in your backend terminal!'
          : err.message || 'Authentication failed. Please check your credentials.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setError('');
    setIsLoading(true);
    try {
      await demoLogin(role);
      toast.success(`Welcome to the ${role.toUpperCase()} workspace demonstration!`);
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Backend server is not reachable. Please make sure "python run.py" is running in your backend terminal!'
          : err.message || 'Demo login failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/50 dark:from-blue-900/20 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 mb-4">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Nexus Smart Library
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Next-generation intelligent library management & analytics platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800">
          {/* Quick Demo Switcher */}
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
              1-Click Demo Logins
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 transition-all text-center group"
              >
                <Shield className="w-4 h-4 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Admin (Lavanya)</span>
                <span className="text-[10px] text-slate-400">Chief Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('librarian')}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 transition-all text-center group"
              >
                <BookOpen className="w-4 h-4 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Librarian (Lavanya)</span>
                <span className="text-[10px] text-slate-400">Head Librarian</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-700 transition-all text-center group"
              >
                <GraduationCap className="w-4 h-4 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Student (Lavanya S)</span>
                <span className="text-[10px] text-slate-400">B.Tech IT</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs uppercase font-medium text-slate-400">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Jordan Miller"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="name@university.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Information Technology">Information Technology (B.Tech IT)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (B.E. CSE)</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (B.Tech AI-DS)</option>
                    <option value="Electronics & Communication Eng">Electronics & Communication Eng (B.E. ECE)</option>
                    <option value="Electrical & Electronics Eng">Electrical & Electronics Eng (B.E. EEE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (B.E. MECH)</option>
                    <option value="Civil Engineering">Civil Engineering (B.E. CIVIL)</option>
                    <option value="Mechatronics Engineering">Mechatronics Engineering (B.E. MTS)</option>
                    <option value="Biomedical Engineering">Biomedical Engineering (B.E. BME)</option>
                    <option value="Chemical Engineering">Chemical Engineering (B.Tech CHEM)</option>
                    <option value="Automobile Engineering">Automobile Engineering (B.E. AUTO)</option>
                    <option value="Food Technology">Food Technology (B.Tech FT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span>{isRegister ? 'Create Student Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isRegister ? 'Sign in instead' : 'Register as a Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
