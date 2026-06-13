
import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const PwaUpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
      // Check for updates every 60 seconds
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  useEffect(() => {
    if (needRefresh) {
      console.log('[PWA] New content available, showing update prompt');
    }
    if (offlineReady) {
      console.log('[PWA] Content cached for offline use');
    }
  }, [needRefresh, offlineReady]);

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1e293b] border border-slate-700 shadow-2xl rounded-2xl p-5 max-w-sm flex flex-col gap-4 backdrop-blur-sm bg-opacity-95">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              {needRefresh ? 'Update Available' : 'Ready for Offline'}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {needRefresh 
                ? 'A new version of the platform is available. Refresh now to get the latest features and fixes.'
                : 'The application is now cached and ready to work offline.'}
            </p>
          </div>
          <button 
            onClick={close}
            className="text-slate-500 hover:text-white transition-colors p-1"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {needRefresh && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); updateServiceWorker(true); }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium inline-flex items-center justify-center gap-2 py-6 px-6 rounded-xl shadow-lg shadow-indigo-500/20 border-none cursor-pointer text-sm transition-all select-none"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Now
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); close(); }}
            className="flex-1 border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white py-6 px-6 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer text-sm transition-all select-none"
          >
            {needRefresh ? 'Later' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaUpdatePrompt;
