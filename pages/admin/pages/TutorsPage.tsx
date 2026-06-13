import React from 'react';
import UsersPage from './UsersPage';

const TutorsPage: React.FC = () => {
  return (
    <UsersPage 
      initialRole="TUTOR" 
      title="Tutor Management" 
      subtitle="View and manage all platform tutors and instructors"
    />
  );
};

export default TutorsPage;
