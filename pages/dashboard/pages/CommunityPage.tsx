import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const DashboardCommunityPage: React.FC = () => {
  const { buttonColor } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-text antialiased">

      <header
        className="py-6 lg:py-16 px-6 text-center border-b border-border"
        style={{
          background: `linear-gradient(to bottom right, color-mix(in srgb, ${buttonColor}, transparent 96%) 0%, color-mix(in srgb, ${buttonColor}, transparent 86%) 100%), var(--sidebar-bg)`,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="hidden lg:flex w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mx-auto mb-4 lg:mb-6 items-center justify-center text-white text-3xl shadow-lg"
            style={{ backgroundColor: buttonColor }}
          >
            <i className="fa-solid fa-users"></i>
          </div>
          <h1 className="text-2xl lg:text-5xl font-extrabold tracking-tight mb-4 text-text">
            Join the Community
          </h1>
          <p className="text-sm sm:text-lg text-text-muted leading-relaxed">
            Connect with 5,000+ members. Get real-time updates, exclusive insights, and 24/7 support across our official channels.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-4 lg:py-12 px-6">
        <div className="grid gap-6 md:grid-cols-2">

          <div className="group relative bg-surface p-4 lg:p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">Fastest Updates</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-text">WhatsApp Announcements</h3>
            <p className="text-text-muted text-sm mb-4 lg:mb-6">Receive daily signals, market alerts, and direct news straight to your phone.</p>
            <a href="https://wa.me/yourlink" className="inline-flex items-center justify-center w-full py-3 lg:py-4 px-6 rounded-xl font-semibold text-white hover:opacity-90 transition-colors gap-2"
              style={{ backgroundColor: buttonColor }}>
              Join WhatsApp Group <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
          </div>

          <div className="group relative bg-surface p-4 lg:p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 text-2xl">
                <i className="fa-brands fa-telegram"></i>
              </div>
              <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider rounded-full">Community Chat</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-text">Telegram Community</h3>
            <p className="text-text-muted text-sm mb-4 lg:mb-6">Deep-dive discussions, file sharing, and 24/7 chat with fellow community members.</p>
            <a href="https://t.me/yourlink" className="inline-flex items-center justify-center w-full py-3 lg:py-4 px-6 rounded-xl font-semibold hover:opacity-90 transition-colors gap-2"
              style={{ backgroundColor: '#0ea5e9', color: 'white' }}>
              Join Telegram Channel <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
          </div>

        </div>

        <section className="mt-8 lg:mt-16 text-center border-t border-border pt-6 lg:pt-12">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-text">5k+</p>
              <p className="text-text-muted text-sm">Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-text">24/7</p>
              <p className="text-text-muted text-sm">Active Mod</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-text">Free</p>
              <p className="text-text-muted text-sm">Access</p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default DashboardCommunityPage;
