import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  User,
  Calendar,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  ChevronRight,
  Award,
  FileText,
  LinkIcon,
} from 'lucide-react';
import { UserRole } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, onClose, user }) => {
  const location = useLocation();
  const { buttonColor: buttonColors } = useTheme();

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getNavItems = () => {
  const learnerItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: BookOpen, label: 'My Courses', path: '/dashboard/courses' },
      { icon: LinkIcon, label: 'All Courses', path: '/dashboard/courses/all' },
      { icon: GraduationCap, label: 'Progress', path: '/dashboard/progress' },
      { icon: Award, label: 'Certificates', path: '/dashboard/certificates' },
      { icon: BarChart3, label: 'Transactions', path: '/dashboard/transactions' },
      { icon: Calendar, label: 'Events', path: '/dashboard/events' },
      { icon: Calendar, label: 'My Events', path: '/dashboard/registrations' },
    ];

    if (userRole === UserRole.INSTRUCTOR) {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: GraduationCap, label: 'My Courses', path: '/dashboard/instructor' },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
      ];
    }

    return learnerItems;
  };

  const bottomNavItems = [
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const navItems = getNavItems();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 transition-all duration-300 md:translate-x-0",
          "bg-surface border-r border-border"
        )}
      >
        <div className="flex h-20 items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all bg-gray-900 dark:bg-gray-800"
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-text">
                ALPHA<span className="text-gray-900 dark:text-white">KING</span>
              </span>
              <span className="text-xs text-text-muted">Learning Portal</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="ml-auto md:hidden p-2 rounded-lg text-text-muted hover:bg-surface-hover"
          >
            <LogOut className="h-5 w-5 rotate-180" />
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="px-4 py-6">
            <div className="mb-2">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-3 text-text-muted">
                Menu
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  // Use exact match for home dashboard, startsWith for others to avoid overlap
                  const isActive = item.path === '/dashboard' 
                    ? location.pathname === '/dashboard' 
                    : location.pathname.startsWith(item.path);

                  // Fix: if 'All Courses' (/dashboard/courses/all) is active, ensure 'My Courses' (/dashboard/courses) doesn't catch it
                  const isSpecificActive = item.path === '/dashboard/courses' && location.pathname === '/dashboard/courses/all' 
                    ? false 
                    : isActive;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        isSpecificActive
                          ? 'bg-gray-900 text-white shadow-lg dark:bg-gray-800'
                          : 'sidebar-link hover:bg-surface-hover'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isSpecificActive ? 'text-white' : 'sidebar-link-muted')} />
                      {item.label}
                      {isSpecificActive && <ChevronRight className="h-4 w-4 ml-auto text-white/80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Separator className="my-6 bg-border" />

            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-3 text-text-muted">
                Account
              </p>
              <nav className="space-y-1">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                          : 'sidebar-link hover:bg-surface-hover'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', isActive ? 'text-gray-900 dark:text-gray-100' : 'sidebar-link-muted')} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-surface">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gray-900 dark:bg-gray-800">
              {user ? getInitials(user.full_name || user.username || 'User') : '??'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-text">{user?.full_name || user?.username || 'Guest'}</p>
              <p className="text-xs text-text-muted">{user?.role === UserRole.INSTRUCTOR ? 'Instructor' : 'Pro Member'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
