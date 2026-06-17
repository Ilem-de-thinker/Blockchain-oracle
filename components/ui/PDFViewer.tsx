'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFViewer({ url, onPageChange }: { url: string; onPageChange?: (page: number, totalPages: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const renderTaskRef = useRef<any>(null);
  const renderTokenRef = useRef(0);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        onPageChange?.(1, pdfDoc.numPages);
      } catch (err) {
        console.error('Failed to load PDF:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [url]);

  // Render Page
  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current || !containerRef.current) return;

    const token = ++renderTokenRef.current;
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
      renderTaskRef.current = null;
    }

    const page = await pdf.getPage(pageNum);
    if (token !== renderTokenRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const baseDpr = window.devicePixelRatio || 1;
    const isMobileViewport = window.innerWidth < 768;
    const viewportScale = window.visualViewport?.scale || 1;
    const boostedDpr = isMobileViewport ? baseDpr * 1.35 : baseDpr;
    const dpr = Math.min(boostedDpr * Math.max(1, viewportScale), 5);
    const containerWidth = Math.max(1, container.clientWidth - 8);
    
    // Calculate scale to fit width
    const viewportAtScale1 = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewportAtScale1.width;
    const viewport = page.getViewport({ scale });

    // Set canvas size (physical pixels)
    const pixelWidth = Math.floor(viewport.width * dpr);
    const pixelHeight = Math.floor(viewport.height * dpr);
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;

    // Set canvas display size (CSS pixels)
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, pixelWidth, pixelHeight);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, pixelWidth, pixelHeight);

    // Render
    const renderTask = page.render({
      canvasContext: context,
      viewport,
      transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0],
    });
    renderTaskRef.current = renderTask;
    try {
      await renderTask.promise;
    } catch (error: any) {
      if (error?.name !== 'RenderingCancelledException') {
        throw error;
      }
    } finally {
      if (renderTaskRef.current === renderTask) {
        renderTaskRef.current = null;
      }
    }
  }, [pdf, pageNum]);

  // Re-render on container size change or page change
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  useEffect(() => {
    if (numPages > 0) {
      onPageChange?.(pageNum, numPages);
    }
  }, [pageNum, numPages]);

  useEffect(() => {
    const observer = new ResizeObserver(renderPage);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [renderPage]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const rerender = () => {
      renderPage();
    };
    vv.addEventListener('resize', rerender);
    return () => vv.removeEventListener('resize', rerender);
  }, [renderPage]);

  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNum(p => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNum(p => Math.min(numPages, p + 1));
  }, [numPages]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return;
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null || event.changedTouches.length !== 1) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    const deltaY = event.changedTouches[0].clientY - touchStartY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    touchStartX.current = null;
    touchStartY.current = null;

    if (absX < 60 || absX < absY) return;
    if (deltaX < 0) {
      goToNextPage();
      return;
    }
    goToPrevPage();
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-secondary rounded-xl overflow-hidden shadow-sm border border-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 md:p-3 bg-surface border-b border-border">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNum <= 1}
            className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-secondary disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextPage}
            disabled={pageNum >= numPages}
            className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-secondary disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <span className="text-sm font-bold text-text">Page {pageNum} / {numPages || 0}</span>
        <div className="flex items-center gap-2">
          {isFullscreen && (
            <button
              onClick={() => document.exitFullscreen()}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-surface-hover text-text"
            >
              Exit
            </button>
          )}
          <button onClick={toggleFullscreen} className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-surface-hover text-text-secondary" aria-label="Toggle fullscreen">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center bg-bg-secondary p-2 md:p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <canvas ref={canvasRef} className="my-2 md:my-4 max-w-full rounded-md shadow-sm" />
          </div>
        )}
      </div>

      {!loading && (
        <div className="sticky bottom-0 z-10 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 p-2">
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            <button
              onClick={goToPrevPage}
              disabled={pageNum <= 1}
              className="h-11 rounded-lg border border-border bg-bg text-text font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={goToNextPage}
              disabled={pageNum >= numPages}
              className="h-11 rounded-lg bg-primary text-white font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
