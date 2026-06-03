import React from 'react';
import { FileWarning, Maximize2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { ReaderProps } from '../types';

export const UnsupportedReader: React.FC<ReaderProps> = ({ url }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-surface-alt/10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 blur-[80px] rounded-full" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-[2rem] bg-surface flex items-center justify-center mb-6 border border-border shadow-xl">
          <FileWarning className="h-9 w-9 text-text-muted/40" />
        </div>
        <Badge variant="outline" className="mb-4 border-primary/20 text-primary/60 font-black uppercase tracking-[0.3em] text-[8px] px-2 py-0.5">
          Unknown Protocol
        </Badge>
        <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">Unsupported Format</h3>
        <p className="text-[11px] text-text-muted max-w-[240px] font-bold uppercase tracking-widest opacity-60 leading-relaxed mb-10">
          This segment utilizes a non-standard data structure that cannot be previewed natively.
        </p>
        {url && (
          <Button
            size="sm"
            className="rounded-full font-black uppercase text-[10px] tracking-widest h-11 bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            onClick={() => window.open(url, '_blank')}
          >
            <Maximize2 className="h-3 w-3 mr-2" /> Open Raw
          </Button>
        )}
      </div>
    </div>
  );
};
