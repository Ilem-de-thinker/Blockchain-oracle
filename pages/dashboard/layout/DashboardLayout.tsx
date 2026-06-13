import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../../types';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  FileText,
  Link as LinkIcon,
  Award,
  Shield,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: NavItem[];
}

const courseItems: NavItem[] = [
  { label: 'My Courses', icon: BookOpen, path: '/dashboard/courses' },
  { label: 'All Courses', icon: LinkIcon, path: '/dashboard/courses/all' },
  { label: 'Progress', icon: FileText, path: '/dashboard/progress' },
  { label: 'Certificates', icon: Award, path: '/dashboard/certificates' },
  { label: 'Transactions', icon: FileText, path: '/dashboard/transactions' },
];

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/dashboard' },
  { label: 'Courses', icon: BookOpen, path: '/dashboard/courses', children: courseItems },
  { label: 'Events', icon: Calendar, path: '/dashboard/events' },
  { label: 'My Registrations', icon: Calendar, path: '/dashboard/registrations' },
  { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { label: 'Transactions', icon: FileText, path: '/dashboard/transactions' },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/dashboard/courses']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'New course available', time: '2 min ago', read: false, icon: 'fa-book' },
    { id: 2, title: 'Event reminder: Webinar tomorrow', time: '1 hour ago', read: false, icon: 'fa-calendar' },
    { id: 3, title: 'Certificate ready for download', time: '3 hours ago', read: true, icon: 'fa-certificate' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (currentPath === path) return true;
    if (currentPath.startsWith(path + '/')) return true;
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }];

    const breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }];
    let currentPath = '/dashboard';

    for (let i = 1; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const navItem = navItems.find(item => item.path === currentPath);
      if (navItem) {
        breadcrumbs.push({ label: navItem.label, path: currentPath });
      }
    }
    return breadcrumbs;
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
  ];

  const accentOptions = [
    { id: 'purple' as const, color: '#7c3aed' },
    { id: 'green' as const, color: '#059669' },
    { id: 'blue' as const, color: '#2563eb' },
  ];

  const CurrentThemeIcon = themeMode === 'dark' ? Moon : Sun;

  return (
    <div className="workspace-shell min-h-dvh bg-bg">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-bg/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside
        data-sidebar-region="true"
        className={`
          hidden lg:flex fixed top-0 left-0 h-full flex-col z-50 sidebar-transition
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
        `}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          color: 'var(--sidebar-text)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 py-4 border-b sidebar-transition" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor})` }}>
            <img src="/Logo/logo.png" alt="Logo" className="w-6 h-6 object-contain flex-shrink-0" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm">Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle</h1>
              <p className="text-[10px]">Student Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.path);

            const handleToggle = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              setExpandedItems(prev => 
                prev.includes(item.path) 
                  ? prev.filter(p => p !== item.path)
                  : [...prev, item.path]
              );
            };

            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'border-2'
                      : 'hover:bg-white/10'
                    }
                  `}
                  style={active ? {
                    borderColor: 'var(--sidebar-border-active)',
                    boxShadow: '0 0 10px color-mix(in srgb, var(--sidebar-border-active) 30%, transparent)',
                  } : {
                    borderColor: 'transparent',
                  }}
                >
                  <Icon className="w-5 h-5 sidebar-link-muted" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {hasChildren && (
                        <button
                          onClick={handleToggle}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronUp className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </Link>
                {!sidebarCollapsed && hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children!.map(child => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.path);
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${childActive
                              ? 'border-2'
                              : 'hover:bg-white/10'
                            }
                          `}
                          style={childActive ? {
                            borderColor: 'var(--sidebar-border-active)',
                            boxShadow: '0 0 8px color-mix(in srgb, var(--sidebar-border-active) 25%, transparent)',
                          } : {
                            borderColor: 'transparent',
                          }}
                        >
                          <ChildIcon className="w-4 h-4 sidebar-link-muted" />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ========== DESKTOP SIDEBAR FOOTER ========== */}
        <div className="p-3 border-t sidebar-transition space-y-1" style={{ borderColor: 'var(--sidebar-border)' }}>
          {/* Profile Section */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/100?u=student"}
              alt={user?.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Student'}</p>
                <p className="text-xs truncate">View Profile</p>
              </div>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/dashboard/settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${isActive('/dashboard/settings') ? 'border-2' : 'hover:bg-white/10'}
            `}
            style={{
              borderColor: isActive('/dashboard/settings') ? 'var(--sidebar-border-active)' : 'transparent',
            }}
          >
            <Settings className="w-5 h-5 sidebar-link-muted" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <>
                <ChevronUp className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className={`min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 bg-surface/95 border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-3">
            {/* Left: Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 sm:p-2 rounded-lg text-text-secondary hover:bg-surface-hover active:bg-surface-active transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Center: Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <span className="text-text-muted">/</span>}
                  <Link
                    to={crumb.path}
                    className={index === getBreadcrumbs().length - 1 ? 'text-text font-medium' : 'text-text-muted hover:text-text'}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {/* Right: Theme Switcher & Notifications & Profile */}
            <div className="flex items-center gap-2">
              {/* Theme Switcher */}
              <div className="relative" ref={themeRef}>
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="p-2.5 sm:p-2 rounded-lg text-text-secondary hover:bg-surface-hover active:bg-surface-active transition-colors"
                  aria-label="Toggle theme"
                >
                  <CurrentThemeIcon className="w-5 h-5" />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-xl border border-border p-4 animate-in">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Theme</h4>
                    <div className="flex gap-2 mb-4">
                      {themeOptions.map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => changeTheme(theme.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              themeMode === theme.id
                                ? 'bg-primary text-white'
                                : 'bg-surface-hover text-text-secondary hover:bg-surface-active'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {theme.label}
                          </button>
                        );
                      })}
                    </div>

                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Accent Color</h4>
                    <div className="flex gap-2">
                      {accentOptions.map((accent) => (
                        <button
                          key={accent.id}
                          onClick={() => changeAccent(accent.id)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            buttonColor === accent.color
                              ? 'ring-2 ring-offset-2 ring-primary scale-110'
                              : ''
                          }`}
                          style={{ backgroundColor: accent.color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 sm:p-2 rounded-lg text-text-secondary hover:bg-surface-hover active:bg-surface-active transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-text text-sm">Notifications</h3>
                      <button className="text-xs text-primary hover:text-primary-dark font-medium">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-hover cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.read ? 'bg-surface-hover' : 'bg-primary/10'}`}>
                            <i className={`fas ${notif.icon} ${notif.read ? 'text-text-muted' : 'text-primary'} text-xs`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text truncate">{notif.title}</p>
                            <p className="text-xs text-text-muted">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-border">
                      <Link to="/dashboard/notifications" className="text-sm text-primary hover:text-primary-dark font-medium">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 sm:p-1.5 rounded-lg hover:bg-surface-hover active:bg-surface-active transition-colors"
                >
                  <img
                    src={user?.avatar || "https://i.pravatar.cc/100?u=student"}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <ChevronDown className="w-4 h-4 text-text-muted hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-medium text-text text-sm">{user?.name || 'Student'}</p>
                      <p className="text-xs text-text-muted">{user?.email || 'student@example.com'}</p>
                    </div>
                    <div className="py-2">
                       <Link to="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                         <UserIcon className="w-4 h-4 text-text-muted" />
                         My Profile
                       </Link>
                       <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                         <Settings className="w-4 h-4 text-text-muted" />
                         Settings
                       </Link>
                       <Link to="/dashboard/kyc" className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                         <Shield className="w-4 h-4 text-text-muted" />
                         KYC Verification
                       </Link>
                       <Link to="/" className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                         <span className="text-text-muted text-sm">↗</span>
                         View Site
                       </Link>
                     </div>
                    <div className="border-t border-border py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-500/10 text-sm"
                      >
                        <span>→</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

import DashboardFooter from '../components/DashboardFooter';
...
        {/* Page Content */}
        <main className="overflow-x-auto px-3 py-4 sm:px-4 sm:py-5 lg:p-6 pb-24 sm:pb-6 lg:pb-6 flex flex-col min-h-[calc(100vh-64px)]">
          <div className="min-w-0 flex-grow">
            {children}
          </div>
          <DashboardFooter />
        </main>
      </div>

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Expanded Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-bg/80"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Horizontal Expandable Menu */}
        <div
          className={`
            absolute bottom-20 left-3 right-3 bg-surface rounded-2xl border border-border shadow-xl p-4
            transition-all duration-300
            ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
          `}
        >
          <div className="flex items-center justify-around gap-1 sm:gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleMobileNavClick(item.path)}
                  className={`
                    flex flex-col items-center gap-1 p-3 sm:p-2.5 rounded-xl min-w-[64px] sm:min-w-[60px] transition-all
                    ${active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'}
                  `}
                >
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom FAB & Profile */}
        <div className="flex items-center justify-between px-4 sm:px-5 pb-safe">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-surface border border-border shadow-lg flex items-center justify-center"
          >
            <Menu className="w-6 h-6 sm:w-5 sm:h-5 text-text" />
          </button>

          {/* Center Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => changeTheme(themeMode === 'dark' ? 'light' : 'dark')}
              className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-surface border border-border shadow-lg flex items-center justify-center"
            >
              <CurrentThemeIcon className="w-5 h-5 sm:w-5 sm:h-5 text-text" />
            </button>

            {/* Menu FAB */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-16 h-16 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all"
              style={{ background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor})` }}
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Menu className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-surface border border-border shadow-lg overflow-hidden"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/100?u=student"}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        {/* Safe area padding for bottom nav */}
        <div className="h-16 lg:hidden" />
      </div>
    </div>
  );
};

export default DashboardLayout;
