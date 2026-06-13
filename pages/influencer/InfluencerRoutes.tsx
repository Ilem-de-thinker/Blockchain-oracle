import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { SharedDashboardLayout } from '../../components/layout';
import { ErrorBoundary } from '../../components/layout/ErrorBoundary';
import { User, UserRole } from '../../types';

const InfluencerDashboard = lazy(() => import('./InfluencerDashboard'));
const InfluencerCampaignsPage = lazy(() => import('./InfluencerCampaignsPage'));
const InfluencerAnalyticsPage = lazy(() => import('./InfluencerAnalyticsPage'));
const InfluencerEarningsPage = lazy(() => import('./InfluencerEarningsPage'));
const InfluencerAssetsPage = lazy(() => import('./InfluencerAssetsPage'));
const InfluencerNotificationsPage = lazy(() => import('./InfluencerNotificationsPage'));
const InfluencerProfilePage = lazy(() => import('./InfluencerProfilePage'));
const InfluencerSettingsPage = lazy(() => import('./InfluencerSettingsPage'));
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

const InfluencerRoutes: React.FC = () => {
  const user = getCurrentUser();

  return (
    <ProtectedRoute user={user} allowedRoles={[UserRole.INFLUENCER]} fallbackPath="/dashboard">
      <SharedDashboardLayout user={user}>
        <Suspense fallback={<LoadingFallback />}>
          <ErrorBoundary>
            <Routes>
              <Route index element={<InfluencerDashboard user={user} />} />
              <Route path="campaigns" element={<InfluencerCampaignsPage />} />
              <Route path="analytics" element={<InfluencerAnalyticsPage />} />
              <Route path="earnings" element={<InfluencerEarningsPage />} />
              <Route path="assets" element={<InfluencerAssetsPage />} />
              <Route path="notifications" element={<InfluencerNotificationsPage />} />
              <Route path="notifications/:id" element={<NotificationDetailPage />} />
              <Route path="profile" element={<InfluencerProfilePage user={user} />} />
              <Route path="settings" element={<InfluencerSettingsPage />} />
              <Route path="support" element={<SupportPage user={user} />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="*" element={<Navigate to="/influencer" replace />} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </SharedDashboardLayout>
    </ProtectedRoute>
  );
};

export default InfluencerRoutes;
