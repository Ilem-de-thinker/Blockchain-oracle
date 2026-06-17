import React from 'react';
import { useLocation } from 'react-router-dom';
import { User } from '@/types';
import { AppShell } from '@/components/layout';
import FloatingChatSupport from '@/components/ui/chat-support';
import MouseTracker from '@/components/MouseTracker';

interface SharedDashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
  activeIcon?: string;
  hideFloatingChat?: boolean;
}

const SharedDashboardLayout: React.FC<SharedDashboardLayoutProps> = ({
  children,
  user,
  activeIcon,
  hideFloatingChat = false,
}) => {
  const location = useLocation();
  const role = user?.role || 'learner';
  const isSupportPage = location.pathname.endsWith('/support');
  const shouldHideChat = hideFloatingChat || isSupportPage;

  return (
    <AppShell
      role={role as any}
      profile={
        user
          ? {
              name: user.name || user.email || 'User',
              avatar: user.avatar,
              email: user.email,
              is_verified: user.is_verified,
            }
          : undefined
      }
      defaultActiveIcon={activeIcon}

    >
      <MouseTracker />
      <div className="min-h-screen ">
        {children}
      </div>
      {!shouldHideChat && <FloatingChatSupport />}
    </AppShell>
  );
};

export default SharedDashboardLayout;
