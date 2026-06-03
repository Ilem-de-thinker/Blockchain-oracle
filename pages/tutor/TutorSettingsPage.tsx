import React from 'react';
import WorkspaceSettingsPage from '../../components/account/WorkspaceSettingsPage';

const TutorSettingsPage: React.FC = () => (
  <WorkspaceSettingsPage
    roleLabel="Tutor"
    heading="Tutor Settings"
    description="Control course-delivery preferences, creator workflow defaults, and tutor workspace behavior."
  />
);

export default TutorSettingsPage;
