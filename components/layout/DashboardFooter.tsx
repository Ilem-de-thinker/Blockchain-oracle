import { FaWhatsapp, FaLinkedin, FaFacebook, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { useTheme } from '@/contexts/ThemeContext';

const socialLinks = [
   { icon: FaWhatsapp, href: "https://wa.me/2347033119301" },
   { icon: FaLinkedin, href: "https://linkedin.com" },
   { icon: FaFacebook, href: "https://facebook.com" },
   { icon: FaInstagram, href: "https://instagram.com" },
   { icon: FaTelegramPlane, href: "https://t.me" },
];

const DashboardFooter: React.FC = () => {
   const { buttonColor } = useTheme();
   return (
      <footer
        className="pt-8 pb-24 lg:pb-8 md:px-8"
        style={{
          background: `linear-gradient(to bottom right, color-mix(in srgb, ${buttonColor}, transparent 96%) 0%, color-mix(in srgb, ${buttonColor}, transparent 86%) 100%), var(--sidebar-bg)`,
        }}
      >
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-text-muted text-sm pt-3">
               <p> <span className="text-text-muted">© 2026 AlpharKing Enterprise's Project</span></p>
               <div className="block">
                  <div className="flex justify-center flex-wrap gap-3">
                     {socialLinks.map((link, i) => (
                        <a
                           key={i}
                           href={link.href}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-text-muted hover:text-text transition-colors"
                        >
                           <link.icon size={18} />
                        </a>
                     ))}
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <a href="/privacy" className="hover:text-text transition-colors">Privacy Policy</a>
               </div>
            </div>
         </div>
      </footer>
   );
};

export default DashboardFooter;
