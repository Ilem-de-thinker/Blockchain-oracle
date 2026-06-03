import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from '../../components/ProtectedRoute';
import AdminLayout from './layout/AdminLayout';
import { User } from '../../types';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const CreateUserPage = lazy(() => import('./pages/CreateUserPage'));
const CourseListingPage = lazy(() => import('./pages/CourseListingPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CreateCourseWizard = lazy(() => import('./pages/CreateCourseWizard'));
const EditCoursePage = lazy(() => import('./pages/EditCoursePage'));
const ModuleManagementPage = lazy(() => import('./pages/ModuleManagementPage'));
const MaterialManagementPage = lazy(() => import('./pages/MaterialManagementPage'));
const CourseEnrollmentsPage = lazy(() => import('./pages/CourseEnrollmentsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TutorAnalyticsPage = lazy(() => import('./pages/TutorAnalyticsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage'));
const AdminEmailNotificationsPage = lazy(() => import('./pages/AdminEmailNotificationsPage'));
const AdminSendNotificationsPage = lazy(() => import('./pages/AdminSendNotificationsPage'));
const UserRatingsPage = lazy(() => import('./pages/UserRatingsPage'));
const ReviewManagementPage = lazy(() => import('./pages/ReviewManagementPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EditEventPage = lazy(() => import('./pages/EditEventPage'));
const DeleteEventPage = lazy(() => import('./pages/DeleteEventPage'));
const AdminTransactionsPage = lazy(() => import('./pages/AdminTransactionsPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const EditUserPage = lazy(() => import('./pages/EditUserPage'));
const AdminEnrollmentsPage = lazy(() => import('./pages/AdminEnrollmentsPage'));
const EventApplicationsPage = lazy(() => import('./pages/EventApplicationsPage'));
const TutorsPage = lazy(() => import('./pages/TutorsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AdminQuizResultsPage = lazy(() => import('./pages/AdminQuizResultsPage'));
const NotificationDetailPage = lazy(() => import('../shared/NotificationDetailPage'));
const UserProgressPage = lazy(() => import('./pages/UserProgressPage'));
const TutorDetailPage = lazy(() => import('./pages/TutorDetailPage'));
const TutorProgressPage = lazy(() => import('./pages/TutorProgressPage'));
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
    const user = JSON.parse(userStr);
    return user;
  } catch {
    return null;
  }
};

const AdminRoutes: React.FC = () => {
  const user = getCurrentUser();

  return (
    <AdminRoute user={user}>
      <AdminLayout user={user}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<CourseListingPage />} />
            <Route path="courses/create" element={<CreateCourseWizard />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="courses/:id/edit" element={<EditCoursePage />} />
            <Route path="courses/:id/modules" element={<ModuleManagementPage />} />
            <Route path="courses/:courseId/modules/:moduleId/materials" element={<MaterialManagementPage />} />
            <Route path="courses/:id/enrollments" element={<CourseEnrollmentsPage />} />
            <Route path="courses/create" element={<CreateCourseWizard />} />
            <Route path="analytics" element={<TutorAnalyticsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="notifications/email" element={<AdminEmailNotificationsPage />} />
            <Route path="notifications/send" element={<AdminSendNotificationsPage />} />
            <Route path="notifications/:id" element={<NotificationDetailPage />} />
            <Route path="quizzes/:quizId/results" element={<AdminQuizResultsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="events/:id/delete" element={<DeleteEventPage />} />
            <Route path="events/:id/applications" element={<EventApplicationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/create" element={<CreateUserPage />} />
            <Route path="users/ratings" element={<UserRatingsPage />} />
            <Route path="users/:id" element={<UserDetailPage />} />
            <Route path="users/:id/edit" element={<EditUserPage />} />
            <Route path="users/:id/progress" element={<UserProgressPage />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
            <Route path="enrollments" element={<AdminEnrollmentsPage />} />
            <Route path="tutors" element={<TutorsPage />} />
            <Route path="tutor/:id" element={<TutorDetailPage />} />
            <Route path="tutor/:id/progress" element={<TutorProgressPage />} />
            <Route path="support" element={<SupportPage user={user} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminRoutes;
