import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentRoute } from '@/components/ProtectedRoute';
import { User } from '@/types';
import { SharedDashboardLayout } from '@/components/layout';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import DashboardHome from './pages/DashboardHome';
import CoursesPage from './pages/CoursesPage';
import AllCoursesPage from './pages/AllCoursesPage';
import CoursePlayerPage from '@/src/apps/dashboard/pages/CoursePlayerPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ProgressPage from './pages/ProgressPage';
import EventsPage from './pages/EventsPage';
import CertificatesPage from './pages/CertificatesPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationDetailPage from '../shared/NotificationDetailPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import RegistrationDetailPage from './pages/RegistrationDetailPage';
import EnrollmentDetailPage from './pages/EnrollmentDetailPage';
import QuizListPage from './pages/QuizListPage';
import TakeQuizPage from './pages/TakeQuizPage';
import EventDetailPage from './pages/EventDetailPage';
import KYCPage from './pages/KYCPage';
import SupportPage from '../shared/SupportPage';
import CommunityPage from './pages/CommunityPage';
import TestimonialSubmissionPage from './pages/TestimonialSubmissionPage';

interface DashboardRoutesProps {
  user: User | null;
}

const DashboardRoutes: React.FC<DashboardRoutesProps> = ({ user }) => {
  return (
    <SharedDashboardLayout user={user}>
      <ErrorBoundary>
        <Routes>
          <Route index element={
            <StudentRoute user={user}>
              <DashboardHome user={user} />
            </StudentRoute>
          } />
          <Route path="courses" element={
            <StudentRoute user={user}>
              <CoursesPage user={user} />
            </StudentRoute>
          } />
          <Route path="courses/all" element={
            <StudentRoute user={user}>
              <AllCoursesPage user={user} />
            </StudentRoute>
          } />
          <Route path="course/:id/quiz/:quizId" element={
            <StudentRoute user={user}>
              <QuizPage />
            </StudentRoute>
          } />
          <Route path="course/:id" element={
            <StudentRoute user={user}>
              <CoursePlayerPage user={user} />
            </StudentRoute>
          } />
          <Route path="profile" element={
            <StudentRoute user={user}>
              <ProfilePage user={user} />
            </StudentRoute>
          } />
          <Route path="settings" element={
            <StudentRoute user={user}>
              <SettingsPage user={user} />
            </StudentRoute>
          } />
          <Route path="kyc" element={
            <StudentRoute user={user}>
              <KYCPage />
            </StudentRoute>
          } />
          <Route path="progress" element={
            <StudentRoute user={user}>
              <ProgressPage user={user} />
            </StudentRoute>
          } />
          <Route path="events" element={
            <StudentRoute user={user}>
              <EventsPage user={user} />
            </StudentRoute>
          } />
          <Route path="transactions" element={
            <StudentRoute user={user}>
              <TransactionsPage user={user} />
            </StudentRoute>
          } />
          <Route path="transactions/:reference" element={
            <StudentRoute user={user}>
              <TransactionDetailPage />
            </StudentRoute>
          } />
          <Route path="payment/verify/:reference" element={
            <StudentRoute user={user}>
              <PaymentVerifyPage />
            </StudentRoute>
          } />
          <Route path="payment/verify" element={
            <StudentRoute user={user}>
              <PaymentVerifyPage />
            </StudentRoute>
          } />
          <Route path="certificates" element={
            <StudentRoute user={user}>
              <CertificatesPage user={user} />
            </StudentRoute>
          } />
          <Route path="notifications" element={
            <StudentRoute user={user}>
              <NotificationsPage user={user} />
            </StudentRoute>
          } />
          <Route path="notifications/:id" element={
            <StudentRoute user={user}>
              <NotificationDetailPage />
            </StudentRoute>
          } />
          <Route path="registrations" element={
            <StudentRoute user={user}>
              <MyRegistrationsPage user={user} />
            </StudentRoute>
          } />
          <Route path="registrations/:id" element={
            <StudentRoute user={user}>
              <RegistrationDetailPage user={user} />
            </StudentRoute>
          } />
          <Route path="enrollment/:id" element={
            <StudentRoute user={user}>
              <EnrollmentDetailPage user={user} />
            </StudentRoute>
          } />
          <Route path="events/:id" element={
            <StudentRoute user={user}>
              <EventDetailPage user={user} />
            </StudentRoute>
          } />
          <Route path="quizzes" element={
            <StudentRoute user={user}>
              <QuizListPage />
            </StudentRoute>
          } />
          <Route path="quiz/:quizId/take" element={
            <StudentRoute user={user}>
              <TakeQuizPage />
            </StudentRoute>
          } />
          <Route path="support" element={
            <StudentRoute user={user}>
              <SupportPage user={user} />
            </StudentRoute>
          } />
          <Route path="community" element={
            <StudentRoute user={user}>
              <CommunityPage />
            </StudentRoute>
          } />
          <Route path="testimonial" element={
            <StudentRoute user={user}>
              <TestimonialSubmissionPage user={user} />
            </StudentRoute>
          } />
        </Routes>
      </ErrorBoundary>
    </SharedDashboardLayout>
  );
};

export default DashboardRoutes;
