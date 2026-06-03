import React from 'react';
import WorkspaceSettingsPage from '@/components/account/WorkspaceSettingsPage';

const SettingsPage: React.FC = () => (
  <WorkspaceSettingsPage
    roleLabel="Learner"
    heading="Learner Settings"
    description="Manage your account profile, security settings, notification preferences, and workspace appearance."
  />
);

export default SettingsPage;
