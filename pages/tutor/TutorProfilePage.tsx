import React from 'react';
import { User } from '../../types';
import WorkspaceProfilePage from '../../components/account/WorkspaceProfilePage';

const TutorProfilePage: React.FC<{ user: User | null }> = ({ user }) => (
  <WorkspaceProfilePage
    user={user}
    roleLabel="Tutor"
    heading="Tutor Profile"
    description="Manage your public instructor identity, account information, and creator-facing contact details."
  />
);

export default TutorProfilePage;
