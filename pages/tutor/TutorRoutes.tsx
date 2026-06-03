import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { SharedDashboardLayout } from '../../components/layout';
import { User, UserRole } from '../../types';

const TutorDashboardHome = lazy(() => import('./TutorDashboardHome'));
const TutorCourseDetailPage = lazy(() => import('./TutorCourseDetailPage'));
const TutorCourseDeletePage = lazy(() => import('./TutorCourseDeletePage'));
const TutorAnalyticsPage = lazy(() => import('../admin/pages/TutorAnalyticsPage'));
const TutorCoursesPage = lazy(() => import('./TutorCoursesPage'));
const TutorCreateCoursePage = lazy(() => import('./TutorCreateCoursePage'));
const TutorEditCoursePage = lazy(() => import('./TutorEditCoursePage'));
const TutorCourseMaterialsPage = lazy(() => import('./TutorCourseMaterialsPage'));
const TutorNotificationsPage = lazy(() => import('./TutorNotificationsPage'));
const TutorProfilePage = lazy(() => import('./TutorProfilePage'));
const TutorSettingsPage = lazy(() => import('./TutorSettingsPage'));
const TutorCreateQuizPage = lazy(() => import('./TutorCreateQuizPage'));
const TutorQuizzesPage = lazy(() => import('./TutorQuizzesPage'));
const TutorQuizResultsPage = lazy(() => import('./TutorQuizResultsPage'));
const TutorStudentsPage = lazy(() => import('./TutorStudentsPage'));
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

const TutorRoutes: React.FC = () => {
  const user = getCurrentUser();

  return (
    <ProtectedRoute user={user} allowedRoles={[UserRole.INSTRUCTOR]} fallbackPath="/dashboard">
      <SharedDashboardLayout user={user}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route index element={<TutorDashboardHome user={user} />} />
            <Route path="courses" element={<TutorCoursesPage />} />
            <Route path="courses/create" element={<TutorCreateCoursePage />} />
            <Route path="courses/:id" element={<TutorCourseDetailPage />} />
            <Route path="courses/:id/edit" element={<TutorEditCoursePage />} />
            <Route path="courses/:id/materials" element={<TutorCourseMaterialsPage />} />
            <Route path="courses/:id/delete" element={<TutorCourseDeletePage />} />
            <Route path="courses/categories" element={<TutorCoursesPage />} />
            <Route path="courses/reviews" element={<TutorCoursesPage />} />
            <Route path="analytics" element={<TutorAnalyticsPage />} />
            <Route path="quizzes" element={<TutorQuizzesPage />} />
            <Route path="quizzes/:quizId/results" element={<TutorQuizResultsPage />} />
            <Route path="students" element={<TutorStudentsPage />} />
            <Route path="courses/:courseId/quiz/create" element={<TutorCreateQuizPage />} />
            <Route path="courses/:courseId/quiz/:quizId/results" element={<TutorQuizResultsPage />} />
            <Route path="notifications" element={<TutorNotificationsPage />} />
            <Route path="notifications/:id" element={<NotificationDetailPage />} />
            <Route path="profile" element={<TutorProfilePage user={user} />} />
            <Route path="settings" element={<TutorSettingsPage />} />
            <Route path="support" element={<SupportPage user={user} />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="*" element={<Navigate to="/tutor" replace />} />
          </Routes>
        </Suspense>
      </SharedDashboardLayout>
    </ProtectedRoute>
  );
};

export default TutorRoutes;
