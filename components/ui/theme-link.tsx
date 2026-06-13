import React from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ThemeLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  className?: string;
  children: React.ReactNode;
}

export const ThemeLink: React.FC<ThemeLinkProps> = ({
  to, className, children, ...props
}) => {
  return (
    <RouterLink 
      to={to} 
      className={cn("transition-all duration-200", className)} 
      {...props}
    >
      {children}
    </RouterLink>
  );
};
