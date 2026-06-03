import React from 'react';
import { Type } from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';
import type { ReaderProps } from '../types';

export const TextReader: React.FC<ReaderProps> = ({ content, url, className }) => {
  const [text, setText] = React.useState(content || '');
  const [loading, setLoading] = React.useState(!content && !!url);

  React.useEffect(() => {
    if (content) {
      setText(content);
      setLoading(false);
      return;
    }
    if (!url) return;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch text');
        return res.text();
      })
      .then(setText)
      .catch(() => setText('Failed to load text content.'))
      .finally(() => setLoading(false));
  }, [url, content]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-alt/5">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted animate-pulse">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full h-full bg-surface", className)}>
      <ScrollArea className="flex-1 w-full">
        <div className="p-4 md:p-8 lg:p-20 max-w-full mx-auto min-h-full">
          <div className="flex items-center gap-2 mb-6 opacity-40">
            <Type size={14} className="text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Raw Data Transmission</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-[1.7] text-text-secondary bg-surface-alt/30 p-4 sm:p-6 rounded-[1.5rem] border border-border/50 shadow-inner transition-all duration-1000 animate-in fade-in break-words">
            {text}
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
};
