import React, { useMemo, useEffect } from 'react';
import { readerRegistry } from './ReaderRegistry';
import { registerBuiltinReaders } from './registerReaders';
import type { DocumentViewerProps } from './types';

let readersRegistered = false;

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  url,
  content,
  title,
  fileType,
  mimeType,
  className,
  onLoad,
  onError,
  toolbar: ToolbarOverride,
}) => {
  useEffect(() => {
    if (!readersRegistered) {
      registerBuiltinReaders();
      readersRegistered = true;
    }
  }, []);

  const reader = useMemo(
    () => readerRegistry.getReader(url, fileType, mimeType),
    [url, fileType, mimeType]
  );

  const ReaderComponent = reader?.component;

  if (!ReaderComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-alt/10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">
          No suitable reader found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {ToolbarOverride}
      <div className="flex-1 min-h-0">
        <ReaderComponent
          url={url}
          content={content}
          title={title}
          className={className}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
    </div>
  );
};
