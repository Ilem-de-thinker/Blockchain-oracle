import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Button, ButtonProps } from './button';

interface ButtonLinkProps extends Omit<LinkProps, 'to'>, Omit<ButtonProps, 'asChild'> {
  to: string;
}

/**
 * A convenience component for links that should be styled as buttons.
 * Leverages the existing Button component with the asChild pattern.
 */
export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ to, variant, size, className, children, ...props }, ref) => {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link to={to} ref={ref} {...props}>
          {children}
        </Link>
      </Button>
    );
  }
);

ButtonLink.displayName = 'ButtonLink';
