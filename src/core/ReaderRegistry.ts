import { ReaderPlugin } from './types';

class ReaderRegistry {
  private plugins: Map<string, ReaderPlugin> = new Map();

  register(plugin: ReaderPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Reader plugin "${plugin.id}" is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  getReader(url?: string, fileType?: string, mimeType?: string): ReaderPlugin | undefined {
    const sorted = Array.from(this.plugins.values()).sort((a, b) => b.priority - a.priority);
    return sorted.find((plugin) => plugin.canHandle(url, fileType, mimeType));
  }

  getAll(): ReaderPlugin[] {
    return Array.from(this.plugins.values());
  }

  clear(): void {
    this.plugins.clear();
  }
}

export const readerRegistry = new ReaderRegistry();
