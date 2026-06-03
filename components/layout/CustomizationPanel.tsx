import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme, accentOptions } from '@/contexts/ThemeContext';
import { Sun, Moon, Droplets, X } from 'lucide-react';

interface CustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ isOpen, onClose }) => {
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'ocean' as const, label: 'Ocean', icon: Droplets },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-surface border-l border-border shadow-2xl z-[70] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-black text-sm uppercase tracking-widest text-text">Customization</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl text-text-muted hover:text-text transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Mode */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Theme Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                    themeMode === theme.id 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-surface-alt border-border text-text-muted hover:border-text-muted"
                  )}
                >
                  <theme.icon size={20} />
                  <span className="text-[9px] font-black uppercase tracking-wider">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Accent Color</h3>
            <div className="flex items-center gap-3">
              {accentOptions.map((accent) => (
                <button
                  key={accent.id}
                  onClick={() => changeAccent(accent.id)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-transform flex items-center justify-center",
                    buttonColor === accent.color
                      ? "ring-2 ring-offset-2 ring-border scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: accent.color }}
                  aria-label={`${accent.id} accent`}
                >
                  {buttonColor === accent.color && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomizationPanel;
