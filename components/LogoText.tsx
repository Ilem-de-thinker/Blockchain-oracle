import React from 'react';

interface LogoTextProps {
  variant?: 'navbar' | 'footer' | 'auth' | 'mobile-menu';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  className?: string;
}

/**
 * LogoText Component
 * 
 * Implements the special Blo|<Chain◯racle typography with:
 * - Main text: Space Grotesk SemiBold (600)
 * - "O" in Oracle: Montserrat Thin (200), slightly larger
 * - |< represents K (tech/terminal identity)
 * - Special circular O as visual anchor
 * 
 * Usage:
 *   <LogoText variant="navbar" />
 *   <LogoText variant="footer" size="lg" />
 *   <LogoText variant="auth" showIcon={false} />
 */
const LogoText: React.FC<LogoTextProps> = ({ 
  variant = 'navbar', 
  size = 'md', 
  showIcon = true,
  className = ''
}) => {
  // Size configuration
  const sizes = {
    sm: { main: 'text-lg', icon: 'text-base', o: 'text-xl' },
    md: { main: 'text-xl', icon: 'text-lg', o: 'text-2xl' },
    lg: { main: 'text-2xl', icon: 'text-xl', o: 'text-3xl' },
    xl: { main: 'text-3xl', icon: 'text-2xl', o: 'text-4xl' },
  };

  const { main, icon, o } = sizes[size];

  // Variant-specific styles
  const variantStyles = {
    navbar: 'font-bold tracking-tight',
    footer: 'font-bold tracking-tighter text-white',
    auth: 'font-semibold tracking-wide',
    'mobile-menu': 'font-bold tracking-tight',
  };

  return (
    <span 
      className={`inline-flex items-center gap-2 ${variantStyles[variant]} ${className}`}
      style={{ fontFamily: "'Space Grotesk', sans-serif !important" }}
    >
      {/* Icon (optional) */}
      {showIcon && (
        <span className={`${icon} transition-transform duration-300 group-hover:rotate-12 inline-flex flex-shrink-0`}>
          <img 
            src="/Logo/logo.png" 
            alt="BlockchainOracle Logo"
            className="w-6 h-6 object-contain flex-shrink-0"
            style={{ maxWidth: 'none', display: 'block' }}
          />
        </span>
      )}

      {/* Logo Text with Special Typography */}
      <span className={`flex items-baseline ${main}`}>
        Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1em', fontFamily: "'Montserrat', sans-serif" }}>0</span>racle
      </span>
    </span>
  );
};

export default LogoText;
