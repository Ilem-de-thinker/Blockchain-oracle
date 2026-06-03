"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'ocean';
export type SidebarTheme = 'system' | 'light' | 'blue' | 'green' | 'purple';

type ThemeColors = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceAlt: string;
  border: string;
  borderHover: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textLink: string;
  sidebarLink: string;
  sidebarLinkMuted: string;
  accent: string;
  white: string;
  black: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  shadowColor: string;
};

interface ThemeDetails {
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: ThemeDetails;
  themeMode: ThemeMode;
  sidebarTheme: SidebarTheme;
  colors: ThemeColors;
  buttonColor: string;
  changeTheme: (mode: ThemeMode) => void;
  changeSidebarTheme: (theme: SidebarTheme) => void;
  changeAccent: (accent: 'purple' | 'green' | 'blue') => void;
}

const themeColors: Record<ThemeMode, ThemeColors> = {
  dark: {
    background: '#0a0e1a',
    backgroundSecondary: '#1e293b',
    surface: '#1e293b',
    surfaceHover: '#334155',
    surfaceActive: '#475569',
    surfaceAlt: '#334155',
    border: '#334155',
    borderHover: '#475569',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',
    textLink: '#e2e8f0',
    sidebarLink: '#e2e8f0',
    sidebarLinkMuted: '#94a3b8',
    accent: '#7c3aed',
    white: '#ffffff',
    black: '#000000',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#0f172a',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
  },
  light: {
    background: '#f5f0ff',
    backgroundSecondary: '#f8fafc',
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    surfaceActive: '#f3f4f6',
    surfaceAlt: '#f1f5f9',
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    textInverse: '#ffffff',
    textLink: '#000000',
    sidebarLink: '#000000',
    sidebarLinkMuted: '#6b7280',
    white: '#ffffff',
    black: '#000000',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  ocean: {
    background: '#08101a',
    backgroundSecondary: '#132f4c',
    surface: '#132f4c',
    surfaceHover: '#173a5e',
    surfaceActive: '#1e4976',
    surfaceAlt: '#173a5e',
    border: '#265d97',
    borderHover: '#3d7fc7',
    text: '#ffffff',
    textSecondary: '#b4cce5',
    textMuted: '#8ab4e0',
    textInverse: '#0c1929',
    textLink: '#e2e8f0',
    sidebarLink: '#e2e8f0',
    sidebarLinkMuted: '#8ab4e0',
    white: '#ffffff',
    black: '#000000',
    gray100: '#e3f2fd',
    gray200: '#bbdefb',
    gray300: '#90caf9',
    gray400: '#64b5f6',
    gray500: '#42a5f5',
    gray600: '#2196f3',
    gray700: '#1e88e5',
    gray800: '#1976d2',
    gray900: '#1565c0',
    shadowColor: 'rgba(0, 30, 60, 0.5)',
  },
};

export const accentOptions = [
  { id: 'purple' as const, color: '#7c3aed' },
  { id: 'green' as const, color: '#198754' },
  { id: 'blue' as const, color: '#2563eb' },
];

const defaultThemeMode: ThemeMode = 'light';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return defaultThemeMode;
  const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
  return saved && themeColors[saved] ? saved : defaultThemeMode;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [sidebarTheme, setSidebarTheme] = useState<SidebarTheme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('sidebar-theme') as SidebarTheme) || 'system';
  });
  const [accent, setAccent] = useState<'purple' | 'green' | 'blue'>(() => {
    if (typeof window === 'undefined') return 'purple';
    return (localStorage.getItem('accent-choice') as 'purple' | 'green' | 'blue') || 'purple';
  });

  const accentMap = {
    purple: '#7c3aed',
    green: '#198754',
    blue: '#2563eb',
  };

  const buttonColor = accentMap[accent];

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const colors = themeColors[themeMode];
    const root = document.documentElement;
    
    root.style.setProperty('--color-bg-raw', colors.background);
    root.style.setProperty('--color-bg-secondary-raw', colors.backgroundSecondary);
    root.style.setProperty('--color-surface-raw', colors.surface);
    root.style.setProperty('--color-surface-hover-raw', colors.surfaceHover);
    root.style.setProperty('--color-surface-active-raw', colors.surfaceActive);
    root.style.setProperty('--color-surface-alt-raw', colors.surfaceAlt);
    root.style.setProperty('--color-border-raw', colors.border);
    root.style.setProperty('--color-border-hover-raw', colors.borderHover);
    root.style.setProperty('--color-text-raw', colors.text);
    root.style.setProperty('--color-text-secondary-raw', colors.textSecondary);
    root.style.setProperty('--color-text-muted-raw', colors.textMuted);
    root.style.setProperty('--color-text-inverse-raw', colors.textInverse);
    root.style.setProperty('--color-text-link-raw', colors.textLink);
    root.style.setProperty('--color-white-raw', colors.white);
    root.style.setProperty('--color-black-raw', colors.black);
    root.style.setProperty('--color-gray-100-raw', colors.gray100);
    root.style.setProperty('--color-gray-200-raw', colors.gray200);
    root.style.setProperty('--color-gray-300-raw', colors.gray300);
    root.style.setProperty('--color-gray-400-raw', colors.gray400);
    root.style.setProperty('--color-gray-500-raw', colors.gray500);
    root.style.setProperty('--color-gray-600-raw', colors.gray600);
    root.style.setProperty('--color-gray-700-raw', colors.gray700);
    root.style.setProperty('--color-gray-800-raw', colors.gray800);
    root.style.setProperty('--color-gray-900-raw', colors.gray900);
    root.style.setProperty('--color-shadow-raw', colors.shadowColor);

    // Dynamic accent injection
    root.style.setProperty('--color-primary', buttonColor);
    root.style.setProperty('--color-primary-muted', `${buttonColor}1A`);
    
    // Specific hover color for Green
    const hoverColor = accent === 'green' ? '#146c43' : `color-mix(in srgb, ${buttonColor}, black 15%)`;
    root.style.setProperty('--color-primary-hover', hoverColor);
    
    root.style.colorScheme = themeMode === 'dark' ? 'dark' : 'light';
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
    root.setAttribute('data-theme', themeMode);
    localStorage.setItem('theme-mode', themeMode);
    localStorage.setItem('sidebar-theme', sidebarTheme);
    localStorage.setItem('accent-choice', accent);
  }, [themeMode, sidebarTheme, accent, buttonColor]);

  const changeTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const changeSidebarTheme = (theme: SidebarTheme) => {
    setSidebarTheme(theme);
  };

  const changeAccent = (accent: 'purple' | 'green' | 'blue') => {
    setAccent(accent);
  };

  const themeDetails: ThemeDetails = {
    mode: themeMode,
  };

  const colors = themeColors[themeMode];

  return (
    <ThemeContext.Provider value={{
      theme: themeDetails,
      themeMode,
      sidebarTheme,
      colors,
      buttonColor,
      changeTheme,
      changeSidebarTheme,
      changeAccent,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
