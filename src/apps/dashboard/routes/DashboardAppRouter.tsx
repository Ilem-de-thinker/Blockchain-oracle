import React, { Suspense, lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

const DashboardHome = lazy(() => import('../pages/DashboardHome'));
const CoursesPage = lazy(() => import('../pages/CoursesPage'));
const AllCoursesPage = lazy(() => import('../pages/AllCoursesPage'));
const CoursePlayerPage = lazy(() => import('../pages/CoursePlayerPage'));
const QuizPage = lazy(() => import('../pages/QuizPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ProgressPage = lazy(() => import('../pages/ProgressPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const CertificatesPage = lazy(() => import('../pages/CertificatesPage'));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
const TransactionDetailPage = lazy(() => import('../pages/TransactionDetailPage'));
const PaymentVerifyPage = lazy(() => import('../pages/PaymentVerifyPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const NotificationDetailPage = lazy(() => import('../../shared/ui/NotificationDetailPage'));
const MyRegistrationsPage = lazy(() => import('../pages/MyRegistrationsPage'));
const RegistrationDetailPage = lazy(() => import('../pages/RegistrationDetailPage'));
const EnrollmentDetailPage = lazy(() => import('../pages/EnrollmentDetailPage'));
const QuizListPage = lazy(() => import('../pages/QuizListPage'));
const TakeQuizPage = lazy(() => import('../pages/TakeQuizPage'));
const EventDetailPage = lazy(() => import('../pages/EventDetailPage'));
const KYCPage = lazy(() => import('../pages/KYCPage'));
const SupportPage = lazy(() => import('../../shared/ui/SupportPage'));

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <i className="fas fa-circle-notch fa-spin text-4xl text-accent mb-4"></i>
      <p className="text-text-muted">Loading...</p>
    </div>
  </div>
);

const DashboardAppRouter: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Route index element={<DashboardHome />} />
    <Route path="courses" element={<CoursesPage />} />
    <Route path="courses/all" element={<AllCoursesPage />} />
    <Route path="course/:id/quiz/:quizId" element={<QuizPage />} />
    <Route path="course/:id" element={<CoursePlayerPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="kyc" element={<KYCPage />} />
    <Route path="progress" element={<ProgressPage />} />
    <Route path="events" element={<EventsPage />} />
    <Route path="events/:id" element={<EventDetailPage />} />
    <Route path="transactions" element={<TransactionsPage />} />
    <Route path="transactions/:reference" element={<TransactionDetailPage />} />
    <Route path="payment/verify/:reference" element={<PaymentVerifyPage />} />
    <Route path="payment/verify" element={<PaymentVerifyPage />} />
    <Route path="certificates" element={<CertificatesPage />} />
    <Route path="notifications" element={<NotificationsPage />} />
    <Route path="notifications/:id" element={<NotificationDetailPage />} />
    <Route path="registrations" element={<MyRegistrationsPage />} />
    <Route path="registrations/:id" element={<RegistrationDetailPage />} />
    <Route path="enrollment/:id" element={<EnrollmentDetailPage />} />
    <Route path="quizzes" element={<QuizListPage />} />
    <Route path="quiz/:quizId/take" element={<TakeQuizPage />} />
    <Route path="support" element={<SupportPage />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Suspense>
);

export default DashboardAppRouter;
