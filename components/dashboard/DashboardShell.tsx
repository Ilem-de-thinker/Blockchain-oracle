import React, { useState } from 'react';
import { UserRole } from '@/types';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  } | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50">
      <Sidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user as any}
      />

      <div className="md:pl-72 transition-all duration-300">
        <Header
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6 md:p-8 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
