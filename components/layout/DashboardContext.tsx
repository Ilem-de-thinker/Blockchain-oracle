import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { AppShell } from '@/components/layout';

interface DashboardContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  activeIcon: string;
  setActiveIcon: (icon: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  user,
  setUser,
}) => {
  const [activeIcon, setActiveIcon] = useState('dashboard');
  const role = user?.role || UserRole.LEARNER;

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/courses') || path.includes('/course/')) {
      setActiveIcon('courses');
    } else if (path.includes('/progress')) {
      setActiveIcon('progress');
    } else if (path.includes('/events')) {
      setActiveIcon('events');
    } else if (path.includes('/settings') || path.includes('/profile')) {
      setActiveIcon('settings');
    } else {
      setActiveIcon('dashboard');
    }
  }, []);

  return (
    <DashboardContext.Provider value={{ user, setUser, activeIcon, setActiveIcon }}>
      <AppShell
        role={role}
        profile={
          user
            ? {
                name: user.name || user.email || 'User',
                avatar: user.avatar,
                is_verified: user.is_verified,
              }
            : undefined
        }
        defaultActiveIcon={activeIcon}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </AppShell>
    </DashboardContext.Provider>
  );
};

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const DashboardLayoutWrapper: React.FC<DashboardLayoutWrapperProps> = ({
  children,
  user,
  setUser,
}) => {
  return (
    <DashboardProvider user={user} setUser={setUser}>
      {children}
    </DashboardProvider>
  );
};
 
