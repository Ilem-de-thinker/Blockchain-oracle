import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { UserRole } from '@/types';
import { authApi } from '@/src/api/auth';
import IconSidebar, { iconConfigs } from '@/components/layout/IconSidebar';
import MenuPanel from '@/components/layout/MenuPanel';
import DashboardFooter from '@/components/layout/DashboardFooter';
import TopNavbar from '@/components/layout/TopNavbar';

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  icon: string;
}

const ErrorPages: React.FC = () => {
  const location = useLocation();
  const { colors } = useTheme();
  
  const user = authApi.getStoredUser();
  const role = (user?.role as UserRole) || UserRole.LEARNER;
  const icons = iconConfigs[role] || iconConfigs[UserRole.LEARNER];
  const menus: any = {};

  const getErrorFromPath = (pathname: string): ErrorPageProps => {
    const path = pathname.toLowerCase();
    
    if (path.includes('403') || path.includes('forbidden') || path.includes('access-denied')) {
      return {
        code: 403,
        title: 'Access Denied',
        message: 'You do not have permission to access this resource. Please contact your administrator if you believe this is an error.',
        icon: 'fa-lock',
      };
    }
    
    if (path.includes('500') || path.includes('server-error')) {
      return {
        code: 500,
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later or contact support if the problem persists.',
        icon: 'fa-server',
      };
    }
    
    if (path.includes('503') || path.includes('maintenance')) {
      return {
        code: 503,
        title: 'Service Unavailable',
        message: 'We are currently performing maintenance. Please check back soon.',
        icon: 'fa-tools',
      };
    }
    
    if (path.includes('401') || path.includes('unauthorized')) {
      return {
        code: 401,
        title: 'Unauthorized',
        message: 'Please log in to access this page.',
        icon: 'fa-user-lock',
      };
    }
    
    return {
      code: 404,
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been moved.',
      icon: 'fa-folder-open',
    };
  };

  const error = getErrorFromPath(location.pathname);
  const roleBasePath = role === UserRole.ADMIN ? '/admin'
    : role === UserRole.SUPER_ADMIN ? '/super-admin'
    : role === UserRole.INSTRUCTOR ? '/tutor'
    : role === UserRole.INFLUENCER ? '/influencer'
    : role === UserRole.CONTRIBUTOR ? '/contributor'
    : '/dashboard';

  const getHomePath = () => {
    if (!user) return '/';
    return roleBasePath;
  };

  return (
    <div className="min-h-screen bg-bg">
      <IconSidebar
        icons={icons}
        activeIcon="dashboard"
        onIconChange={() => {}}
        role={role}
        profile={user ? {
          name: user.name || user.email || 'User',
          avatar: user.avatar,
          email: user.email,
          is_verified: user.is_verified,
        } : undefined}
        profileHref={`${roleBasePath}/profile`}
        settingsHref={`${roleBasePath}/settings`}
        onSignOut={() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
      />

      <MenuPanel
        menus={menus}
        menu={null}
        isOpen={false}
        onClose={() => {}}
        role={role}
        collapsed={false}
        onToggleCollapse={() => {}}
      />

      <div className="lg:ml-[352px] transition-all duration-300">
        <TopNavbar 
          user={user ? {...user, role} : undefined}
          onSignOut={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          onMenuClick={() => {}}
          isMobileDrawerOpen={false}
          hideLeftSection={false}
        />

        <main className="min-h-screen bg-bg flex flex-col pb-32 lg:pb-0">
          <div className="flex-grow w-full px-4 lg:px-8 py-6 mt-15">
            <div className="max-w-2xl mx-auto mt-16">
              <div className="text-center mb-8">
                <div 
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <i 
                    className={`fas ${error.icon} text-4xl`}
                    style={{ color: colors.primary }}
                  ></i>
                </div>
                <h1 
                  className="text-6xl font-black mb-4"
                  style={{ color: colors.primary }}
                >
                  {error.code}
                </h1>
                <h2 className="text-2xl font-bold text-text mb-4">
                  {error.title}
                </h2>
                <p className="text-text-muted mb-8 max-w-md mx-auto">
                  {error.message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={getHomePath()}
                  className="px-6 py-3 rounded-xl font-bold text-white transition-all bg-gradient-primary hover:shadow-lg"
                >
                  <i className="fas fa-home mr-2"></i>
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 rounded-xl font-bold border transition-all hover:bg-surface-hover"
                  style={{ borderColor: `${colors.primary}44`, color: 'var(--color-text)' }}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Go Back
                </button>
              </div>

              {error.code === 403 && (
                <div className="mt-12 p-6 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                  <h3 className="font-bold text-text mb-2">
                    <i className="fas fa-info-circle mr-2" style={{ color: colors.primary }}></i>
                    Need Help?
                  </h3>
                  <p className="text-sm text-text-muted">
                    If you believe you should have access to this page, please contact your administrator or our support team.
                  </p>
                </div>
              )}

              {error.code === 404 && (
                <div className="mt-12 p-6 rounded-xl" style={{ backgroundColor: `${colors.primary}08` }}>
                  <h3 className="font-bold text-text mb-2">
                    <i className="fas fa-lightbulb mr-2" style={{ color: colors.primary }}></i>
                    Quick Links
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Link 
                      to="/courses" 
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-surface-hover"
                      style={{ borderColor: `${colors.primary}33` }}
                    >
                      Browse Courses
                    </Link>
                    <Link 
                      to="/events" 
                      className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-surface-hover"
                      style={{ borderColor: `${colors.primary}33` }}
                    >
                      View Events
                    </Link>
                    {user && (
                      <Link 
                        to={getHomePath()} 
                        className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-surface-hover"
                        style={{ borderColor: `${colors.primary}33` }}
                      >
                        My Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
};

export default ErrorPages;