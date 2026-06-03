import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'welcome_banner_dismissed';

interface WelcomeBannerProps {
  name: string;
  message?: string;
  actionText?: string;
  actionLink?: string;
  autoDismissTime?: number;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  name,
  message = "We've updated your personalized learning path with 3 new targeted course modules based on your recent activity. Happy learning!",
  actionText = "View My Path",
  actionLink = "#",
  autoDismissTime = 7000
}) => {
  const [isVisible, setIsVisible] = useState(() => !sessionStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (!isVisible) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, autoDismissTime);
    return () => clearTimeout(timer);
  }, [isVisible, autoDismissTime]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 32 }}
          exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="w-full max-w-4xl mx-auto overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-5 md:p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex items-start space-x-4">
              <div className="text-3xl animate-bounce duration-1000 hidden sm:block select-none">👋</div>
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">Welcome back to your dashboard, {name}!</h2>
                <p className="text-xs md:text-sm text-indigo-100/90 mt-1 max-w-xl font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between sm:justify-end space-x-4 flex-shrink-0 border-t border-white/10 pt-3 sm:pt-0 sm:border-none">
              <a href={actionLink} className="text-xs font-bold bg-white text-indigo-100/90 hover:bg-indigo-50 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95">
                {actionText}
              </a>
              
              <button 
                onClick={() => setIsVisible(false)}
                className="text-white/75 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer" 
                title="Dismiss notification"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBanner;
