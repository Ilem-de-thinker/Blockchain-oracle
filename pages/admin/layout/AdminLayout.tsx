import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../../../types';
import notificationsApi, { Notification } from '../../../src/api/notifications';
import { useTheme, accentOptions } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  CreditCard,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Monitor,
  X,
  ChevronRight,
  Palette,
  Headphones,
  ShieldCheck,
  Quote,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User | null;
  workspace?: 'admin' | 'tutor' | 'super_admin';
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/admin' },
  {
    label: 'User Management',
    icon: Users,
    path: '/admin/user-management',
    children: [
      { label: 'All Users', icon: Users, path: '/admin/users' },
      { label: 'NYSC Enrollment', icon: ShieldCheck, path: '/admin/users/nysc-enrollment' },
    ]
  },
  {
    label: 'Courses',
    icon: BookOpen,
    path: '/admin/courses',
    children: [
      { label: 'All Courses', icon: BookOpen, path: '/admin/courses' },
      { label: 'Create Course', icon: GraduationCap, path: '/admin/courses/create' },
    ]
  },
  { label: 'Tutors', icon: GraduationCap, path: '/admin/tutors' },
  { label: 'Events', icon: Calendar, path: '/admin/events' },
  { label: 'Enrollments', icon: Award, path: '/admin/enrollments' },
  {
    label: 'Feedback',
    icon: MessageSquare,
    path: '/admin/reviews',
    children: [
      { label: 'Course Reviews', icon: MessageSquare, path: '/admin/reviews' },
      { label: 'User Ratings', icon: Users, path: '/admin/users/ratings' },
    ]
  },

  {
    label: 'Payments',
    icon: CreditCard,
    path: '/admin/payments',
    children: [
      { label: 'All Payments', icon: CreditCard, path: '/admin/payments' },
      { label: 'Transactions', icon: CreditCard, path: '/admin/transactions' },
    ]
  },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'Support', icon: Headphones, path: '/admin/support' },
];

const tutorNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/tutor' },
  {
    label: 'My Courses',
    icon: BookOpen,
    path: '/tutor/courses',
    children: [
      { label: 'All Courses', icon: BookOpen, path: '/tutor/courses' },
      { label: 'Create Course', icon: GraduationCap, path: '/tutor/courses/create' },
    ]
  },
  { label: 'Course Analytics', icon: BarChart3, path: '/tutor/analytics' },
  { label: 'Events Manager', icon: Calendar, path: '/tutor/events' },
  { label: 'Notifications', icon: Bell, path: '/tutor/notifications' },
  { label: 'Profile', icon: Users, path: '/tutor/profile' },
  { label: 'Settings', icon: Settings, path: '/tutor/settings' },
  { label: 'Support', icon: Headphones, path: '/tutor/support' },
];

const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/super-admin' },
  {
    label: 'Users',
    icon: Users,
    path: '/super-admin/users',
    children: [
      { label: 'All Users', icon: Users, path: '/super-admin/users' },
      { label: 'Create User', icon: Users, path: '/super-admin/users/create' },
      { label: 'NYSC Enrollment', icon: ShieldCheck, path: '/super-admin/users/nysc-enrollment' },
    ]
  },
  { label: 'Roles', icon: Users, path: '/super-admin/roles' },
  { label: 'Analytics', icon: BarChart3, path: '/super-admin/analytics' },
  {
    label: 'Courses',
    icon: BookOpen,
    path: '/super-admin/courses',
    children: [
      { label: 'All Courses', icon: BookOpen, path: '/super-admin/courses' },
      { label: 'Create Course', icon: GraduationCap, path: '/super-admin/courses/create' },
    ]
  },
  { label: 'Tutors', icon: GraduationCap, path: '/super-admin/tutors' },
  { label: 'Events', icon: Calendar, path: '/super-admin/events' },
  { label: 'Enrollments', icon: Award, path: '/super-admin/enrollments' },
  {
    label: 'Feedback',
    icon: MessageSquare,
    path: '/super-admin/reviews',
    children: [
      { label: 'Course Reviews', icon: MessageSquare, path: '/super-admin/reviews' },
      { label: 'User Ratings', icon: Users, path: '/super-admin/users/ratings' },
      { label: 'Testimonials', icon: Quote, path: '/super-admin/testimonials' },
    ]
  },

  {
    label: 'Payments',
    icon: CreditCard,
    path: '/super-admin/payments',
    children: [
      { label: 'All Payments', icon: CreditCard, path: '/super-admin/payments' },
      { label: 'Transactions', icon: CreditCard, path: '/super-admin/transactions' },
    ]
  },
  { label: 'Reports', icon: BarChart3, path: '/super-admin/reports' },
  { label: 'Notifications', icon: Bell, path: '/super-admin/notifications' },
  { label: 'Profile', icon: Users, path: '/super-admin/profile' },
  { label: 'Settings', icon: Settings, path: '/super-admin/settings' },
  { label: 'Support', icon: Headphones, path: '/super-admin/support' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user, workspace = 'admin' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeNavItems =
    workspace === 'tutor' ? tutorNavItems :
    workspace === 'super_admin' ? superAdminNavItems :
    navItems;
  const panelLabel =
    workspace === 'tutor' ? 'Tutor Workspace' :
    workspace === 'super_admin' ? 'Super Admin Panel' :
    'Admin Panel';
  const basePath =
    workspace === 'tutor' ? '/tutor' :
    workspace === 'super_admin' ? '/super-admin' :
    '/admin';
  const profileRoleLabel =
    user?.role === UserRole.SUPER_ADMIN
      ? 'Super Admin'
      : user?.role === UserRole.ADMIN
        ? 'Admin'
        : user?.role === UserRole.INSTRUCTOR
          ? 'Tutor'
          : 'Team Member';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'ocean' as const, label: 'Ocean', icon: Monitor },
  ];

  const accentOptions = [
    { id: 'purple' as const, color: '#7c3aed' },
    { id: 'green' as const, color: '#059669' },
    { id: 'blue' as const, color: '#2563eb' },
  ];

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await notificationsApi.getNotifications(1, 6);
        setNotifications((response as any).results || (response as any).items || []);
        setUnreadCount(response.unread_count);
      } catch (error) {
        console.error('Failed to load workspace notifications:', error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: NavItem[]) => children?.some(child => isActive(child.path));

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ label: 'Dashboard', path: basePath }];
    
    const breadcrumbs = [{ label: 'Dashboard', path: basePath }];
    let currentPath = basePath;
    
    for (let i = 1; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const navItem = activeNavItems.find(item => item.path === currentPath);
      if (navItem) {
        breadcrumbs.push({ label: navItem.label, path: currentPath });
      } else {
        const parent = activeNavItems.find(item => item.children?.some(child => child.path === currentPath));
        if (parent) {
          // Use the currentPath (child's path) for the parent breadcrumb to avoid broken links
          breadcrumbs.push({ label: parent.label, path: currentPath });
        }
      }
    }
    return breadcrumbs;
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.path);
    const parentActive = !active && hasChildren && isParentActive(item.children);
    const Icon = item.icon;

    return (
      <div key={`${item.path}-${level}`}>
        <Link
          to={hasChildren ? '#' : item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpanded(item.label);
            }
          }}
          className={`
            flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200
            ${level > 0 ? 'ml-4' : ''}
            ${active
              ? 'border-2 font-medium'
              : parentActive
                ? 'hover:bg-white/10'
                : 'hover:bg-white/10'
            }
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
          style={active ? {
            borderColor: 'var(--sidebar-border-active)',
            boxShadow: '0 0 10px color-mix(in srgb, var(--sidebar-border-active) 30%, transparent)',
          } : {
            borderColor: 'transparent',
          }}
          title={sidebarCollapsed ? item.label : undefined}
        >
          <Icon className="w-5 h-5 flex-shrink-0 sidebar-link-muted" />
          {!sidebarCollapsed && (
            <>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {hasChildren && (
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded || parentActive ? 'rotate-180' : ''}`} />
              )}
            </>
          )}
        </Link>
        {!sidebarCollapsed && hasChildren && isExpanded && (
          <div className="mt-0.5">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-bg/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        data-sidebar-region="true"
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col sidebar-transition
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
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
            <img src="/Logo/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm">
                Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle
              </h1>
              <p className="text-[10px]">{panelLabel}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {activeNavItems.map(item => renderNavItem(item))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t sidebar-transition space-y-1" style={{ borderColor: 'var(--sidebar-border)' }}>
          {/* Profile Section */}
          <button
            onClick={() => navigate(`${basePath}/profile`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10"
          >
            <img
              src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.email || 'admin'}`}
              alt={user?.name || 'Admin'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs truncate">{profileRoleLabel}</p>
              </div>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate(`${basePath}/settings`)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${isActive(`${basePath}/settings`) ? 'border-2' : 'hover:bg-white/10'}
            `}
            style={{
              borderColor: isActive(`${basePath}/settings`) ? 'var(--sidebar-border-active)' : 'transparent',
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

      {/* Mobile Sidebar */}
      <aside
        data-sidebar-region="true"
        className={`
          fixed top-0 left-0 h-full w-72 z-50 flex flex-col sidebar-transition
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          color: 'var(--sidebar-text)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b sidebar-transition" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor})` }}>
<img src="/Logo/logo.png" alt="BlockchainOracle" className="w-6 h-6 object-contain flex-shrink-0" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm">
                Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle
              </h1>
              <p className="text-[10px]">{panelLabel}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {activeNavItems.map(item => renderNavItem(item))}
        </nav>

        {/* Mobile Footer */}
        <div className="p-3 border-t sidebar-transition space-y-1" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => navigate(`${basePath}/profile`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <img
              src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.email || 'admin'}`}
              alt={user?.name || 'Admin'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs truncate">{profileRoleLabel}</p>
            </div>
          </button>
          <button
            onClick={() => navigate(`${basePath}/settings`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 sidebar-link-muted" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Navigation */}
        <header className="sticky top-0 z-[60] bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            {/* Mobile Menu Button - Restored */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-hover"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <ChevronRight className="w-4 h-4 text-text-muted" />}
                  <Link
                    to={crumb.path}
                    className={index === getBreadcrumbs().length - 1 ? 'text-text font-medium' : 'text-text-muted hover:text-text'}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Theme Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
                    aria-label="Toggle theme"
                  >
                    <Palette className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={8}
                  align="end"
                  className="w-64 z-[70] bg-surface rounded-xl shadow-xl border border-border p-0"
                >
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      Visual Theme
                    </p>
                  </div>

                  <div className="p-1.5 grid grid-cols-1 gap-1">
                    {themeOptions.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <DropdownMenuItem
                          key={theme.id}
                          onClick={() => changeTheme(theme.id)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all',
                            themeMode === theme.id ? 'bg-primary text-white font-bold shadow-sm' : 'text-text-muted hover:bg-surface-hover hover:text-text'
                          )}
                        >
                          <Icon size={14} className={cn(themeMode === theme.id ? "text-white" : "text-text-muted")} />
                          <span className="text-[11px] uppercase tracking-widest">{theme.label}</span>
                          {themeMode === theme.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </div>

                  <DropdownMenuSeparator className="my-1 opacity-50" />

                  <div className="px-3 py-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                      Accent Protocol
                    </p>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-surface-alt/30 rounded-lg mx-2 mb-2">
                    {accentOptions.map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => changeAccent(accent.id)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all relative group',
                          buttonColor === accent.color
                            ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-lg'
                            : 'hover:scale-110 opacity-60 hover:opacity-100'
                        )}
                        style={{ backgroundColor: accent.color }}
                        aria-label={`${accent.id} accent`}
                      >
                        {buttonColor === accent.color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                </button>

                {notificationsOpen && (
                  <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 z-[70] bg-surface rounded-xl shadow-xl border border-border overflow-hidden max-h-[calc(100vh-6rem)]">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-text text-sm">Notifications</h3>
                      <button onClick={handleMarkAllRead} className="text-xs text-primary hover:text-primary-dark font-medium">Mark all read</button>
                    </div>
                    <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-text-muted text-center">
                          No notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <Link
                            key={notif.id}
                            to={`${basePath}/notifications/${notif.id}`}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-hover cursor-pointer ${!notif.is_read ? 'bg-primary/5' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.is_read ? 'bg-surface-hover' : 'bg-primary/10'}`}>
                              <Bell className={`w-4 h-4 ${notif.is_read ? 'text-text-muted' : 'text-primary'}`} />
                            </div>
                            <div className="flex-1 min-w-0" onClick={() => { handleMarkAsRead(notif.id); setNotificationsOpen(false); }}>
                              <p className="text-sm text-text truncate">{notif.title}</p>
                              <p className="text-xs text-text-muted">{notif.message}</p>
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteNotification(notif.id); }}
                              className="text-text-muted hover:text-red-500 transition-colors flex-shrink-0 self-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-border">
                      <Link
                        to={`${basePath}/notifications`}
                        className="text-sm text-primary hover:text-primary-dark font-medium"
                        onClick={() => setNotificationsOpen(false)}
                      >
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
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <img
                    src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.email || 'admin'}`}
                    alt={user?.name || 'Admin'}
                    className="w-8 h-8 rounded-full"
                  />
                  <ChevronDown className="w-4 h-4 text-text-muted hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-[70] mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-medium text-text text-sm">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-text-muted">{user?.email || 'admin@alpharking.com'}</p>
                    </div>
                    <div className="py-2">
                      <Link to={`${basePath}/profile`} className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                        <Users className="w-4 h-4 text-text-muted" />
                        My Profile
                      </Link>
                      <Link to={`${basePath}/settings`} className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                        <Settings className="w-4 h-4 text-text-muted" />
                        Settings
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

        {/* Page Content */}
        <main className="overflow-x-auto p-4 lg:p-8">
          <div className="min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
