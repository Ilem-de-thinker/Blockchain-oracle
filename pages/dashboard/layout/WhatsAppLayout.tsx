import React from 'react';
import { User } from '../../../types';
import { SharedDashboardLayout } from '../../../components/layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user }) => {
  return (
    <SharedDashboardLayout user={user}>
      {children}
    </SharedDashboardLayout>
  );
};

export default DashboardLayout;
