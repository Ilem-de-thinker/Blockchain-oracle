import { readerRegistry } from './ReaderRegistry';
import { PdfReader, DocxReader, TextReader, RichTextReader, UnsupportedReader } from './readers';
import type { ReaderPlugin } from './types';

export function registerBuiltinReaders(): void {
  const readers: ReaderPlugin[] = [
    {
      id: 'pdf',
      priority: 100,
      canHandle(url, fileType, mimeType) {
        if (fileType === 'pdf' || mimeType === 'application/pdf') return true;
        if (url?.match(/\.pdf(\?|#|$)/i)) return true;
        return false;
      },
      component: PdfReader,
    },
    {
      id: 'docx',
      priority: 90,
      canHandle(url, fileType, mimeType) {
        if (fileType === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
        if (url?.match(/\.docx(\?|#|$)/i)) return true;
        return false;
      },
      component: DocxReader,
    },
    {
      id: 'rich-text',
      priority: 80,
      canHandle(url, fileType, mimeType) {
        if (fileType === 'html' || fileType === 'htm' || mimeType === 'text/html') return true;
        if (url?.match(/\.html?(\?|#|$)/i)) return true;
        return false;
      },
      component: RichTextReader,
    },
    {
      id: 'text',
      priority: 70,
      canHandle(url, fileType) {
        if (fileType === 'txt' || fileType === 'text') return true;
        if (url?.match(/\.txt(\?|#|$)/i)) return true;
        return false;
      },
      component: TextReader,
    },
    {
      id: 'unsupported',
      priority: 0,
      canHandle() {
        return true;
      },
      component: UnsupportedReader,
    },
  ];

  for (const reader of readers) {
    readerRegistry.register(reader);
  }
}
