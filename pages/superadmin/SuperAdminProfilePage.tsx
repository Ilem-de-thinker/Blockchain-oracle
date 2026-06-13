import React from 'react';
import { User } from '../../types';
import WorkspaceProfilePage from '../../components/account/WorkspaceProfilePage';

const SuperAdminProfilePage: React.FC<{ user: User | null }> = ({ user }) => (
  <WorkspaceProfilePage
    user={user}
    roleLabel="Super Admin"
    heading="Super Admin Profile"
    description="Manage the account identity used for privileged actions, governance approvals, and platform-wide oversight."
  />
);

export default SuperAdminProfilePage;
