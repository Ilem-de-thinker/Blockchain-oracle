import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { SharedDashboardLayout } from '../../components/layout';
import { ErrorBoundary } from '../../components/layout/ErrorBoundary';
import { User, UserRole } from '../../types';

const ContributorDashboard = lazy(() => import('./ContributorDashboard'));
const ContributorCreateUsersPage = lazy(() => import('./ContributorCreateUsersPage'));
const ContributorMyUsersPage = lazy(() => import('./ContributorMyUsersPage'));
const ContributorAnalyticsPage = lazy(() => import('./ContributorAnalyticsPage'));
const ContributorNotificationsPage = lazy(() => import('./ContributorNotificationsPage'));
const ContributorProfilePage = lazy(() => import('./ContributorProfilePage'));
const ContributorSettingsPage = lazy(() => import('./ContributorSettingsPage'));
const NotificationDetailPage = lazy(() => import('../shared/NotificationDetailPage'));
const SupportPage = lazy(() => import('../shared/SupportPage'));
const CommunityPage = lazy(() => import('../dashboard/pages/CommunityPage'));

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <i className="fas fa-circle-notch fa-spin text-4xl text-accent mb-4"></i>
      <p className="text-text-muted">Loading...</p>
    </div>
  </div>
);

const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const ContributorRoutes: React.FC = () => {
  const user = getCurrentUser();

  return (
    <ProtectedRoute user={user} allowedRoles={[UserRole.CONTRIBUTOR]} fallbackPath="/dashboard">
      <SharedDashboardLayout user={user}>
        <Suspense fallback={<LoadingFallback />}>
          <ErrorBoundary>
            <Routes>
              <Route index element={<ContributorDashboard user={user} />} />
              <Route path="create-users" element={<ContributorCreateUsersPage user={user} />} />
              <Route path="my-users" element={<ContributorMyUsersPage user={user} />} />
              <Route path="analytics" element={<ContributorAnalyticsPage user={user} />} />
              <Route path="notifications" element={<ContributorNotificationsPage user={user} />} />
              <Route path="notifications/:id" element={<NotificationDetailPage />} />
              <Route path="profile" element={<ContributorProfilePage user={user} />} />
              <Route path="settings" element={<ContributorSettingsPage />} />
              <Route path="support" element={<SupportPage user={user} />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="*" element={<Navigate to="/contributor" replace />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </SharedDashboardLayout>
    </ProtectedRoute>
  );
};

export default ContributorRoutes;
