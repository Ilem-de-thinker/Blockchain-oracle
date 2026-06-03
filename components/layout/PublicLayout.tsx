import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="public-layout min-h-screen flex flex-col">
      {children}
    </div>
  );
};

export default PublicLayout;
