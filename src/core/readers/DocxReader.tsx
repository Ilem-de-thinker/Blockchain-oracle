import React, { useState, useEffect, useRef } from 'react';
import * as docx from 'docx-preview';
import { Cpu, ShieldAlert, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';
import type { ReaderProps } from '../types';

export const DocxReader: React.FC<ReaderProps> = ({ url, title, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url) {
      setError('No document URL provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch document');
        return res.arrayBuffer();
      })
      .then(async (buffer) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          await docx.renderAsync(buffer, containerRef.current, undefined, {
            className: "docx-viewer",
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            debug: false,
            experimental: true,
            trimXmlDeclaration: true,
            useBase64URL: true,
            useMathMLPolyfill: true,
            showChanges: false,
          });
        }
      })
      .catch((err) => {
        console.error('Docx error:', err);
        setError('Failed to load Word document.');
      })
      .finally(() => setLoading(false));
  }, [url]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-surface-alt/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-destructive/5 blur-[80px] rounded-full" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-[2rem] bg-surface flex items-center justify-center mb-6 border border-border shadow-xl">
            <ShieldAlert className="h-9 w-9 text-destructive/40" />
          </div>
          <Badge variant="outline" className="mb-4 border-destructive/20 text-destructive/60 font-black uppercase tracking-[0.3em] text-[8px] px-2 py-0.5">
            Access Restriction
          </Badge>
          <h3 className="text-xl font-black text-text mb-2 uppercase tracking-tight">Stream Error</h3>
          <p className="text-[11px] text-text-muted max-w-[240px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full h-full relative", className)}>
      <ScrollArea className="flex-1 w-full bg-slate-50 dark:bg-zinc-950">
        <style dangerouslySetInnerHTML={{ __html: `
          .docx-viewer {
            padding: 2rem !important;
            background: white !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
            margin: 2rem auto !important;
            width: fit-content !important;
            min-width: 800px;
            border-radius: 8px !important;
            border: 1px solid #e2e8f0 !important;
          }
          @media (max-width: 840px) {
            .docx-viewer {
              min-width: 100% !important;
              padding: 1rem !important;
              margin: 1rem 0 !important;
            }
          }
          .docx-viewer section {
            margin-bottom: 2rem !important;
          }
        ` }} />
        
        <div className="p-4 md:p-8 lg:p-12 max-w-full mx-auto min-h-full">
          {loading && (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted animate-pulse">Decrypting Document</p>
             </div>
          )}
          
          <div className="flex items-center gap-2 mb-6 opacity-40">
            <FileText size={14} className="text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Native Word Rendering</span>
          </div>

          <div 
            ref={containerRef} 
            className={cn(
              "docx-content-container transition-all duration-1000",
              loading ? "opacity-0" : "opacity-100 animate-in fade-in slide-in-from-bottom-8"
            )} 
          />
        </div>
      </ScrollArea>
    </div>
  );
};

