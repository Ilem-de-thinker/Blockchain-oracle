import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  ChevronRight,
  LogOut, 
  User, 
  Settings, 
  Droplets,
  Moon, 
  Sun, 
  Menu, 
  X, 
  Palette,
  Shield,
  ShieldCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import notificationsApi, { Notification } from '@/src/api/notifications';
import { useToast } from '@/src/hooks/useToast';
import { useTheme, accentOptions } from '@/contexts/ThemeContext';

interface TopNavbarProps {
  user?: {
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
    is_verified?: boolean;
  };
  onSignOut?: () => void;
  className?: string;
  onMenuClick?: () => void;
  isMobileDrawerOpen?: boolean;
}

const getProfilePath = (pathname: string): string => {
  const base = pathname.split('/')[1] || 'dashboard';
  return `/${base}/profile`;
};

const getSettingsPath = (pathname: string): string => {
  const base = pathname.split('/')[1] || 'dashboard';
  return `/${base}/settings`;
};

const getNotificationsPath = (pathname: string): string => {
  const base = pathname.split('/')[1] || 'dashboard';
  return `/${base}/notifications`;
};

const getIconForType = (type: string): string => {
  switch (type) {
    case 'course': return 'fa-book';
    case 'event': return 'fa-calendar';
    case 'payment': return 'fa-credit-card';
    case 'achievement': return 'fa-trophy';
    case 'system': return 'fa-info';
    default: return 'fa-bell';
  }
};

const getColorForType = (type: string): string => {
  switch (type) {
    case 'course': return 'bg-blue-100 text-blue-600';
    case 'event': return 'bg-emerald-100 text-emerald-600';
    case 'payment': return 'bg-green-100 text-success';
    case 'achievement': return 'bg-amber-100 text-amber-600';
    case 'system': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

interface MobileThemeSwitcherProps {
  onOpen: () => void;
}

const MobileThemeSwitcher: React.FC<MobileThemeSwitcherProps> = ({ onOpen }) => {
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'ocean' as const, label: 'Ocean', icon: Monitor },
  ];

  return (
    <DropdownMenu onOpenChange={(open) => {
      if (open && onOpen) onOpen();
    }}>
      <DropdownMenuTrigger asChild>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted transition-all glass-dropdown"
          aria-label="Theme settings"
        >
          <Palette className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={8}
        align="end"
        className="w-64"
      >
        <div className="px-2 py-1.5">
          <p className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-text-muted">
            Theme
          </p>
        </div>

        {themeOptions.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => changeTheme(theme.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
              themeMode === theme.id && 'bg-primary/10 text-primary'
            )}
          >
            <theme.icon className="w-4 h-4" />
            <span>{theme.label}</span>
            {themeMode === theme.id && (
              <i className="fas fa-check ml-auto text-xs" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1" />

        <div className="px-2 py-1.5">
          <p className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-text-muted">
            Accent Color
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2">
          {accentOptions.map((accent) => (
            <button
              key={accent.id}
              onClick={() => changeAccent(accent.id)}
              className={cn(
                'w-8 h-8 rounded-full transition-transform',
                buttonColor === accent.color
                  ? 'ring-2 ring-offset-2 ring-border ring-offset-bg scale-110'
                  : ''
              )}
              style={{ backgroundColor: accent.color }}
              aria-label={`${accent.id} accent`}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TopNavbar: React.FC<TopNavbarProps> = ({ user, onSignOut, className, onMenuClick, isMobileDrawerOpen, hideLeftSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const profilePath = getProfilePath(location.pathname);
  const settingsPath = getSettingsPath(location.pathname);
  const notificationsPath = getNotificationsPath(location.pathname);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getNotifications(1, 8);
      setNotifications(data.results || data.items || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    if (onSignOut) onSignOut();
    else navigate('/');
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const navIcons = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard' },
    { id: 'courses', href: '/courses', label: 'Courses' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-40',
      'h-14 lg:h-16',
      'px-3 sm:px-6 flex items-center justify-between',
      'shadow-md',
      className
    )}
      style={{
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid var(--border)',
      }}>
      {/* Left Section - Menu Toggle & Logo/Brand */}
      {!hideLeftSection ? (
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-surface-alt/50 text-text hover:text-primary transition-all active:scale-95 border border-border/50"
            aria-label="Toggle menu"
          >
            {isMobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2 lg:ml-[72px]">
            <img src="/Logo/logo.png" alt="BlockchainOracle" className="w-6 h-6 object-contain flex-shrink-0" />
            <span
              className="text-base sm:text-lg text-text hidden sm:inline"
              style={{
                fontWeight: 700,
                letterSpacing: '0.04em',
                textShadow: '0 2px 8px rgb(0 0 0 / 0.4)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em', fontFamily: "'Montserrat', sans-serif" }}>0</span>racle</span>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-text" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <img src="/Logo/logo.png" alt="Logo" className="w-6 h-6 object-contain flex-shrink-0" />
            <span className="text-lg font-bold text-primary hidden sm:inline">SupportHub</span>
          </Link>

          {/* Desktop Sidebar Links in Top Nav */}
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            {navIcons.map((icon) => (
              <Link
                key={icon.id}
                to={icon.href}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  pathname === icon.href 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-text-muted hover:text-text"
                )}
              >
                {icon.label}
              </Link>
            ))}
            <Link
              to={`/${pathname.split('/')[1]}/community`}
              className="text-sm font-semibold transition-colors text-text-muted hover:text-text"
            >
              Community
            </Link>
            <Link
              to={pathname}
              className="text-sm font-semibold text-primary border-b-2 border-primary pb-1"
            >
              Support
            </Link>
          </nav>
        </div>
      )}
      
      {/* Right Section - Actions */}
      <div className={cn("flex items-center gap-1 sm:gap-2", hideLeftSection && "ml-auto")}>
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setDropdownOpen(false);
            }}
            className={cn(
              "relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all border border-transparent",
              notificationOpen ? "bg-primary/10 text-primary border-primary/20" : "text-text-muted hover:bg-surface-hover hover:text-text hover:-translate-y-0.5 hover:scale-105"
            )}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-primary rounded-full text-[9px] font-black text-white px-1 shadow-lg ring-2 ring-white/20">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {notificationOpen && (
            <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[80]">
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-alt/30">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-text">Intelligence Feed</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-[9px] font-black text-primary hover:underline uppercase">Mark All</button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-xs text-text-muted italic opacity-50">Empty feed</div>
                ) : (
                  notifications.slice(0, 5).map(notif => (
                    <Link
                      key={notif.id}
                      to={`${notificationsPath}/${notif.id}`}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-surface-alt transition-colors",
                        !notif.is_read && "bg-primary/[0.02] border-l-2 border-primary"
                      )}
                      onClick={() => { handleMarkAsRead(notif.id); setNotificationOpen(false); }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-text leading-tight uppercase tracking-tight">{notif.title}</p>
                        <p className="text-[10px] text-text-muted mt-1 line-clamp-1">{notif.message}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <Link to={notificationsPath} className="block p-3 text-center text-[10px] font-black uppercase tracking-widest bg-surface-alt/50 hover:bg-primary hover:text-white transition-all border-t border-border" onClick={() => setNotificationOpen(false)}>
                Protocol History
              </Link>
            </div>
          )}
        </div>

        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-text-muted transition-all"
            aria-label="Customize settings"
          >
            <Palette size={20} />
          </button>

          {themeOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[80]">
              <div className="p-3 space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted px-1">Theme</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'light' as const, icon: Sun },
                      { id: 'dark' as const, icon: Moon },
                      { id: 'ocean' as const, icon: Droplets },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { changeTheme(t.id); setThemeOpen(false); }}
                        className={cn(
                          "flex flex-col items-center gap-1 py-2 rounded-xl border transition-all",
                          themeMode === t.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-surface-alt border-border text-text-muted"
                        )}
                      >
                        <t.icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted px-1">Accent</p>
                  <div className="flex items-center gap-2 px-1">
                    {accentOptions.map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => { changeAccent(accent.id); setThemeOpen(false); }}
                        className={cn(
                          "w-7 h-7 rounded-full transition-transform flex items-center justify-center",
                          buttonColor === accent.color ? "ring-2 ring-offset-2 ring-border scale-110" : ""
                        )}
                        style={{ backgroundColor: accent.color }}
                        aria-label={`${accent.id} accent`}
                      >
                        {buttonColor === accent.color && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 p-1 rounded-xl transition-all border border-transparent relative hover:-translate-y-0.5 hover:scale-105",
              dropdownOpen ? "bg-surface-hover border-border" : "hover:bg-surface-hover"
            )}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-alt flex items-center justify-center text-text font-black text-xs border border-border shadow-inner relative">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {user?.is_verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white/30 flex items-center justify-center shadow-sm z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-3 h-3 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
            )}
            <ChevronRight size={14} className={cn("text-white/60 transition-transform duration-300", dropdownOpen && "rotate-90")} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border bg-surface-alt/30">
                <p className="text-xs font-black text-text truncate uppercase tracking-tight">{user?.name || 'User'}</p>
                <p className="text-[9px] font-bold text-text-muted truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-2 space-y-0.5">
                {[
                  { label: 'Profile', icon: User, path: profilePath },
                  { label: 'Settings', icon: Settings, path: settingsPath },
                  { label: 'KYC Verification', icon: Shield, path: '/dashboard/kyc' }
                ].map((item) => (
                  <button key={item.label} onClick={() => { setDropdownOpen(false); navigate(item.path); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-text hover:bg-primary/5 hover:text-primary transition-all text-left">
                    <item.icon size={14} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-border bg-red-500/[0.02]">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all text-left group">
                  <LogOut size={14} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const TopNavbarThemeSwitcher: React.FC<{ onOpenChange?: () => void }> = ({ onOpenChange }) => {
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();
  const [hoverOpen, setHoverOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverOpen(true);
    onOpenChange?.();
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => setHoverOpen(false), 150);
  };

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'ocean' as const, label: 'Ocean', icon: Droplets },
  ];

  const accentOptions = [
    { id: 'purple' as const, color: '#7c3aed' },
    { id: 'green' as const, color: '#059669' },
    { id: 'blue' as const, color: '#2563eb' },
  ];

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => { setHoverOpen(prev => !prev); if (!hoverOpen) onOpenChange?.(); }}
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-text-muted transition-all"
        aria-label="Theme settings"
      >
        <Palette size={20} />
      </button>

      {hoverOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 z-[100] bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="px-2 py-1">
            <p className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">
              Theme
            </p>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-alt/30 rounded-lg mx-2 mb-0.5">
            {themeOptions.map((theme) => (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                className={cn(
                  'w-7 h-7 rounded-full cursor-pointer transition-all flex items-center justify-center',
                  themeMode === theme.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
                )}
              >
                <theme.icon size={13} />
              </button>
            ))}
          </div>

          <div className="h-px bg-border/50 mx-2 my-0.5" />

          <div className="px-2 py-1">
            <p className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">
              Accent
            </p>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-surface-alt/30 rounded-lg mx-2 mb-2">
            {accentOptions.map((accent) => (
              <button
                key={accent.id}
                onClick={() => changeAccent(accent.id)}
                className={cn(
                  'w-6 h-6 rounded-full transition-all relative group',
                  buttonColor === accent.id
                    ? 'ring-2 ring-offset-1 ring-primary scale-110 shadow-lg'
                    : 'opacity-60'
                )}
                style={{ backgroundColor: accent.color }}
                aria-label={`${accent.id} accent`}
              >
                {buttonColor === accent.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavbar;
