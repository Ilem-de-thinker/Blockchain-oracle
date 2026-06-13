import React from 'react';

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">

      <header className="pt-32 pb-16 px-6 text-center bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-lg shadow-purple-200">
            <i className="fa-solid fa-users"></i>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Join the Community
          </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Connect with fellow learners, developers, and blockchain enthusiasts. Get real-time updates, exclusive insights, and support across our official channels.
            </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="grid gap-6 md:grid-cols-2">

          <div className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full">Fastest Updates</span>
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp Announcements</h3>
            <p className="text-slate-500 text-sm mb-6">Receive daily signals, market alerts, and direct news straight to your phone.</p>
            <a href="https://wa.me/yourlink" className="inline-flex items-center justify-center w-full py-4 px-6 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors gap-2">
              Join WhatsApp Group <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
          </div>

          <div className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 text-2xl">
                <i className="fa-brands fa-telegram"></i>
              </div>
              <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider rounded-full">Community Chat</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Telegram Community</h3>
            <p className="text-slate-500 text-sm mb-6">Deep-dive discussions, file sharing, and 24/7 chat with fellow community members.</p>
            <a href="https://t.me/yourlink" className="inline-flex items-center justify-center w-full py-4 px-6 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors gap-2">
              Join Telegram Channel <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
          </div>

        </div>

        <section className="mt-16 text-center border-t border-slate-200 pt-12">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-slate-900">Growing</p>
              <p className="text-slate-500 text-sm">Community</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">24/7</p>
              <p className="text-slate-500 text-sm">Active Mod</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">Free</p>
              <p className="text-slate-500 text-sm">Access</p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default CommunityPage;
