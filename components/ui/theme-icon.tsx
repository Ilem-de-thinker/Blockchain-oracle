import React from 'react';
import { cn } from "../../lib/utils";

interface ThemeIconProps {
  icon: React.ElementType;
  className?: string;
  containerClassName?: string;
}

export const ThemeIcon = ({ icon: Icon, className, containerClassName }: ThemeIconProps) => (
  <div className={cn("flex items-center justify-center rounded-xl", containerClassName)}>
    <Icon className={cn("h-6 w-6 text-primary", className)} />
  </div>
);
