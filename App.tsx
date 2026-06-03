import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LandingPage from '@/src/apps/public/pages/LandingPage';
import LandingPageV2 from '@/src/apps/public/pages/LandingPageV2';
import LoginPage from '@/src/apps/public/pages/LoginPage';
import RegisterPage from '@/src/apps/public/pages/RegisterPage';
import ForgotPasswordPage from '@/src/apps/public/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/src/apps/public/pages/ResetPasswordPage';
import PrivacyPolicy from '@/src/apps/public/pages/PrivacyPolicy';
import AboutPage from '@/src/apps/public/pages/AboutPage';
import EnterprisePage from '@/src/apps/public/pages/EnterprisePage';

import ContactPage from '@/src/apps/public/pages/ContactPage';
import TermsPage from '@/src/apps/public/pages/TermsPage';
import EventsPage from '@/src/apps/public/pages/EventsPage';
import EventDetailPage from '@/src/apps/public/pages/EventDetailPage';
import DashboardRoutes from '@/pages/dashboard/DashboardRoutes';
import CoursesCatalogPage from '@/src/apps/public/pages/CoursesCatalogPage';
import CourseDetailPage from '@/src/apps/public/pages/CourseDetailPage';
import TelegramChannelPage from '@/src/apps/public/pages/TelegramChannelPage';
import CommunityPage from '@/src/apps/public/pages/CommunityPage';
import AdminRoutes from '@/pages/admin/AdminRoutes';
import TutorRoutes from '@/pages/tutor/TutorRoutes';
import SuperAdminRoutes from '@/pages/superadmin/SuperAdminRoutes';
import InfluencerRoutes from '@/pages/influencer/InfluencerRoutes';
import ContributorRoutes from '@/pages/contributor/ContributorRoutes';
import { GuestRoute, StudentRoute } from '@/components/ProtectedRoute';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { ToastProvider } from '@/src/hooks/useToast';
import PublicLayout from '@/src/apps/public/layouts/PublicLayout';
import { User, UserRole } from '@/types';
import { authApi, mapBackendRoleToFrontend } from '@/src/api/auth';
import DemoRoutes from '@/src/apps/demo/routes/DemoDashboardRoutes';
import { autoUpdateCaches } from '@/utils/cacheManager';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorPages from '@/src/apps/public/pages/ErrorPages';
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt';
import NetworkStatusBanner from '@/components/NetworkStatusBanner';


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      // Auto-update caches in background if version mismatch
      try {
        const updated = await autoUpdateCaches();
        if (updated) {
          console.log('[App] Caches updated successfully');
        }
      } catch (error) {
        console.warn('[App] Cache update failed:', error);
      }

      const storedUser = authApi.getStoredUser();
      const isAuthenticated = authApi.isAuthenticated();

      if (isAuthenticated && storedUser) {
        // User is authenticated, fetch fresh profile
        try {
          const profile = await authApi.getProfile();
          const freshUser: User = {
            id: profile.id.toString(),
            name: profile.full_name,
            email: profile.email,
            role: mapBackendRoleToFrontend(profile.role),
            avatar: profile.profile_picture || undefined,
          };
          authApi.storeUser(freshUser);
          setUser(freshUser);
          setApiError(null);
        } catch (error: any) {
          console.error('Failed to fetch profile:', error);
          // If profile fetch fails, use stored user but token might be expired
          setUser(storedUser);
          if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            setApiError('Backend API is unreachable. Using cached data.');
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    // Fetch fresh profile after login
    try {
      const profile = await authApi.getProfile();
      const freshUser: User = {
        id: profile.id.toString(),
        name: profile.full_name,
        email: profile.email,
        role: mapBackendRoleToFrontend(profile.role),
        avatar: profile.profile_picture || undefined,
      };
      authApi.storeUser(freshUser);
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to fetch profile after login:', error);
      setUser(loggedInUser);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
  };

 
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        role="status"
        aria-live="polite"
      >
        <div className="relative inline-block">
          <img
            src="/Logo/logo.png"
            alt="Loading..."
            className="w-24 h-24 object-contain"
            style={{
              animation: 'rotatePulse 2s ease-in-out infinite'
            }}
          />
        </div>
        <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading...
        </p>

        <style>{`
        @keyframes rotatePulse {
          0% { transform: rotate(360deg) scale(1); opacity: 1; }
          50% { transform: rotate(180deg) scale(1.2); opacity: 0.7; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
      `}</style>
      </div>
    );
  }
  return (
    <Router>
      <ScrollToTop />
      <NetworkStatusBanner />
      <PwaUpdatePrompt />
      <ToastProvider>
        <AppContent user={user} onLogin={handleLogin} />
      </ToastProvider>
    </Router>
  );
};

const AppContent: React.FC<{ user: User | null; onLogin: (user: User) => void }> = ({ user, onLogin }) => {
  useTokenRefresh();

  return (
    <Routes>
      <Route path="/" element={<PublicLayout><LandingPageV2 onLogin={onLogin} /></PublicLayout>} />
      <Route path="/legacy" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><GuestRoute user={user}><LoginPage onLogin={onLogin} /></GuestRoute></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><GuestRoute user={user}><RegisterPage onLogin={onLogin} /></GuestRoute></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><GuestRoute user={user}><ForgotPasswordPage /></GuestRoute></PublicLayout>} />
      <Route path="/reset-password" element={<PublicLayout><GuestRoute user={user}><ResetPasswordPage /></GuestRoute></PublicLayout>} />
      <Route path="/dashboard/*" element={<DashboardRoutes user={user} />} />
      <Route path="/demo-dashboard/*" element={<DemoRoutes user={user} />} />
      <Route path="/tutor/*" element={<TutorRoutes />} />
      <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
      <Route path="/courses" element={<PublicLayout><CoursesCatalogPage /></PublicLayout>} />
      <Route path="/courses/:id" element={<PublicLayout><CourseDetailPage /></PublicLayout>} />
      <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
      <Route path="/events/:id" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
      <Route path="/telegram" element={<PublicLayout><TelegramChannelPage user={user} /></PublicLayout>} />
      <Route path="/community" element={<PublicLayout><CommunityPage /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/enterprise" element={<PublicLayout><EnterprisePage /></PublicLayout>} />

      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
      <Route path="/influencer/*" element={<InfluencerRoutes />} />
      <Route path="/contributor/*" element={<ContributorRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<ErrorPages />} />
    </Routes>
  );
};

export default App;
