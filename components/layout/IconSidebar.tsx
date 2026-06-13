import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Settings,
  BarChart3,
  CreditCard,
  Users,
  Bell,
  Shield,
  Wallet,
  TrendingUp,
  Play,
  Award,
  FileText,
  MessageSquare,
  User,
  UserPlus,
  LogOut,
  Settings2,
  GraduationCap,
  ClipboardCheck,
  Headphones,
  Quote,
} from 'lucide-react';
import { UserRole } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

export const getRoleLabel = (role?: UserRole): string => {
  const labels: Record<string, string> = {
    [UserRole.LEARNER]: 'Learner',
    [UserRole.ENTERPRISE]: 'Enterprise',
    [UserRole.INSTRUCTOR]: 'Instructor',
    [UserRole.INFLUENCER]: 'Influencer',
    [UserRole.CONTRIBUTOR]: 'Contributor',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.SUPER_ADMIN]: 'Super Admin',
  };
  return role ? labels[role] || 'Learner' : 'Learner';
};

export interface IconConfig {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  menuId: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface IconSidebarProps {
  icons: IconConfig[];
  activeIcon: string;
  onIconChange: (iconId: string) => void;
  role?: UserRole;
  profile?: {
    name: string;
    avatar?: string;
  };
  settingsHref?: string;
  onSignOut?: () => void;
  className?: string;
}

const IconSidebar: React.FC<IconSidebarProps> = ({
  icons,
  activeIcon,
  onIconChange,
  role,
  profile,
  settingsHref,
  onSignOut,
  className,
}) => {
  const { buttonColor } = useTheme();
  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 h-full w-[72px] z-50',
          'flex-col items-center sidebar-transition',
          'shadow-[1px_0_8px_rgba(0,0,0,0.08)] backdrop-blur-xl',
          className
        )}
        style={{
          background: `linear-gradient(to bottom right, color-mix(in srgb, ${buttonColor}, transparent 96%) 0%, color-mix(in srgb, ${buttonColor}, transparent 86%) 100%), var(--sidebar-bg)`,
          color: 'var(--sidebar-text)',
        }}
      >
        <div className="flex flex-col items-center h-full w-full relative">

          {/* Bottom glow gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.03), transparent)' }} />

          {/* Main navigation icons */}
          <nav className="flex flex-col items-center gap-2 py-4 flex-1">
            {icons.map((item) => {
              const isActive = activeIcon === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onIconChange(item.id)}
                  title={item.label}
                  className={cn(
                    'relative w-12 h-12 flex items-center justify-center rounded-xl transition-all',
                    isActive ? 'border-2' : 'hover:bg-black/5'
                  )}
                  style={{
                    borderColor: isActive ? 'var(--sidebar-border-active)' : 'transparent',
                    boxShadow: isActive ? '0 0 12px color-mix(in srgb, var(--sidebar-border-active) 30%, transparent)' : 'none',
                  }}
                >
                  <item.icon className={cn('w-6 h-6', isActive ? 'text-[var(--sidebar-border-active)]' : 'text-[var(--sidebar-text)]/50')} /> 
                  
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Spacer for desktop to push profile to bottom */}
          <div className="flex-1 hidden lg:block" />

          {profile && (
            <div className="w-full px-3 pb-4">
              <div className="rounded-2xl p-2 flex flex-col items-center gap-2"
                style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
              >
                <div className="grid grid-cols-1 gap-2 w-full">
                  <Link
                    to={settingsHref || '#'}
                    className="flex items-center justify-center rounded-xl px-2 py-2 hover:bg-black/5 transition-colors"
                    style={{ color: 'var(--sidebar-text)' }}
                    title="Settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center justify-center rounded-xl px-2 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <nav className={cn(
        'lg:hidden fixed bottom-0 inset-x-0 z-50',
        'backdrop-blur-xl shadow-2xl shadow-black/10',
        'rounded-t-2xl',
        'grid auto-cols-fr grid-flow-col items-stretch gap-1 px-2 pt-2',
        'safe-area-bottom'
      )}
      style={{
        background: `linear-gradient(to bottom right, color-mix(in srgb, ${buttonColor}, transparent 96%) 0%, color-mix(in srgb, ${buttonColor}, transparent 86%) 100%), var(--sidebar-bg)`,
      }}>
        {icons.map((item) => {
          const isActive = activeIcon === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onIconChange(item.id)}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-all h-14',
                isActive ? '' : 'hover:bg-black/5'
              )}
              style={{
                color: isActive ? 'var(--sidebar-border-active)' : 'var(--sidebar-text)',
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium leading-tight truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export const learnerMenus: Record<string, MenuGroup> = {
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  courses: {
    id: 'courses',
    title: 'Progress',
    items: [
      { id: 'my-courses', label: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
      { id: 'all-courses', label: 'All Courses', href: '/dashboard/courses/all', icon: GraduationCap },
      { id: 'progress', label: 'Progress & Analytics', href: '/dashboard/progress', icon: BarChart3 },
      { id: 'certificates', label: 'Certificates', href: '/dashboard/certificates', icon: Award },
    ],
  },
  events: {
    id: 'events',
    title: 'Events',
    items: [
      { id: 'events', label: 'All Events', href: '/dashboard/events', icon: Calendar },
      { id: 'my-events', label: 'My Events', href: '/dashboard/registrations', icon: UserPlus },
    ],
  },
  transactions: {
    id: 'transactions',
    title: 'Transactions',
    items: [
      { id: 'transactions', label: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    ],
  },
  testimonial: {
    id: 'testimonial',
    title: 'Testimonial',
    items: [
      { id: 'my-testimonial', label: 'My Testimonial', href: '/dashboard/testimonial', icon: Quote },
    ],
  },
};

export const tutorMenus: Record<string, MenuGroup> = {
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', href: '/tutor', icon: LayoutDashboard },
    ],
  },
  courses: {
    id: 'courses',
    title: 'My Courses',
    items: [
      { id: 'all-courses', label: 'All Courses', href: '/tutor/courses', icon: BookOpen },
      { id: 'create-course', label: 'Create Course', href: '/tutor/courses/create', icon: BookOpen },
    ],
  },
  students: {
    id: 'students',
    title: 'Students',
    items: [
      { id: 'my-students', label: 'My Students', href: '/tutor/students', icon: Users },
    ],
  },
  analytics: {
    id: 'analytics',
    title: 'Analytics',
    items: [
      { id: 'overview', label: 'Overview', href: '/tutor/analytics', icon: BarChart3 },
    ],
  },
  testimonial: {
    id: 'testimonial',
    title: 'Testimonial',
    items: [
      { id: 'my-testimonial', label: 'My Testimonial', href: '/tutor/testimonial', icon: Quote },
    ],
  },
};

export const iconConfigs: Record<UserRole, IconConfig[]> = {
  [UserRole.LEARNER]: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', menuId: 'dashboard' },
    { id: 'courses', icon: BookOpen, label: 'MY Progress', href: '/dashboard/courses', menuId: 'courses' },
    { id: 'events', icon: Calendar, label: 'Events', href: '/dashboard/events', menuId: 'events' },
    { id: 'transactions', icon: CreditCard, label: 'Transactions', href: '/dashboard/transactions', menuId: 'transactions' },
    { id: 'testimonial', icon: Quote, label: 'Testimonial', href: '/dashboard/testimonial', menuId: 'testimonial' },
    { id: 'support', icon: Headphones, label: 'Support', href: '/dashboard/support', menuId: 'support' },
  ],
  [UserRole.INSTRUCTOR]: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/tutor', menuId: 'dashboard' },
    { id: 'courses', icon: BookOpen, label: 'Courses', href: '/tutor/courses', menuId: 'courses' },
    { id: 'students', icon: Users, label: 'Students', href: '/tutor/students', menuId: 'students' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/tutor/analytics', menuId: 'analytics' },
    { id: 'testimonial', icon: Quote, label: 'Testimonial', href: '/tutor/testimonial', menuId: 'testimonial' },
    { id: 'support', icon: Headphones, label: 'Support', href: '/tutor/support', menuId: 'support' },
  ],

  [UserRole.INFLUENCER]: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/influencer', menuId: 'dashboard' },
    { id: 'campaigns', icon: TrendingUp, label: 'Campaigns', href: '/influencer/campaigns', menuId: 'campaigns' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/influencer/analytics', menuId: 'analytics' },
    { id: 'earnings', icon: Wallet, label: 'Earnings', href: '/influencer/earnings', menuId: 'earnings' },
    { id: 'support', icon: Headphones, label: 'Support', href: '/influencer/support', menuId: 'support' },
  ],
  [UserRole.CONTRIBUTOR]: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/contributor', menuId: 'dashboard' },
    { id: 'user-management', icon: Users, label: 'User Management', href: '/contributor/my-users', menuId: 'user-management' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/contributor/analytics', menuId: 'analytics' },
    { id: 'support', icon: Headphones, label: 'Support', href: '/contributor/support', menuId: 'support' },
  ],
  [UserRole.ENTERPRISE]: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', menuId: 'dashboard' },
    { id: 'courses', icon: BookOpen, label: 'Courses', href: '/dashboard/courses', menuId: 'courses' },
    { id: 'events', icon: Calendar, label: 'Events', href: '/dashboard/events', menuId: 'events' },
    { id: 'support', icon: Headphones, label: 'Support', href: '/dashboard/support', menuId: 'support' },
  ],
};

export const enterpriseMenus: Record<string, MenuGroup> = {
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  courses: {
    id: 'courses',
    title: 'My Courses',
    items: [
      { id: 'all-courses', label: 'All Courses', href: '/dashboard/courses', icon: BookOpen },
      { id: 'certificates', label: 'Certificates', href: '/dashboard/certificates', icon: Award },
      { id: 'transactions', label: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    ],
  },
  events: {
    id: 'events',
    title: 'Events',
    items: [
      { id: 'upcoming', label: 'All Events', href: '/dashboard/events', icon: Calendar },
      { id: 'my-events', label: 'My Events', href: '/dashboard/registrations', icon: UserPlus },
    ],
  },
  settings: {
    id: 'settings',
    title: 'Settings',
    items: [
      { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { id: 'profile', label: 'Profile', href: '/dashboard/profile', icon: User },
    ],
  },
};

export const menuConfigs: Record<UserRole, Record<string, MenuGroup>> = {
  [UserRole.LEARNER]: {
    ...learnerMenus,
    support: { id: 'support', title: 'Support', items: [
      { id: 'community', label: 'Community', href: '/dashboard/community', icon: Users },
      { id: 'tickets', label: 'Supports', href: '/dashboard/support', icon: Headphones },
    ]},
  },
  [UserRole.INSTRUCTOR]: {
    ...tutorMenus,
    students: { id: 'students', title: 'Students', items: [
      { id: 'my-students', label: 'My Students', href: '/tutor/students', icon: Users },
    ]},
    support: { id: 'support', title: 'Support', items: [
      { id: 'community', label: 'Community', href: '/tutor/community', icon: Users },
      { id: 'tickets', label: 'Supports', href: '/tutor/support', icon: Headphones },
    ]},
  },
  [UserRole.INFLUENCER]: {
    dashboard: { id: 'dashboard', title: 'Dashboard', items: [
      { id: 'overview', label: 'Overview', href: '/influencer', icon: LayoutDashboard },
    ]},
    campaigns: { id: 'campaigns', title: 'Campaigns', items: [
      { id: 'my-campaigns', label: 'My Campaigns', href: '/influencer/campaigns', icon: TrendingUp },
    ]},
    analytics: { id: 'analytics', title: 'Analytics', items: [
      { id: 'performance', label: 'Performance', href: '/influencer/analytics', icon: BarChart3 },
    ]},
    earnings: { id: 'earnings', title: 'Earnings', items: [
      { id: 'overview', label: 'Overview', href: '/influencer/earnings', icon: Wallet },
      { id: 'assets', label: 'Assets', href: '/influencer/assets', icon: FileText },
    ]},
    support: { id: 'support', title: 'Support', items: [
      { id: 'community', label: 'Community', href: '/influencer/community', icon: Users },
      { id: 'tickets', label: 'Supports', href: '/influencer/support', icon: Headphones },
    ]},
  },
  [UserRole.CONTRIBUTOR]: {
    dashboard: { id: 'dashboard', title: 'Dashboard', items: [
      { id: 'overview', label: 'Overview', href: '/contributor', icon: LayoutDashboard },
    ]},
    'user-management': { id: 'user-management', title: 'User Management', items: [
      { id: 'create-users', label: 'Bulk Create', href: '/contributor/create-users', icon: UserPlus },
      { id: 'my-users', label: 'My Users', href: '/contributor/my-users', icon: Users },
    ]},
    analytics: { id: 'analytics', title: 'Analytics', items: [
      { id: 'overview', label: 'Overview', href: '/contributor/analytics', icon: BarChart3 },
    ]},
    support: { id: 'support', title: 'Support', items: [
      { id: 'community', label: 'Community', href: '/contributor/community', icon: Users },
      { id: 'tickets', label: 'Supports', href: '/contributor/support', icon: Headphones },
    ]},
  },
  [UserRole.ENTERPRISE]: {
    ...enterpriseMenus,
    support: { id: 'support', title: 'Support', items: [
      { id: 'community', label: 'Community', href: '/dashboard/community', icon: Users },
      { id: 'tickets', label: 'Supports', href: '/dashboard/support', icon: Headphones },
    ]},
  },
};

export default IconSidebar;
