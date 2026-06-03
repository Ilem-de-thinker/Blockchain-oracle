import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCcw } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkStatusBanner() {
  const { isOnline, wasOffline, clearReconnected } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        clearReconnected();
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline, clearReconnected]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-indigo-600 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <WifiOff size={16} />
          <span className="text-xs font-black uppercase tracking-widest">
            No internet connection
          </span>
          <span className="text-[10px] text-indigo-200 font-medium">
            Some features may be unavailable
          </span>
        </motion.div>
      )}
      {showReconnected && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-emerald-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
        >
          <Wifi size={16} />
          <span className="text-xs font-black uppercase tracking-widest">
            Back online
          </span>
          <RefreshCcw size={14} className="animate-spin" />
          <span className="text-[10px] text-emerald-100 font-medium">
            Refreshing...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
