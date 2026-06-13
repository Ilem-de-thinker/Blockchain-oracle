import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Calendar, Bell, Settings, ChevronDown,
  LogOut, Sun, Moon, Palette, Search, Clock, TrendingUp, Award,
  MessageSquare, CreditCard, Users, BarChart3
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { authApi } from '@/src/api/auth';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface DemoLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const demoNavGroups = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [{ label: 'Overview', href: '/demo-dashboard' }],
  },
  {
    label: 'Learning',
    icon: BookOpen,
    items: [
      { label: 'My Courses', href: '/demo-dashboard/courses' },
      { label: 'All Courses', href: '/demo-dashboard/courses/all' },
      { label: 'Progress', href: '/demo-dashboard/progress' },
      { label: 'Certificates', href: '/demo-dashboard/certificates' },
    ],
  },
  {
    label: 'Events',
    icon: Calendar,
    items: [
      { label: 'All Events', href: '/demo-dashboard/events' },
      { label: 'My Events', href: '/demo-dashboard/registrations' },
    ],
  },
  {
    label: 'More',
    icon: BarChart3,
    items: [
      { label: 'Transactions', href: '/demo-dashboard/transactions' },
      { label: 'Community', href: '/demo-dashboard/community' },
      { label: 'Support', href: '/demo-dashboard/support' },
      { label: 'Settings', href: '/demo-dashboard/settings' },
    ],
  },
];

const DemoDashboardLayout: React.FC<DemoLayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode, changeTheme, buttonColor, changeAccent } = useTheme();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowThemePicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === '/demo-dashboard' && location.pathname === '/demo-dashboard') return true;
    if (href !== '/demo-dashboard' && location.pathname.startsWith(href)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await authApi.logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, title: 'New course available', desc: 'Blockchain Fundamentals v2 is now live', time: '2m ago', unread: true },
    { id: 2, title: 'Event reminder', desc: 'Web3 Workshop starts in 1 hour', time: '15m ago', unread: true },
    { id: 3, title: 'Certificate issued', desc: 'Your Web3 Mastery certificate is ready', time: '1d ago', unread: false },
    { id: 4, title: 'Payment confirmed', desc: 'Your enrollment payment was successful', time: '2d ago', unread: false },
  ];

  const themeModes = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'ocean', icon: Palette, label: 'Ocean' },
  ];

  const accentColors = [
    { key: 'purple', label: 'Purple', hex: '#7c3aed' },
    { key: 'green', label: 'Green', hex: '#198754' },
    { key: 'blue', label: 'Blue', hex: '#2563eb' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-surface shadow-sm">
        <div className="h-full max-w-[1600px] mx-auto px-4 flex items-center justify-between gap-4">
          <Link to="/demo-dashboard" className="flex items-center gap-2 shrink-0">
            <img src="/Logo/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            <span className="text-sm font-bold text-text hidden sm:inline">Demo Dashboard</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search courses, events..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Picker */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showThemePicker && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl p-3 space-y-3 z-50">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Theme</p>
                    <div className="flex gap-1">
                      {themeModes.map((m) => (
                        <button
                          key={m.key}
                          onClick={() => changeTheme(m.key as any)}
                          className={cn(
                            'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-colors',
                            themeMode === m.key ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt'
                          )}
                        >
                          <m.icon className="w-4 h-4" />
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Accent</p>
                    <div className="flex gap-2">
                      {accentColors.map((a) => (
                        <button
                          key={a.key}
                          onClick={() => changeAccent(a.key)}
                          className={cn(
                            'w-7 h-7 rounded-full border-2 transition-all',
                            buttonColor === a.hex ? 'border-text scale-110' : 'border-transparent'
                          )}
                          style={{ backgroundColor: a.hex }}
                          title={a.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-alt transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">2</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-bold text-text">Notifications</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={cn('p-3 border-b border-border/50 hover:bg-surface-alt transition-colors cursor-pointer', n.unread && 'bg-primary/5')}>
                        <div className="flex items-start gap-2">
                          <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', n.unread ? 'bg-primary' : 'bg-transparent')} />
                          <div>
                            <p className="text-xs font-semibold text-text">{n.title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{n.desc}</p>
                            <p className="text-[9px] text-text-muted mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-alt transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-text hidden sm:inline max-w-[100px] truncate">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-bold text-text truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-text-muted truncate">{user?.email || ''}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { navigate('/demo-dashboard/settings'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-surface-alt transition-colors">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-surface-alt transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Second Nav - Grouped Dropdowns */}
      <nav className="fixed top-14 left-0 right-0 z-40 h-12 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="h-full max-w-[1600px] mx-auto px-4 flex items-center gap-1">
          {demoNavGroups.map((group) => {
            const groupActive = group.items.some((item) => isActive(item.href));
            return (
              <div key={group.label} className="relative">
                <button
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                  onMouseEnter={() => setOpenGroup(group.label)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    groupActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text hover:bg-surface-alt'
                  )}
                >
                  <group.icon className="w-3.5 h-3.5" />
                  {group.label}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', openGroup === group.label && 'rotate-180')} />
                </button>
                {openGroup === group.label && (
                  <div
                    onMouseLeave={() => setOpenGroup(null)}
                    className="absolute top-full left-0 mt-1 w-44 bg-surface border border-border rounded-xl shadow-xl py-1 z-50"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'block px-3 py-2 text-xs transition-colors',
                          isActive(item.href)
                            ? 'text-primary font-semibold bg-primary/5'
                            : 'text-text-muted hover:text-text hover:bg-surface-alt'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main content - Three column layout */}
      <div className="pt-[104px] max-w-[1600px] mx-auto px-4 flex gap-4 pb-8">
        {/* Left Sidebar - User Details */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-[116px] space-y-3">
            {/* User Card */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-3">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h3 className="text-sm font-bold text-text">{user?.name || 'Demo User'}</h3>
                <p className="text-[10px] text-text-muted mt-0.5">{user?.email || 'user@example.com'}</p>
                <span className="mt-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                  {user?.role || 'Learner'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-text">3</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Enrolled</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text">2</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Events</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-text">1</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text">2</p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Certificates</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Quick Links</p>
              <div className="space-y-1">
                {[
                  { icon: BookOpen, label: 'Browse Courses', href: '/demo-dashboard/courses/all' },
                  { icon: Calendar, label: 'Upcoming Events', href: '/demo-dashboard/events' },
                  { icon: Award, label: 'Certificates', href: '/demo-dashboard/certificates' },
                  { icon: MessageSquare, label: 'Community', href: '/demo-dashboard/community' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-alt transition-colors"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Sidebar - Notifications & Activity */}
        <aside className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-[116px] space-y-3">
            {/* Notifications Feed */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Recent Activity</p>
                <Bell className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className={cn('flex items-start gap-2 p-2 rounded-lg', n.unread && 'bg-primary/5')}>
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1 shrink-0', n.unread ? 'bg-primary' : 'bg-border')} />
                    <div>
                      <p className="text-[11px] font-medium text-text">{n.title}</p>
                      <p className="text-[10px] text-text-muted">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Coming Up</p>
              <div className="space-y-3">
                {[
                  { icon: Calendar, title: 'Web3 Workshop', date: 'Tomorrow, 3PM', color: 'text-purple-500' },
                  { icon: Clock, title: 'Quiz: Solidity Basics', date: 'Jun 2, 2026', color: 'text-blue-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center">
                      <item.icon className={cn('w-4 h-4', item.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text">{item.title}</p>
                      <p className="text-[10px] text-text-muted">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">This Week</p>
              <div className="space-y-2">
                {[
                  { label: 'Study hours', value: '12.5h', icon: Clock },
                  { label: 'Modules completed', value: '3', icon: BookOpen },
                  { label: 'Quiz score avg', value: '85%', icon: TrendingUp },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon className="w-3 h-3 text-text-muted" />
                      <span className="text-[11px] text-text-muted">{s.label}</span>
                    </div>
                    <span className="text-xs font-bold text-text">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DemoDashboardLayout;
export { demoNavGroups };
