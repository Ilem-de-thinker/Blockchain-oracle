import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authApi } from '../src/api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export const getDefaultRouteForRole = (role: UserRole): string => {
  if (role === UserRole.SUPER_ADMIN) {
    return '/super-admin';
  }

  if (role === UserRole.ADMIN) {
    return '/admin';
  }

  if (role === UserRole.INSTRUCTOR) {
    return '/tutor';
  }

  if (role === UserRole.INFLUENCER) {
    return '/influencer';
  }

  if (role === UserRole.CONTRIBUTOR) {
    return '/contributor';
  }

  return '/dashboard';
};

export const GuestRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({
  children,
  user,
}) => {
  const isAuthenticated = authApi.isAuthenticated();

  if (user && isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

/**
 * ProtectedRoute - Restricts access based on user role
 * Also checks for valid authentication token
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  user,
  allowedRoles = [],
  fallbackPath = '/dashboard',
}) => {
  const location = useLocation();

  // Check if authenticated (has valid token)
  const isAuthenticated = authApi.isAuthenticated();
  
  // Not authenticated - redirect to login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect to fallback
    return <Navigate to={fallbackPath || getDefaultRouteForRole(user.role)} replace />;
  }

  // User has permission - render children
  return <>{children}</>;
};

/**
 * AdminRoute - Restricts access to admin-only routes
 * Only ADMIN can access the /admin namespace
 */
export const AdminRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({
  children,
  user,
}) => {
  const location = useLocation();

  // Check if authenticated
  const isAuthenticated = authApi.isAuthenticated();

  // Not authenticated - redirect to login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only the dedicated ADMIN role can access the /admin namespace.
  // Tutors and super admins have their own isolated route trees.
  if (user.role !== UserRole.ADMIN) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // User has admin permission - render children
  return <>{children}</>;
};

/**
 * TutorRoute - Restricts access to tutor-only features
 * Only INSTRUCTOR (Tutor) can access
 */
export const TutorRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({
  children,
  user,
}) => {
  const location = useLocation();

  // Check if authenticated
  const isAuthenticated = authApi.isAuthenticated();

  // Not authenticated - redirect to login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is a tutor
  if (user.role !== UserRole.INSTRUCTOR) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // User is a tutor - render children
  return <>{children}</>;
};

/**
 * StudentRoute - Restricts access to student-only features
 * Only LEARNER (Student) can access
 */
export const StudentRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({
  children,
  user,
}) => {
  const location = useLocation();

  // Check if authenticated
  const isAuthenticated = authApi.isAuthenticated();

  // Not authenticated - redirect to login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is a student
  if (user.role !== UserRole.LEARNER) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // User is a student - render children
  return <>{children}</>;
};

export default ProtectedRoute;
