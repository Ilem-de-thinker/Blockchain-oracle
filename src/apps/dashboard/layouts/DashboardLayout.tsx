import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { authApi } from '@/src/api/auth';
import { User } from '@/types';
import SharedDashboardLayout from '@/components/layout/SharedDashboardLayout';

const getCurrentUser = (): User | null => {
  return authApi.getStoredUser();
};

const DashboardLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-page-type', 'dashboard');
  }, []);

  return (
    <SharedDashboardLayout user={user}>
      <Outlet />
    </SharedDashboardLayout>
  );
};

export default DashboardLayout;
