import React from 'react';

const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
   
  return (
    <footer className="border-t border-border/50 bg-surface/50">
      <div className="flex flex-col gap-3 px-3 sm:px-4">
        {/* Branding section */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
            Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle
          </span>
          <span className="text-[8px] sm:text-[9px] text-text-muted">
            Africa's Premier Blockchain & Cryptocurrency Social Enterprise
          </span>
        </div>
        
        {/* Quick Links section */}
        <div className="flex flex-col items-center gap-0.5 text-center mt-1">
          <span className="text-[8px] sm:text-[9px] font-semibold text-text-muted uppercase tracking-widest">
            Quick Links
          </span>
          <div className="flex flex-col gap-0.25 text-[7px] sm:text-[8px] text-text-muted">
            <span>Alphaking</span>
            <span>Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle</span>
            <span>@AlphaKing Enterprise</span>
          </div>
        </div>
        
        {/* Privacy Policy link */}
        <div className="mt-1">
          <a href="/privacy" className="text-[7px] sm:text-[8px] text-text-muted hover:text-primary transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
