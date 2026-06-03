import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundary({ children, fallback, onError }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const err = event.error as Error;
      console.error('[ErrorBoundary]', err);
      onError?.(err, {} as ErrorInfo);
      setHasError(true);
      setError(err);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-text-muted mb-6 text-sm">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold bg-primary hover:bg-primary-hover transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return children;
}
