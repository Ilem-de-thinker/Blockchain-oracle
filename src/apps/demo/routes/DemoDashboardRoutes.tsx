import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { User } from '@/types';
import DemoDashboardLayout from '../pages/DemoDashboardLayout';
import DemoDashboardHome from '../pages/DemoDashboardHome';
import DemoCoursesPage from '../pages/DemoCoursesPage';
import DemoEventsPage from '../pages/DemoEventsPage';

interface DemoRoutesProps {
  user: User | null;
}

const DemoRoutes: React.FC<DemoRoutesProps> = ({ user }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/courses"
        element={
          <DemoDashboardLayout user={user}>
            <DemoCoursesPage />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/courses/all"
        element={
          <DemoDashboardLayout user={user}>
            <DemoCoursesPage />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/events"
        element={
          <DemoDashboardLayout user={user}>
            <DemoEventsPage />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/registrations"
        element={
          <DemoDashboardLayout user={user}>
            <DemoEventsPage />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/progress"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/certificates"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/transactions"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/community"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/support"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DemoDashboardLayout user={user}>
            <DemoDashboardHome user={user} />
          </DemoDashboardLayout>
        }
      />
      <Route path="*" element={<Navigate to="/demo-dashboard" replace />} />
    </Routes>
  );
};

export default DemoRoutes;
