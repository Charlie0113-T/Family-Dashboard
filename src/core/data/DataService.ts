// DataService - Local-first data persistence layer
// Uses localStorage with per-module namespacing for isolation

const NAMESPACE_PREFIX = 'fd_';

function getKey(moduleId: string): string {
  return `${NAMESPACE_PREFIX}${moduleId}`;
}

export const DataService = {
  /** Retrieve data for a specific module */
  get<T>(moduleId: string): T | null {
    try {
      const raw = localStorage.getItem(getKey(moduleId));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[DataService] Failed to parse data for module: ${moduleId}`);
      return null;
    }
  },

  /** Persist data for a specific module */
  set<T>(moduleId: string, data: T): void {
    try {
      localStorage.setItem(getKey(moduleId), JSON.stringify(data));
    } catch (e) {
      console.error(`[DataService] Failed to save data for module: ${moduleId}`, e);
    }
  },

  /** Remove all data for a specific module */
  remove(moduleId: string): void {
    localStorage.removeItem(getKey(moduleId));
  },

  /** Check if data exists for a module */
  has(moduleId: string): boolean {
    return localStorage.getItem(getKey(moduleId)) !== null;
  },
};
