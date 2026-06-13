import React from 'react';
import WorkspaceSettingsPage from '../../components/account/WorkspaceSettingsPage';

const ContributorSettingsPage: React.FC = () => (
  <WorkspaceSettingsPage
    roleLabel="Contributor"
    heading="Contributor Settings"
    description="Control notification preferences, workspace defaults, and appearance options."
  />
);

export default ContributorSettingsPage;