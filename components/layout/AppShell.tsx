import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import IconSidebar, { IconConfig, iconConfigs, menuConfigs } from './IconSidebar';
import MobileDrawer from './MobileDrawer';
import MenuPanel from './MenuPanel';
import DashboardFooter from './DashboardFooter';
import TopNavbar from './TopNavbar';

export interface AppShellProps {
  children: React.ReactNode;
  role: UserRole;
  profile?: {
    name: string;
    avatar?: string;
    email?: string;
    is_verified?: boolean;
  };
  defaultActiveIcon?: string;
  className?: string;
}

const getActiveIconFromPath = (pathname: string, icons: IconConfig[]) => {
  // 1. First, look for an exact match (highest priority)
  const exactMatch = icons.find(icon => pathname === icon.href);
  if (exactMatch) return exactMatch.id;

  // 2. Then, look for the most specific (longest) prefix match
  let bestMatch = icons[0]?.id || 'dashboard';
  let bestMatchLength = 0;

  for (const icon of icons) {
    const href = icon.href;
    // We check if it starts with the href followed by a slash to avoid partial word matches
    // e.g., /dashboard/courses should not match /dashboard/courses-all if the latter existed
    if (pathname.startsWith(`${href}/`) && href.length > bestMatchLength) {
      bestMatch = icon.id;
      bestMatchLength = href.length;
    }
  }

  return bestMatch;
};

const AppShell: React.FC<AppShellProps> = ({
  children,
  role,
  profile,
  defaultActiveIcon,
  className,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const icons = iconConfigs[role] || iconConfigs[UserRole.LEARNER];
  const menus = menuConfigs[role] || menuConfigs[UserRole.LEARNER];

  const [menuOpen, setMenuOpen] = useState(false);
  const [targetIconId, setTargetIconId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isBottomNavExpanded, setIsBottomNavExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const handleToggleMenuCollapse = useCallback(() => {
    setMenuCollapsed(prev => !prev);
  }, []);

  const activeIcon = useMemo(
    () => getActiveIconFromPath(location.pathname, icons),
    [location.pathname, icons]
  );
  const isCategoryRoute = useMemo(
    () => icons.some(icon => location.pathname === icon.href),
    [location.pathname, icons]
  );
  const displayIcon = targetIconId || activeIcon;
  const currentMenu = useMemo(
    () => menus[displayIcon] || null,
    [menus, displayIcon]
  );
  const roleBasePath = useMemo(() => {
    if (role === UserRole.ADMIN) return '/admin';
    if (role === UserRole.SUPER_ADMIN) return '/super-admin';
    if (role === UserRole.INSTRUCTOR) return '/tutor';
    if (role === UserRole.INFLUENCER) return '/influencer';
    if (role === UserRole.CONTRIBUTOR) return '/contributor';
    return '/dashboard';
  }, [role]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setIsMobileDrawerOpen(false);
      setIsBottomNavExpanded(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsBottomNavExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDesktop) {
      setMenuOpen(false);
    }
  }, [isDesktop, location.pathname]);

  useEffect(() => {
    if (isDesktop) {
      const currentIcon = icons.find(icon => location.pathname === icon.href || location.pathname.startsWith(icon.href + '/'));
      if (currentIcon && currentIcon.menuId && menus[currentIcon.menuId]) {
        const menu = menus[currentIcon.menuId];
        if (menu.items.length === 1) {
          setMenuOpen(false);
        } else if (menu.items.length > 0) {
          setMenuOpen(true);
        } else {
          setMenuOpen(false);
        }
      } else {
        setMenuOpen(false);
      }
    }
  }, [location.pathname, isDesktop, icons, menus]);

  useEffect(() => {
    if (targetIconId) {
      const targetIcon = icons.find(i => i.id === targetIconId);
      if (targetIcon && location.pathname.startsWith(targetIcon.href)) {
        setTargetIconId(null);
      }
    }
  }, [location.pathname, targetIconId, icons]);

  const handleIconChange = useCallback((iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (!icon) return;

    const menu = menus[icon.menuId];
    if (menu && menu.items.length === 1) {
      navigate(menu.items[0].href);
      return;
    }

    setTargetIconId(iconId);
    setMenuOpen(true);
  }, [icons, menus, navigate]);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const handleMobileDrawerClose = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);

  const isSupportPage = location.pathname.endsWith('/support');

  return (
    <div className={cn('min-h-screen bg-bg', className)}>
      <MobileDrawer
        open={isMobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        menus={menus}
        role={role}
        profile={profile}
        profileHref={`${roleBasePath}/profile`}
        settingsHref={`${roleBasePath}/settings`}
        onSignOut={handleSignOut}
      />
      
      {!isSupportPage && (
        <>
          <IconSidebar
            icons={icons}
            activeIcon={activeIcon}
            onIconChange={handleIconChange}
            role={role}
            profile={profile}
            profileHref={`${roleBasePath}/profile`}
            settingsHref={`${roleBasePath}/settings`}
            onSignOut={handleSignOut}
          />

          <MenuPanel
            menus={menus}
            menu={currentMenu}
            isOpen={menuOpen}
            onClose={handleMenuClose}
            role={role}
            collapsed={menuCollapsed}
            onToggleCollapse={handleToggleMenuCollapse}
          />
        </>
      )}

      <div className={cn("transition-all duration-300", !isSupportPage ? (menuCollapsed ? "lg:ml-[144px]" : "lg:ml-[352px]") : "ml-0")}>
        <TopNavbar 
          user={{...profile, role}} 
          onSignOut={handleSignOut} 
          onMenuClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} 
          isMobileDrawerOpen={isMobileDrawerOpen} 
          hideLeftSection={isSupportPage}
        />

        <main
          className={cn(
            'min-h-screen transition-all duration-300',
            'bg-bg',
            'flex flex-col'
          )}
        >
          <div className={cn("flex-grow w-full px-4 lg:px-8 py-6 mt-15 pb-32 lg:pb-0 mb-6", isSupportPage && "p-0 mt-14 lg:mt-16")}>
            {children}
          </div>
          <DashboardFooter />
        </main>
      </div>

      <style>{`
        @keyframes slide-in-from-left {
          from {
            transform: translateX(-16px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in-from-left 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AppShell;
