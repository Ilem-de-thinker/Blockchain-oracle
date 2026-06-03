import { useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MenuGroup, getRoleLabel } from './IconSidebar';
import { UserRole } from '@/types';
import { X, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export interface MenuPanelProps {
  menus?: Record<string, MenuGroup>;
  menu: MenuGroup | null;
  onClose?: () => void;
  isOpen?: boolean;
  role?: UserRole;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MenuPanel = ({
  menus = {},
  menu,
  onClose,
  isOpen,
  role,
  className,
  collapsed = false,
  onToggleCollapse,
}: MenuPanelProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { buttonColor } = useTheme();
  const handleMenuItemClick = useCallback((href: string) => {
    navigate(href);
    onClose?.();
  }, [navigate, onClose]);

  if (!menu && !Object.keys(menus).length) return null;

  return (
    <>
      {/* Desktop Menu Panel - Fixed sidebar with all groups */}
      <div
        className={cn(
          'hidden lg:flex fixed left-[72px] top-14 lg:top-16 h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] z-40',
          'flex-col sidebar-transition',
          'shadow-[2px_0_12px_-4px_rgba(0,0,0,0.08)] backdrop-blur-xl',
          'animate-slide-in duration-200',
          collapsed ? 'w-[72px]' : 'w-[280px]',
          className
        )}
        style={{
          background: `linear-gradient(to bottom right, color-mix(in srgb, ${buttonColor}, transparent 96%) 0%, color-mix(in srgb, ${buttonColor}, transparent 86%) 100%), var(--sidebar-bg)`,
          color: 'var(--sidebar-text)',
        }}
      >
        <nav className={cn("flex-1 overflow-y-auto scrollbar-thin pt-6", collapsed ? "px-1" : "p-4")}>
          {Object.entries(menus).map(([key, group]) => {
            const menuGroup = group as MenuGroup;
            return (
              <div key={key} className={cn("mb-6 last:mb-0", collapsed && "flex flex-col items-center")}>
                {!collapsed && (
                  <h3 className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--sidebar-text)' }}>
                    {menuGroup.title}
                  </h3>
                )}
                <ul className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
                  {menuGroup.items.map((item) => (
                    <li key={item.id} className={collapsed ? "w-full flex justify-center" : ""}>
                      <NavLink
                        to={item.href}
                        end
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 py-2 rounded-lg transition-all text-sm',
                            'hover:bg-white/10',
                            isActive ? 'border-2 font-bold' : '',
                            collapsed ? 'justify-center w-full px-0' : 'px-4'
                          )
                        }
                        style={({ isActive }) => ({
                          color: 'var(--sidebar-text)',
                          borderColor: isActive ? 'var(--sidebar-border-active)' : 'transparent',
                          boxShadow: isActive ? '0 0 10px color-mix(in srgb, var(--sidebar-border-active) 30%, transparent)' : 'none',
                        })}
                        title={collapsed ? item.label : undefined}
                      >
                        {item.icon && <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors")} />}
                        {!collapsed && <span className="flex-1">{item.label}</span>}
                        {!collapsed && item.badge !== undefined && item.badge > 0 && (
                          <span className="min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-primary text-white text-[9px] font-bold rounded-md">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Collapse Button */}
        {onToggleCollapse && (
          <div className="p-2 border-t sidebar-transition" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <button
              onClick={onToggleCollapse}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors",
                collapsed && "justify-center"
              )}
            >
              {collapsed ? (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--sidebar-text)' }} />
              ) : (
                <>
                  <ChevronUp className="w-5 h-5" style={{ color: 'var(--sidebar-text)' }} />
                  <span className="text-sm" style={{ color: 'var(--sidebar-text)' }}>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Floating Drawer - Above bottom nav */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-[60]',
          isOpen && menu ? 'visible' : 'invisible'
        )}
      >
        {/* Backdrop overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/[0.03] transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={onClose}
        />

        {/* Floating drawer */}
        {menu && (
          <div
            className={cn(
              'absolute bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-1/2 -translate-x-1/2',
              'bg-surface/30 backdrop-blur-xl saturate-150 border border-border/20 shadow-2xl',
              'flex flex-col items-center',
              'transition-all duration-300 ease-out',
              'w-auto max-w-[calc(100vw-3rem)] rounded-xl max-h-[20rem]',
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}
          >
            {/* Drawer Header */}
            <div className="w-full px-4 py-3 border-b border-border/40 flex items-center justify-between flex-shrink-0 bg-surface-alt/10">
              <h2 className="text-sm font-semibold text-text truncate">{menu.title}</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-alt text-text-muted hover:text-text transition-all active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="w-full flex-1 overflow-y-auto custom-scrollbar p-1.5">
              <ul className="space-y-0.5">
                {menu.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.id} className="w-full">
                      <button
                        onClick={() => handleMenuItemClick(item.href)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full',
                          'text-text/70 hover:bg-surface-hover hover:text-text',
                          isActive && 'bg-primary/5 text-primary font-bold border border-primary/10'
                        )}
                      >
                        {item.icon && <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "text-text-muted")} />}
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3 text-primary/40" />}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="min-w-[16px] h-[16px] px-1.5 flex items-center justify-center bg-primary text-white text-[9px] font-bold rounded-md">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            
          </div>
        )}
      </div>
    </>
  );
};

export default MenuPanel;
