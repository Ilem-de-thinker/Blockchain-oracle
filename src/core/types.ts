import { ComponentType, ReactNode } from 'react';

export interface ReaderProps {
  url?: string;
  content?: string;
  title?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface ReaderPlugin {
  id: string;
  priority: number;
  canHandle(url?: string, fileType?: string, mimeType?: string): boolean;
  component: ComponentType<ReaderProps>;
}

export interface DocumentViewerProps {
  url?: string;
  content?: string;
  title?: string;
  fileType?: string;
  mimeType?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  toolbar?: ReactNode;
}
