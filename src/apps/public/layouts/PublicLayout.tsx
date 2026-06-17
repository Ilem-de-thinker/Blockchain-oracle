import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/src/api/auth';
import { User, UserRole } from '@/types';
import LogoText from '@/components/LogoText';
import NetworkStatusBanner from '@/components/NetworkStatusBanner';
import TelegramReminderPopup from '@/components/TelegramReminderPopup';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import PublicFooter from '@/src/apps/public/components/PublicFooter';
import MouseTracker from '@/components/MouseTracker';

const Navbar: React.FC<{ user: User | null }> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  const navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Events', path: '/events' },
    { name: 'Community', path: '/community' },
  ];

  const dashboardPath = (() => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case UserRole.SUPER_ADMIN: return '/super-admin';
      case UserRole.ADMIN: return '/admin';
      case UserRole.INSTRUCTOR: return '/tutor';
      case UserRole.INFLUENCER: return '/influencer';
      case UserRole.CONTRIBUTOR: return '/contributor';
      default: return '/dashboard';
    }
  })();

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = '/login';
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[110] transition-all duration-300 bg-white border-b border-gray-200 ${scrolled ? 'shadow-sm' : ''}`}
      style={{ paddingBottom: '14px', paddingTop: '14px' }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Link to="/" className="group relative z-[130]">
          <LogoText variant="navbar" size="md" showIcon={true} />
        </Link>

        <div className="hidden lg:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-all duration-200 text-sm font-semibold tracking-wide ${location.pathname === link.path ? 'text-purple-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {link.name}
            </Link>
          ))}

          <div className="h-5 w-px bg-gray-200"></div>

          {user ? (
            <div className="flex items-center gap-4 pl-6">
              <Link
                to={dashboardPath}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-purple-600 text-white transition-all"
              >
                Dashboard
              </Link>
              <Link to={`${dashboardPath}/profile`} className="flex items-center gap-2 group">
                <img
                  src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border-2 border-purple-600"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-bold hover:text-red-500 transition-colors text-gray-500"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-6">
              <Link
                to="/login"
                className="text-xs font-bold px-5 py-2 rounded-lg transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold px-5 py-2 rounded-full text-white transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-purple-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-gray-900 text-xl"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200"
          >
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-left py-2 font-medium transition-colors ${
                    location.pathname === link.path ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to={dashboardPath}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white text-center"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-center border border-gray-200 text-gray-600"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-500 text-white text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = authApi.getStoredUser();
    setUser(stored);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-page-type', 'public');
    const html = document.documentElement;

    // Save current inline styles set by ThemeContext so we can restore on unmount
    const savedInlineVars: Record<string, string> = {};
    const varsToReset = [
      '--color-bg-raw', '--color-bg-secondary-raw',
      '--color-surface-raw', '--color-surface-hover-raw', '--color-surface-active-raw', '--color-surface-alt-raw',
      '--color-border-raw', '--color-border-hover-raw',
      '--color-text-raw', '--color-text-secondary-raw', '--color-text-muted-raw', '--color-text-inverse-raw', '--color-text-link-raw',
      '--color-white-raw', '--color-black-raw',
      '--color-gray-100-raw', '--color-gray-200-raw', '--color-gray-300-raw', '--color-gray-400-raw',
      '--color-gray-500-raw', '--color-gray-600-raw', '--color-gray-700-raw', '--color-gray-800-raw', '--color-gray-900-raw',
      '--color-shadow-raw',
    ];

    // Capture current values before overriding
    varsToReset.forEach((v) => {
      savedInlineVars[v] = html.style.getPropertyValue(v);
    });
    const savedBodyBg = document.body.style.backgroundColor;
    const savedBodyColor = document.body.style.color;
    const savedDataTheme = html.getAttribute('data-theme');
    const savedColorScheme = html.style.colorScheme;

    // Force light theme CSS variables so public pages are never affected by dashboard theme
    const lightColors: Record<string, string> = {
      '--color-bg-raw': '#f5f0ff',
      '--color-bg-secondary-raw': '#f8fafc',
      '--color-surface-raw': '#ffffff',
      '--color-surface-hover-raw': '#f9fafb',
      '--color-surface-active-raw': '#f3f4f6',
      '--color-surface-alt-raw': '#f1f5f9',
      '--color-border-raw': '#e5e7eb',
      '--color-border-hover-raw': '#d1d5db',
      '--color-text-raw': '#111827',
      '--color-text-secondary-raw': '#374151',
      '--color-text-muted-raw': '#6b7280',
      '--color-text-inverse-raw': '#ffffff',
      '--color-text-link-raw': '#374151',
      '--color-white-raw': '#ffffff',
      '--color-black-raw': '#000000',
      '--color-gray-100-raw': '#f3f4f6',
      '--color-gray-200-raw': '#e5e7eb',
      '--color-gray-300-raw': '#d1d5db',
      '--color-gray-400-raw': '#9ca3af',
      '--color-gray-500-raw': '#6b7280',
      '--color-gray-600-raw': '#4b5563',
      '--color-gray-700-raw': '#374151',
      '--color-gray-800-raw': '#1f2937',
      '--color-gray-900-raw': '#111827',
      '--color-shadow-raw': 'rgba(0, 0, 0, 0.1)',
    };

    Object.entries(lightColors).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });
    html.style.colorScheme = 'light';
    html.setAttribute('data-theme', 'light');
    document.body.style.backgroundColor = '#faf8ff';
    document.body.style.color = '#111827';

    return () => {
      // Restore previous theme state
      varsToReset.forEach((v) => {
        if (savedInlineVars[v]) {
          html.style.setProperty(v, savedInlineVars[v]);
        } else {
          html.style.removeProperty(v);
        }
      });
      document.body.style.backgroundColor = savedBodyBg;
      document.body.style.color = savedBodyColor;
      html.style.colorScheme = savedColorScheme;
      if (savedDataTheme) {
        html.setAttribute('data-theme', savedDataTheme);
      }
    };
  }, []);

  const hideChrome = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <MouseTracker />
      <NetworkStatusBanner />
      {!hideChrome && !isLandingPage && <Navbar user={user} />}
      {!hideChrome && <TelegramReminderPopup user={user} />}

      <main className="flex-grow">
        <ErrorBoundary>
          {children || <Outlet />}
        </ErrorBoundary>
      </main>

      {!hideChrome && <PublicFooter />}
    </div>
  );
};

export default PublicLayout;
