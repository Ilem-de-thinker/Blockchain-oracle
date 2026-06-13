
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TelegramReminderPopupProps {
  user: { id: string; email: string; full_name?: string; username?: string; name?: string; role?: string } | null;
}

const TelegramReminderPopup: React.FC<TelegramReminderPopupProps> = ({ user }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.name || user?.username || 'Blockchain Pioneer';
  const welcomeMessage = `Welcome back, ${displayName}!`;

  useEffect(() => {
    if (!user) {
      setIsVisible(false);
      return;
    }

    const hasJoined = localStorage.getItem(`telegram_joined_${user.id}`);
    if (hasJoined === 'true') {
      setIsVisible(false);
      return;
    }

    const lastShownKey = `telegram_popup_last_shown_${user.id}`;
    const lastShown = localStorage.getItem(lastShownKey);
    const now = Date.now();

    if (!lastShown) {
      setIsVisible(true);
      localStorage.setItem(lastShownKey, now.toString());
      return;
    }

    const lastShownTime = parseInt(lastShown, 10);
    const hoursSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60);

    if (hoursSinceLastShown >= 24) {
      setIsVisible(true);
      localStorage.setItem(lastShownKey, now.toString());
    }
  }, [user]);

  const handleJoinNow = () => {
    navigate('/telegram');
    setIsVisible(false);
  };

  const handleRemindLater = () => {
    const twentyMinutesFromNow = Date.now() + (20 * 60 * 1000);
    localStorage.setItem(`telegram_popup_last_shown_${user?.id}`, twentyMinutesFromNow.toString());
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <i className="fab fa-telegram text-3xl text-white"></i>
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Telegram Community</h4>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{welcomeMessage}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Don't miss out on community updates, exclusive content, and real-time announcements!
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleJoinNow}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <i className="fab fa-telegram-plane"></i>
            Join Our Telegram
          </button>
          
          <button 
            onClick={handleRemindLater}
            className="w-full py-3 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            Remind Me Later
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Daily Update Protocol Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramReminderPopup;
