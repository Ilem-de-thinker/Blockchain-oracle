import React from 'react';
import DOMPurify from 'dompurify';
import { Cpu } from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';
import type { ReaderProps } from '../types';

export const RichTextReader: React.FC<ReaderProps> = ({ content, title, className }) => {
  if (!content) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-white/20 bg-slate-900/50">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Content Available</p>
      </div>
    );
  }

  const sanitized = DOMPurify.sanitize(content, {
    ADD_ATTR: ['target', 'rel'],
    ADD_TAGS: ['style'],
  });

  return (
    <div className={cn("flex flex-col w-full h-full bg-white dark:bg-zinc-950", className)}>
      <ScrollArea className="flex-1 w-full">
        <div className="p-4 md:p-8 lg:p-20 max-w-full mx-auto min-h-full">
          <div className="flex items-center gap-2 mb-6 opacity-40">
            <Cpu size={14} className="text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Optimized Document Stream</span>
          </div>
          <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 max-w-none">
            <div
              className="prose prose-zinc lg:prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed prose-img:rounded-xl prose-a:text-primary transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
