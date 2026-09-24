import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Feather,
  FolderTree,
  BookmarkPlus,
  RotateCcw,
  ReceiptText,
  BadgeAlert,
  Bell,
  FileSpreadsheet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Library,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  unreadCount = 0,
}) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Books', path: '/books', icon: BookOpen },
    ...(!isStudent ? [{ label: 'Students', path: '/students', icon: Users }] : []),
    ...(!isStudent ? [{ label: 'Authors', path: '/authors', icon: Feather }] : []),
    ...(!isStudent ? [{ label: 'Categories', path: '/categories', icon: FolderTree }] : []),
    ...(!isStudent ? [{ label: 'Issue Book', path: '/issue-book', icon: BookmarkPlus }] : []),
    ...(!isStudent ? [{ label: 'Return Book', path: '/return-book', icon: RotateCcw }] : []),
    { label: 'Transactions', path: '/transactions', icon: ReceiptText },
    { label: 'Fines', path: '/fines', icon: BadgeAlert },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    ...(!isStudent ? [{ label: 'Reports', path: '/reports', icon: FileSpreadsheet }] : []),
    ...(!isStudent ? [{ label: 'Analytics', path: '/analytics', icon: BarChart3 }] : []),
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Library className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-none">
                  Nexus
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium tracking-wide uppercase mt-1">
                  Smart Library
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className={`w-5 h-5 flex-shrink-0`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {item.badge && item.badge > 0 ? (
                  isCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                  ) : (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-rose-500 text-white font-bold">
                      {item.badge}
                    </span>
                  )
                ) : null}

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Role Badge in Footer */}
        {!isCollapsed && user && (
          <div className="p-4 mx-3 mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                {user.role} Workspace
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {user.email}
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
