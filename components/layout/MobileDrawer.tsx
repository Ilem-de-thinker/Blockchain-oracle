import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { MenuGroup, getRoleLabel } from './IconSidebar';
import { UserRole } from '@/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  menus?: Record<string, MenuGroup>;
  role?: UserRole;
  profile?: { name: string; avatar?: string; email?: string };
  profileHref?: string;
  settingsHref?: string;
  onSignOut?: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  menus = {},
  role,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuItemClick = (href: string) => {
    navigate(href);
    onClose();
  };

  const isActive = (href: string) => {
    // Exact match is the only way to avoid overlaps like /dashboard/courses matching /dashboard/courses/all
    return location.pathname === href;
  };

  return (
    <Drawer open={open} onOpenChange={(val) => !val && onClose()}>
      <DrawerContent 
        data-sidebar-region="true"
        side="left" 
        className="w-[280px] max-w-[280px] h-full p-0 flex flex-col sidebar-transition"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          color: 'var(--sidebar-text)',
        }}
      >
        <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
        <DrawerDescription className="sr-only">Dashboard navigation menu</DrawerDescription>
        
        <div className="p-6 pb-4 border-b sidebar-transition" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/Logo/logo.png" alt="BlockchainOracle" className="w-6 h-6 object-contain flex-shrink-0" />
              <span className="text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em', fontFamily: "'Montserrat', sans-serif" }}>0</span>racle</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
              aria-label="Close menu"
            >
              {/* <X className="w-5 h-5" /> */}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 pt-2">
          {Object.entries(menus).map(([key, group]) => {
            const menuGroup = group as MenuGroup;
            return (
              <div key={key} className="mb-6 last:mb-0">
                <h3 className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest">
                  {menuGroup.title}
                </h3>
                <ul className="space-y-1">
                  {menuGroup.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleMenuItemClick(item.href)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all w-full text-left',
                            'hover:bg-white/10',
                            active ? 'border-2 font-medium shadow-sm' : ''
                          )}
                          style={{
                            borderColor: active ? 'var(--sidebar-border-active)' : 'transparent',
                            boxShadow: active ? '0 0 8px color-mix(in srgb, var(--sidebar-border-active) 25%, transparent)' : 'none',
                          }}
                        >
                          {item.icon && <item.icon className="w-[18px] h-[18px] flex-shrink-0 transition-colors sidebar-link-muted" />}
                          <span className="text-sm flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t sidebar-transition" style={{ borderColor: 'var(--sidebar-border)' }}>
          <p className="text-[10px] font-bold text-center uppercase tracking-widest">Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
