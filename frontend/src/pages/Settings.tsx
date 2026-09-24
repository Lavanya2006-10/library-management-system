import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'library' | 'appearance' | 'security'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Library Policy Settings
  const [libraryName, setLibraryName] = useState('Nexus Smart Library');
  const [finePerDay, setFinePerDay] = useState('1.50');
  const [borrowDuration, setBorrowDuration] = useState('14');
  const [maxBorrowLimit, setMaxBorrowLimit] = useState('3');
  const [libSuccess, setLibSuccess] = useState('');
  const [libSaving, setLibSaving] = useState(false);

  const canEditLibrary = user?.role === 'admin';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        const s = res.data.settings;
        if (s.library_name) setLibraryName(s.library_name);
        if (s.fine_per_day) setFinePerDay(s.fine_per_day);
        if (s.borrow_duration_days) setBorrowDuration(s.borrow_duration_days);
        if (s.max_borrow_limit) setMaxBorrowLimit(s.max_borrow_limit);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const payload: any = { name, avatar_url: avatarUrl };
      if (newPassword) payload.password = newPassword;

      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.user);
      const msg = 'Profile details saved successfully!';
      setProfileSuccess(msg);
      toast.success(msg);
      setNewPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update profile';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLibSuccess('');
    setLibSaving(true);
    try {
      await api.put('/settings', {
        library_name: libraryName,
        fine_per_day: finePerDay,
        borrow_duration_days: borrowDuration,
        max_borrow_limit: maxBorrowLimit,
      });
      const msg = 'Library rules updated successfully!';
      setLibSuccess(msg);
      toast.success(msg);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save settings';
      toast.error(msg);
    } finally {
      setLibSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your user profile, circulation constraints, and UI appearance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> User Profile
        </button>

        {canEditLibrary && (
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'library'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Library Policies
          </button>
        )}

        <button
          onClick={() => setActiveTab('appearance')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'appearance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sun className="w-4 h-4" /> Theme & Appearance
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" /> Session & Security
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <Card title="Personal Information" subtitle="Update your account details and login credentials">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl text-xs">
            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{profileError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Change Password (Leave blank to keep unchanged)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <Button variant="primary" type="submit" isLoading={profileSaving}>
                Save Profile Details
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Library Policies (Admin only) */}
      {activeTab === 'library' && canEditLibrary && (
        <Card
          title="Circulation Rules & Policies"
          subtitle="Configure default lending terms and penalty formulas across the institution"
        >
          <form onSubmit={handleSaveLibrary} className="space-y-4 max-w-xl text-xs">
            {libSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{libSuccess}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Library Name
              </label>
              <input
                type="text"
                required
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fine Amount ($ per overdue day)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  required
                  value={finePerDay}
                  onChange={(e) => setFinePerDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Standard Borrow Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={borrowDuration}
                  onChange={(e) => setBorrowDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Maximum Active Borrow Quota per Student
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={maxBorrowLimit}
                onChange={(e) => setMaxBorrowLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <Button variant="primary" type="submit" isLoading={libSaving}>
                Save Institutional Policies
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 3: Appearance */}
      {activeTab === 'appearance' && (
        <Card title="Visual Theme Preference" subtitle="Choose your preferred color theme">
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</span>
            </button>
          </div>
        </Card>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <Card title="Security & Authentication" subtitle="Active token and permission credentials">
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Assigned Role</span>
                <span className="text-[11px] text-slate-400">Permissions granted based on role</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold uppercase text-[10px]">
                {user?.role}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">JWT Authentication</span>
                <span className="text-[11px] text-slate-400">HS256 signed bearer authorization</span>
              </div>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
