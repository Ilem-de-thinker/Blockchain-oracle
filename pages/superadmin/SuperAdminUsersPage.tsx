import React from 'react';
import UsersPage from '../admin/pages/UsersPage';

const SuperAdminUsersPage: React.FC = () => (
  <UsersPage
    title="User Governance"
    subtitle="Manage platform access and monitor user activity across all roles."
  />
);

export default SuperAdminUsersPage;
