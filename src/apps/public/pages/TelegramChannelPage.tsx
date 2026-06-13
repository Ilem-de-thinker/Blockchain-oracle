
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';

const TelegramChannelPage: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();

  const handleJoinChannel = () => {
    if (user) {
      localStorage.setItem(`telegram_joined_${user.id}`, 'true');
    }
    window.open('https://t.me/blockchainoracle', '_blank');
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-white">
      <div className="w-full max-w-md bg-white p-12 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-purple-50 rounded-2xl mx-auto flex items-center justify-center mb-8 border border-purple-100 rotate-12 group hover:rotate-0 transition-transform duration-500">
            <i className="fab fa-telegram text-3xl text-purple-600"></i>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-gray-900">Join Our Network</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Connect with the community</p>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Join our official Telegram channel to receive real-time updates on:
            </p>
            <ul className="text-gray-500 text-sm space-y-2 text-left px-6">
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-purple-500 text-xs"></i>
                New course releases and learning materials
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-purple-500 text-xs"></i>
                Blockchain network governance updates
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-purple-500 text-xs"></i>
                Community events and webinars
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-purple-500 text-xs"></i>
                Technical support and Q&A sessions
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleJoinChannel}
              className="w-full py-4 bg-purple-700 hover:bg-purple-800 transition-all rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-3 shadow-lg"
            >
              <i className="fab fa-telegram text-xl"></i>
              Join Telegram Channel
            </button>
            
            <button 
              onClick={handleSkip}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all rounded-xl font-semibold text-sm text-gray-600"
            >
              Skip for Now
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500 font-medium">
          <p>Joining is optional but highly recommended for the best experience.</p>
        </div>
      </div>
    </div>
  );
};

export default TelegramChannelPage;
