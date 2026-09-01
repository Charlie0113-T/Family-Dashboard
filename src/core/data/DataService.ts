// DataService - Local-first data persistence layer
// Uses localStorage with per-module namespacing for isolation.
// Modules registered with `encrypted: true` store through getSecure/setSecure,
// which run the payload through EncryptionService (AES-GCM, key derived from
// the master password) instead of writing readable JSON.

import { EncryptionService } from '../encryption/EncryptionService';

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

  /** Retrieve and decrypt data for an encrypted module. Records written as
   *  plaintext by older versions are still readable — they get re-encrypted
   *  by the next setSecure. */
  async getSecure<T>(moduleId: string): Promise<T | null> {
    const raw = localStorage.getItem(getKey(moduleId));
    if (!raw) return null;
    try {
      return JSON.parse(await EncryptionService.decrypt(raw)) as T;
    } catch {
      try {
        return JSON.parse(raw) as T;
      } catch {
        console.warn(`[DataService] Failed to read secure data for module: ${moduleId}`);
        return null;
      }
    }
  },

  /** Encrypt and persist data for an encrypted module */
  async setSecure<T>(moduleId: string, data: T): Promise<void> {
    try {
      const ciphertext = await EncryptionService.encrypt(JSON.stringify(data));
      localStorage.setItem(getKey(moduleId), ciphertext);
    } catch (e) {
      console.error(`[DataService] Failed to save secure data for module: ${moduleId}`, e);
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
