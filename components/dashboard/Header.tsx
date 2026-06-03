import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Menu,
  Search,
  LogOut,
  User,
  Settings,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  user: UserType | null;
  onLogout: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      const isLast = index === paths.length - 1;

      return (
        <React.Fragment key={url}>
          {index > 0 && <span className="text-text-muted text-[10px] sm:text-xs">/</span>}
          {isLast ? (
            <span className="text-[11px] sm:text-sm font-bold text-text truncate max-w-[80px] sm:max-w-none">{label}</span>
          ) : (
            <Link to={url} className="text-[11px] sm:text-sm text-text-muted hover:text-primary transition-colors">
              {label}
            </Link>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 w-full border-b transition-all duration-300 bg-surface/95 border-border backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Left section - Menu & Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden h-9 w-9 rounded-xl text-text-secondary hover:bg-surface-hover shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
            {getBreadcrumbs()}
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className={cn(
          'hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200',
          searchFocused 
            ? 'w-96 border-primary/50 shadow-lg shadow-primary/10' 
            : 'w-80 border-transparent',
          'bg-surface-hover hover:bg-surface-active'
        )}>
          <Input
            type="search"
            placeholder="Search courses, events..."
            className="flex-1 bg-transparent border-0 p-0 text-sm focus-visible:ring-0 focus-visible:border-0 text-text placeholder:text-text-muted"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-surface text-text-muted">
            ⌘K
          </kbd>
        </div>

        {/* Right section - Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-xl text-text-secondary hover:bg-surface-hover"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl relative text-text-secondary hover:bg-surface-hover"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-surface" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl shadow-xl bg-surface border-border text-text">
              <DropdownMenuLabel className="flex items-center justify-between py-3 px-4">
                <span className="font-semibold">Notifications</span>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">3 new</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <ScrollArea className="h-64">
                <div className="py-2">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-primary/10">
                    <span className="text-sm font-medium">New course available</span>
                    <span className="text-xs text-text-muted">Advanced Solidity Patterns</span>
                    <span className="text-xs text-text-muted">2 hours ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-primary/10">
                    <span className="text-sm font-medium">Webinar reminder</span>
                    <span className="text-xs text-text-muted">DeFi Security starts in 1 hour</span>
                    <span className="text-xs text-text-muted">3 hours ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-primary/10">
                    <span className="text-sm font-medium">Certificate earned</span>
                    <span className="text-xs text-text-muted">Smart Contract Basics</span>
                    <span className="text-xs text-text-muted">1 day ago</span>
                  </DropdownMenuItem>
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 sm:h-10 pl-1 pr-2 sm:pr-3 rounded-xl border transition-colors border-border hover:bg-surface-hover"
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-[10px] font-bold">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start gap-0 ml-2">
                  <span className="text-sm font-medium text-text">{user?.name}</span>
                  <span className="text-xs capitalize text-text-muted">{user?.role}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 ml-1 text-text-muted" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl bg-surface border-border">
              <DropdownMenuLabel className="flex flex-col gap-1 py-3 px-4">
                <span className="text-sm font-medium text-text">{user?.name}</span>
                <span className="text-xs text-text-muted">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/dashboard/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/dashboard/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

const ScrollArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("overflow-y-auto", className)}>
    {children}
  </div>
);

export default Header;
