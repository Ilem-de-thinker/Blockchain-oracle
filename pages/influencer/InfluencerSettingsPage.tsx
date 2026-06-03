import React from 'react';
import WorkspaceSettingsPage from '../../components/account/WorkspaceSettingsPage';

const InfluencerSettingsPage: React.FC = () => (
  <WorkspaceSettingsPage
    roleLabel="Influencer"
    heading="Influencer Settings"
    description="Control partner-notification preferences, campaign workspace defaults, and appearance options."
  />
);

export default InfluencerSettingsPage;
