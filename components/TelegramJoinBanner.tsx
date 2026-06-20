import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { authApi } from '@/src/api/auth';

const TelegramJoinBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Do not show if user is authenticated
    if (authApi.isAuthenticated()) {
      return;
    }

    // 2. Check if user already joined Telegram
    const hasJoined = localStorage.getItem('telegram_joined') === 'true';
    if (hasJoined) {
      return;
    }

    // 3. Check last dismissed time
    const dismissedAt = localStorage.getItem('telegram_banner_dismissed_at');
    const now = Date.now();

    if (dismissedAt) {
      const elapsed = now - parseInt(dismissedAt, 10);
      const thirtyMinutes = 30 * 60 * 1000;
      if (elapsed < thirtyMinutes) {
        return;
      }
    }

    // Show banner after 3 seconds on the page to not overwhelm immediately
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleJoin = () => {
    localStorage.setItem('telegram_joined', 'true');
    window.open('https://t.me/blockchainoracle', '_blank');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('telegram_banner_dismissed_at', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Container with rich aesthetics: dark glassmorphism with cyan/blue glow */}
      <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-2xl p-5 max-w-md md:w-[380px] overflow-hidden group">
        
        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-700" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

        <div className="relative flex items-start gap-4">
          {/* Telegram Glowing Icon Container */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <Send className="w-6 h-6 text-white transform -rotate-45 translate-x-px -translate-y-px" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                Web3 Revolution
              </span>
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 p-1.5 rounded-lg transition-all"
                aria-label="Close telegram banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-white font-bold text-base mt-1 group-hover:text-sky-300 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Join Our Telegram
            </h3>
            
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Connect with fellow developers, get real-time course updates, and access exclusive Web3 events!
            </p>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleJoin}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-500/15 hover:shadow-sky-500/25 text-xs transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 border-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Join Channel
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramJoinBanner;
