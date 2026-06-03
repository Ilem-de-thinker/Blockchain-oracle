"use client"

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { themeMode, buttonColor, changeTheme, changeAccent } = useTheme();

  const themeOptions = [
    { id: 'light' as const, label: 'Light', icon: '☀️' },
    { id: 'dark' as const, label: 'Dark', icon: '🌙' },
    { id: 'ocean' as const, label: 'Ocean', icon: '🌊' },
  ];

  const accentOptions = [
    { id: 'purple' as const, color: '#7c3aed', label: 'Purple' },
    { id: 'green' as const, color: '#059669', label: 'Green' },
    { id: 'blue' as const, color: '#2563eb', label: 'Blue' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-surface border border-border">
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Theme</h4>
        <div className="flex gap-2">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                themeMode === theme.id
                  ? 'bg-primary text-white shadow-primary/20 shadow-lg'
                  : 'bg-surface-hover text-text-secondary hover:bg-surface-active'
              }`}
            >
              {theme.icon} {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;