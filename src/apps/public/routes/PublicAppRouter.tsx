import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';

const LandingPageV2 = lazy(() => import('../pages/LandingPageV2'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const CoursesCatalogPage = lazy(() => import('../pages/CoursesCatalogPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const TelegramChannelPage = lazy(() => import('../pages/TelegramChannelPage'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const ErrorPages = lazy(() => import('../pages/ErrorPages'));

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <img
        src="/Logo/logo.png"
        alt="Loading..."
        className="w-16 h-16 object-contain mx-auto mb-4"
        style={{ animation: 'rotatePulse 2s ease-in-out infinite' }}
      />
      <p className="text-sm text-text-muted">Loading...</p>
      <style>{`
        @keyframes rotatePulse {
          0% { transform: rotate(360deg) scale(1); opacity: 1; }
          50% { transform: rotate(180deg) scale(1.2); opacity: 0.7; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  </div>
);

const PublicAppRouter: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Route path="/" element={<LandingPageV2 />} />
    <Route path="/legacy" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/courses" element={<CoursesCatalogPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/telegram" element={<TelegramChannelPage />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="*" element={<ErrorPages />} />
  </Suspense>
);

export default PublicAppRouter;
