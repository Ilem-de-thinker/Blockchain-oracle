import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Menu, Maximize2, Flame } from 'lucide-react';

interface CoursePlayerShellProps {
  children: React.ReactNode;
  courseTitle: string;
  progress: number;
  streakCount?: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onExit: () => void;
}

export default function CoursePlayerShell({
  children,
  courseTitle,
  progress,
  streakCount = 5,
  sidebarOpen,
  setSidebarOpen,
  onExit
}: CoursePlayerShellProps) {

  const toggleGlobalFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-surface text-sm md:text-base selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      <header className="h-14 md:h-16 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors p-2 -ml-2"
          >
            <ArrowLeft size={18} strokeWidth={3} />
            <span className="hidden sm:block">Exit</span>
          </button>

          <div className="h-5 w-[1px] bg-border hidden sm:block"></div>

          <h1 className="text-sm md:text-base font-black tracking-tight text-text truncate max-w-[120px] sm:max-w-[200px] md:max-w-md">
            {courseTitle}
          </h1>
        </div>

        <div className="flex-1 max-w-[120px] xs:max-w-[180px] md:max-w-sm px-2 md:px-12 flex items-center">
          <div className="relative h-2.5 md:h-3 w-full bg-surface-alt rounded-full overflow-hidden border border-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ type: "spring", damping: 20, stiffness: 100 }}
               className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full shadow-[inset_0_2px_0_rgba(255,255,255,0.3)]"
            >
              <div className="absolute top-0.5 md:top-1 left-[5%] h-0.5 md:h-1 w-[54%] bg-white/20 rounded-full" />
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4 flex-1 justify-end">
           <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-surface-alt rounded-full border border-border shrink-0">
             <Flame size={16} className="text-orange-500 fill-orange-500" />
             <span className="text-xs font-black text-text-secondary">{streakCount}</span>
           </div>

           <div className="h-8 w-[1px] bg-border mx-1 hidden md:block"></div>

           <button
             onClick={toggleGlobalFullscreen}
             className="hidden md:flex w-9 h-9 items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-hover rounded-xl transition-colors shrink-0"
             title="Fullscreen"
           >
             <Maximize2 size={18} />
           </button>

           <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              w-9 h-9 md:w-10 md:h-10 rounded-xl transition-all flex items-center justify-center shrink-0
              ${sidebarOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-surface-hover text-text-secondary hover:bg-surface-active'}
            `}
           >
             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>
      </header>

      <main className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 h-full">
          {children}
        </div>
      </main>

    </div>
  );
}
