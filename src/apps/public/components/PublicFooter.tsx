import React from 'react';
import { Link } from 'react-router-dom';
import LogoText from '@/components/LogoText';

const PublicFooter: React.FC = () => (
  <footer className="bg-gray-900 border-t border-gray-800 py-16">
    <style>{`
      @media (min-width: 768px) and (max-width: 923px) {
        .footer-logo-text > span:last-child {
          font-size: 0.875rem !important;
        }
      }
    `}</style>
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <LogoText variant="footer" size="md" showIcon={true} className="footer-logo-text" />
          </Link>
          <p className="text-sm text-white/60 leading-relaxed">
            Africa's Premiere Blockchain and Cryptocurrency Adoption Hub.
          </p>
          <div className="flex gap-3">
            {[
              { icon: 'fab fa-twitter' },
              { icon: 'fab fa-linkedin-in' },
              { icon: 'fab fa-discord' },
              { icon: 'fab fa-github' },
            ].map((social, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-white/50 hover:text-white hover:bg-gray-700 transition-all">
                <i className={`${social.icon} text-sm`}></i>
              </a>
            ))}
          </div>
        </div>

        {[
          { title: 'Platform', links: [{ name: 'Courses', to: '/courses' }, { name: 'Events', to: '/events' }, { name: 'Community', to: '/community' }, { name: 'Certifications', to: '/dashboard/certificates' }] },
          { title: 'Company', links: [{ name: 'About', to: '/about' }, { name: 'Enterprise', to: '/enterprise', badge: 'Coming Soon' }] },
          { title: 'Support', links: [{ name: 'Contact', to: '/contact' }, { name: 'Verify Certificate', to: '/verify-certificate' }, { name: 'Privacy Policy', to: '/privacy' }, { name: 'Terms of Service', to: '/terms' }] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-sm text-white hover:text-white/80 transition-colors inline-flex items-center gap-2">
                    {link.name}
                    {link.badge && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">{link.badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-white/50 font-bold uppercase tracking-widest">
          &copy; 2026 Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-xs text-white/50">
          <span>Nodes: 5,204</span>
          <span>Uptime: 99.99%</span>
        </div>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
