import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AdminLayout from '../admin/layout/AdminLayout';
import { User, UserRole } from '../../types';

const SuperAdminDashboardHome = lazy(() => import('./SuperAdminDashboardHome'));
const SuperAdminUsersPage = lazy(() => import('./SuperAdminUsersPage'));
const SuperAdminCreateUserPage = lazy(() => import('./SuperAdminCreateUserPage'));
const SuperAdminUserDetailPage = lazy(() => import('./SuperAdminUserDetailPage'));
const SuperAdminEditUserPage = lazy(() => import('./SuperAdminEditUserPage'));
const UserProgressPage = lazy(() => import('../admin/pages/UserProgressPage'));
const SuperAdminDeleteUserPage = lazy(() => import('./SuperAdminDeleteUserPage'));
const SuperAdminRolesPage = lazy(() => import('./SuperAdminRolesPage'));
const SuperAdminAnalyticsPage = lazy(() => import('./SuperAdminAnalyticsPage'));
const SuperAdminNotificationsPage = lazy(() => import('./SuperAdminNotificationsPage'));
const AdminEmailNotificationPage = lazy(() => import('./AdminEmailNotificationPage'));
const SuperAdminUserRatingsPage = lazy(() => import('./SuperAdminUserRatingsPage'));
const SuperAdminReviewManagementPage = lazy(() => import('./SuperAdminReviewManagementPage'));
const SuperAdminProfilePage = lazy(() => import('./SuperAdminProfilePage'));
const SuperAdminGlobalSettingsPage = lazy(() => import('./SuperAdminGlobalSettingsPage'));
const PaymentsPage = lazy(() => import('../admin/pages/PaymentsPage'));
const TutorAnalyticsPage = lazy(() => import('../admin/pages/TutorAnalyticsPage'));
const AdminTransactionsPage = lazy(() => import('../admin/pages/AdminTransactionsPage'));
const AdminEnrollmentsPage = lazy(() => import('../admin/pages/AdminEnrollmentsPage'));
const CourseListingPage = lazy(() => import('../admin/pages/CourseListingPage'));
const CourseDetailPage = lazy(() => import('../admin/pages/CourseDetailPage'));
const CreateCourseWizard = lazy(() => import('../admin/pages/CreateCourseWizard'));
const EditCoursePage = lazy(() => import('../admin/pages/EditCoursePage'));
const ModuleManagementPage = lazy(() => import('../admin/pages/ModuleManagementPage'));
const MaterialManagementPage = lazy(() => import('../admin/pages/MaterialManagementPage'));
const EventsPage = lazy(() => import('../admin/pages/EventsPage'));
const CreateEventPage = lazy(() => import('../admin/pages/CreateEventPage'));
const EventDetailPage = lazy(() => import('../admin/pages/EventDetailPage'));
const EditEventPage = lazy(() => import('../admin/pages/EditEventPage'));
const DeleteEventPage = lazy(() => import('../admin/pages/DeleteEventPage'));
const EventApplicationsPage = lazy(() => import('../admin/pages/EventApplicationsPage'));
const TutorsPage = lazy(() => import('../admin/pages/TutorsPage'));
const ReportsPage = lazy(() => import('../admin/pages/ReportsPage'));
const SettingsPage = lazy(() => import('../admin/pages/SettingsPage'));
const NotificationDetailPage = lazy(() => import('../shared/NotificationDetailPage'));
const TutorDetailPage = lazy(() => import('../admin/pages/TutorDetailPage'));
const TutorProgressPage = lazy(() => import('../admin/pages/TutorProgressPage'));
const SupportPage = lazy(() => import('../shared/SupportPage'));

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

const SuperAdminRoutes: React.FC = () => {
  const user = getCurrentUser();

  return (
    <ProtectedRoute user={user} allowedRoles={[UserRole.SUPER_ADMIN]} fallbackPath="/dashboard">
      <AdminLayout user={user} workspace="super_admin">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route index element={<SuperAdminDashboardHome user={user} />} />
            
            <Route path="users" element={<SuperAdminUsersPage />} />
            <Route path="users/create" element={<SuperAdminCreateUserPage />} />
            <Route path="users/ratings" element={<SuperAdminUserRatingsPage />} />
            <Route path="users/:id" element={<SuperAdminUserDetailPage />} />
            <Route path="users/:id/edit" element={<SuperAdminEditUserPage />} />
            <Route path="users/:id/delete" element={<SuperAdminDeleteUserPage />} />
            <Route path="users/:id/progress" element={<UserProgressPage />} />
            <Route path="reviews" element={<SuperAdminReviewManagementPage />} />
            
            <Route path="roles" element={<SuperAdminRolesPage />} />
            <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="tutor-analytics" element={<TutorAnalyticsPage />} />
            
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
            <Route path="enrollments" element={<AdminEnrollmentsPage />} />
            <Route path="orders" element={<Navigate to="/super-admin/transactions" replace />} />
            <Route path="subscriptions" element={<Navigate to="/super-admin/enrollments" replace />} />
            <Route path="courses" element={<CourseListingPage />} />
            <Route path="courses/create" element={<CreateCourseWizard />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="courses/:id/edit" element={<EditCoursePage />} />
            <Route path="courses/:id/modules" element={<ModuleManagementPage />} />
            <Route path="courses/:courseId/modules/:moduleId/materials" element={<MaterialManagementPage />} />
            
            <Route path="events" element={<EventsPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="events/:id/delete" element={<DeleteEventPage />} />
            <Route path="events/:id/applications" element={<EventApplicationsPage />} />
            
            <Route path="tutors" element={<TutorsPage />} />
            <Route path="tutor/:id" element={<TutorDetailPage />} />
            <Route path="tutor/:id/progress" element={<TutorProgressPage />} />
            
            <Route path="notifications" element={<SuperAdminNotificationsPage />} />
            <Route path="notifications/:id" element={<NotificationDetailPage />} />
            <Route path="notifications/send-email" element={<AdminEmailNotificationPage />} />
            
            <Route path="profile" element={<SuperAdminProfilePage user={user} />} />
            <Route path="support" element={<SupportPage user={user} />} />
            <Route path="*" element={<Navigate to="/super-admin" replace />} />
          </Routes>
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default SuperAdminRoutes;
