import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  Megaphone,
  Link2,
  BarChart3,
  Wallet,
  Image,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  User,
  Settings,
} from 'lucide-react';

interface InfluencerLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/influencer' },
  { label: 'Campaigns', icon: Megaphone, path: '/influencer/campaigns' },
  { label: 'Analytics', icon: BarChart3, path: '/influencer/analytics' },
  { label: 'Earnings', icon: Wallet, path: '/influencer/earnings' },
  { label: 'Assets', icon: Image, path: '/influencer/assets' },
  { label: 'Notifications', icon: Bell, path: '/influencer/notifications' },
];

const InfluencerLayout: React.FC<InfluencerLayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode, buttonColor, changeTheme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ label: 'Dashboard', path: '/influencer' }];

    const breadcrumbs = [{ label: 'Dashboard', path: '/influencer' }];
    let currentPath = '/influencer';

    for (let i = 1; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const navItem = navItems.find(item => item.path === currentPath);
      if (navItem) {
        breadcrumbs.push({ label: navItem.label, path: currentPath });
      }
    }
    return breadcrumbs;
  };

  const CurrentThemeIcon = themeMode === 'dark' ? Moon : Sun;

  return (
    <div className="workspace-shell min-h-screen bg-bg">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-bg/80 z-40 lg:hidden backdrop-blur-sm"
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
              <h1 className="font-bold text-text text-sm">Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle</h1>
              <p className="text-[10px] text-text-muted">Influencer Workspace</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
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
                <Icon className={`w-5 h-5 sidebar-link-muted`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ========== DESKTOP SIDEBAR FOOTER ========== */}
        <div className="p-3 border-t sidebar-transition space-y-1" style={{ borderColor: 'var(--sidebar-border)' }}>
          {/* Profile Section */}
          <button
            onClick={() => navigate('/influencer/profile')}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/100?u=influencer"}
              alt={user?.name || 'Influencer'}
              className="w-10 h-10 rounded-full object-cover"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Influencer'}</p>
                <p className="text-xs truncate">View Profile</p>
              </div>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/influencer/settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${isActive('/influencer/settings') ? 'border-2' : 'hover:bg-white/10'}
            `}
            style={{
              borderColor: isActive('/influencer/settings') ? 'var(--sidebar-border-active)' : 'transparent',
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

      {/* ========== MOBILE SIDEBAR ========== */}
      <aside
        data-sidebar-region="true"
        className={`
          fixed top-0 left-0 h-full w-72 z-50 flex-col sidebar-transition
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
        <div className="flex items-center justify-between px-4 py-4 border-b sidebar-transition" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor})` }}>
              <img src="/Logo/logo.png" alt="Logo" className="w-6 h-6 object-contain flex-shrink-0" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm">Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle</h1>
              <p className="text-[10px]">Influencer Workspace</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
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
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t sidebar-transition space-y-1" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => { navigate('/influencer/profile'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/100?u=influencer"}
              alt={user?.name || 'Influencer'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Influencer'}</p>
              <p className="text-xs truncate">View Profile</p>
            </div>
          </button>
          <button
            onClick={() => { navigate('/influencer/settings'); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 sidebar-link-muted" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className={`min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            {/* Left: Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 sm:p-2 rounded-lg text-text-secondary hover:bg-surface-hover active:bg-surface-active transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Right: Theme Switcher & Notifications & Profile */}
            <div className="flex items-center gap-2 ml-auto">
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
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { changeTheme('light'); setThemeDropdownOpen(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          themeMode === 'light' ? 'bg-primary text-white' : 'bg-surface-hover text-text-secondary hover:bg-surface-active'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        Light
                      </button>
                      <button
                        onClick={() => { changeTheme('dark'); setThemeDropdownOpen(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          themeMode === 'dark' ? 'bg-primary text-white' : 'bg-surface-hover text-text-secondary hover:bg-surface-active'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        Dark
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 sm:p-2 rounded-lg text-text-secondary hover:bg-surface-hover active:bg-surface-active touch-target transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 sm:p-1.5 rounded-lg hover:bg-surface-hover active:bg-surface-active touch-target transition-colors"
                >
                  <img
                    src={user?.avatar || "https://i.pravatar.cc/100?u=influencer"}
                    alt={user?.name || 'Influencer'}
                    className="w-8 h-8 rounded-full"
                  />
                  <ChevronDown className="w-4 h-4 text-text-muted hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-medium text-text text-sm">{user?.name || 'Influencer'}</p>
                      <p className="text-xs text-text-muted">{user?.email || 'influencer@example.com'}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/influencer/profile" className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
                        <User className="w-4 h-4 text-text-muted" />
                        My Profile
                      </Link>
                      <Link to="/influencer/settings" className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-hover text-sm">
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
        <main className="overflow-x-auto p-4 sm:p-5 lg:p-6 pb-24 sm:pb-6 lg:pb-6">
          {/* Breadcrumbs */}
          <nav className="mb-4 flex items-center gap-2 text-sm">
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
          <div className="min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm"
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
                    flex flex-col items-center gap-1 p-3 sm:p-2.5 rounded-xl min-w-[64px] sm:min-w-[60px] touch-target transition-all
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
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-surface border border-border shadow-lg flex items-center justify-center touch-target"
          >
            <Menu className="w-6 h-6 sm:w-5 sm:h-5 text-text" />
          </button>

          <div className="flex items-center gap-3 sm:gap-2">
            <button
              onClick={() => changeTheme(themeMode === 'dark' ? 'light' : 'dark')}
              className="w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-surface border border-border shadow-lg flex items-center justify-center touch-target"
            >
              <CurrentThemeIcon className="w-5 h-5 sm:w-5 sm:h-5 text-text" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-16 h-16 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all touch-target"
              style={{ background: `linear-gradient(135deg, ${buttonColor}, ${buttonColor})` }}
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Menu className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
          </div>

          <button
            onClick={() => navigate('/influencer/profile')}
            className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-surface border border-border shadow-lg overflow-hidden touch-target"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/100?u=influencer"}
              alt={user?.name || 'Influencer'}
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        <div className="h-safe-area-inset-bottom bg-surface border-t border-border" />
      </div>
    </div>
  );
};

export default InfluencerLayout;
