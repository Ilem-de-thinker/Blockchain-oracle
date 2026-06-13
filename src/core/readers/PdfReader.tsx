import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2, ZoomIn, ZoomOut, ShieldAlert, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';
import type { ReaderProps } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const PdfReader: React.FC<ReaderProps> = ({ url, title, className, onLoad, onError }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const pdf = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1 });
        const maxW = window.innerWidth - 64;
        if (vp.width > maxW) {
          setScale(maxW / vp.width);
        }
        setLoading(false);
        onLoad?.();
      } catch (err) {
        if (cancelled) return;
        console.error('PDF error:', err);
        setLoadError('Failed to load PDF. The file might be corrupted or inaccessible.');
        setLoading(false);
        onError?.(err instanceof Error ? err : new Error('Failed to load PDF'));
      }
    };
    load();
    return () => { cancelled = true; };
  }, [url, onLoad, onError]);

  useEffect(() => {
    const pdf = pdfDocRef.current;
    if (!pdf) return;
    let cancelled = false;

    const render = async () => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      if (cancelled) return;

      const textLayer = textLayerRef.current;
      if (!textLayer || cancelled) return;
      textLayer.innerHTML = '';
      textLayer.style.width = `${viewport.width}px`;
      textLayer.style.height = `${viewport.height}px`;

      const textContent = await page.getTextContent();
      if (cancelled) return;

      for (const item of textContent.items) {
        if (!('str' in item) || !item.str) continue;
        const [a, b, , , e, f] = item.transform;
        const span = document.createElement('span');
        span.textContent = item.str;
        span.style.position = 'absolute';
        span.style.left = `${e * scale}px`;
        span.style.top = `${viewport.height - f * scale}px`;
        span.style.fontSize = `${Math.sqrt(a * a + b * b) * scale}px`;
        span.style.fontFamily = 'sans-serif';
        span.style.lineHeight = '1';
        span.style.whiteSpace = 'pre';
        span.style.color = 'transparent';
        span.style.pointerEvents = 'auto';
        textLayer.appendChild(span);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [pdfDocRef.current, pageNum, scale]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (loadError) {
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
          <p className="text-[11px] text-text-muted max-w-[240px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">{loadError}</p>
        </div>
      </div>
    );
  }

  const pageLabel = numPages ? `${pageNum}/${numPages}` : '--/--';

  return (
    <div className={cn("flex flex-col w-full h-full bg-surface-alt/10", className)} ref={containerRef} onContextMenu={(e) => e.preventDefault()}>
      {/* Desktop toolbar */}
      <div className="hidden sm:flex items-center justify-between sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-3 py-2 shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-lg hover:bg-surface"
            onClick={() => setPageNum(p => Math.max(p - 1, 1))}
            disabled={pageNum <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-[11px] font-black uppercase tracking-[0.1em] text-text-secondary select-none tabular-nums">
            {pageLabel}
          </span>
          <Button
            variant="ghost" size="icon"
            className="h-9 w-9 rounded-lg hover:bg-surface"
            onClick={() => setPageNum(p => Math.min(p + 1, numPages ?? p))}
            disabled={!!numPages && pageNum >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-surface-alt/50 rounded-xl p-1 border border-border/50 shadow-inner">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-surface" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} aria-label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[44px] text-center text-[10px] font-black uppercase text-text-secondary select-none tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-surface" onClick={() => setScale(s => Math.min(s + 0.2, 3.0))} aria-label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/50 shadow-sm hover:scale-105 active:scale-95 transition-all bg-surface" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-primary" /> : <Maximize2 className="h-4 w-4 text-primary" />}
          </Button>
        </div>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1 w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center p-32 gap-6">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
              <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted animate-pulse">Decrypting Protocol</p>
          </div>
        )}
        <div className="flex justify-center p-3 sm:p-8">
          <div className="relative max-w-full">
            <canvas
              ref={canvasRef}
              className="shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-border/30 rounded-lg overflow-hidden max-w-full h-auto"
              style={{ maxWidth: '100%' }}
            />
            <div
              ref={textLayerRef}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Mobile toolbar - bottom */}
      <div className="flex sm:hidden items-center justify-between sticky bottom-0 z-20 bg-surface/80 backdrop-blur-xl border-t border-border/50 px-2 py-1.5 shrink-0 safe-area-bottom">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost" size="icon"
            className="h-11 w-11 rounded-xl active:bg-surface-alt touch-manipulation"
            onClick={() => setPageNum(p => Math.max(p - 1, 1))}
            disabled={pageNum <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 bg-surface-alt/50 rounded-xl px-3 py-1.5 border border-border/30">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg active:bg-surface touch-manipulation" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[36px] text-center text-[10px] font-black uppercase text-text-secondary select-none tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg active:bg-surface touch-manipulation" onClick={() => setScale(s => Math.min(s + 0.2, 3.0))} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/40 active:bg-surface-alt touch-manipulation" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="h-5 w-5 text-primary" /> : <Maximize2 className="h-5 w-5 text-primary" />}
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-11 w-11 rounded-xl active:bg-surface-alt touch-manipulation"
            onClick={() => setPageNum(p => Math.min(p + 1, numPages ?? p))}
            disabled={!!numPages && pageNum >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
