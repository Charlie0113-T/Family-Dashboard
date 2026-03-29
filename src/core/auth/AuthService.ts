// AuthService - In-memory authentication with master password
// No server-side auth - all local, privacy-first

import { EncryptionService } from '../encryption/EncryptionService';
import { DataService } from '../data/DataService';

const AUTH_MODULE_ID = '__auth';

interface AuthState {
  passwordHash: string;
}

let unlocked = false;

/** Simple hash for password verification (not for encryption) */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AuthService = {
  /** Check if a master password has been set */
  isSetup(): boolean {
    return DataService.has(AUTH_MODULE_ID);
  },

  /** Set the master password for first-time setup */
  async setMasterPassword(password: string): Promise<void> {
    const passwordHash = await hashPassword(password);
    DataService.set<AuthState>(AUTH_MODULE_ID, { passwordHash });
    await EncryptionService.init(password);
    unlocked = true;
  },

  /** Unlock the dashboard with the master password */
  async unlock(password: string): Promise<boolean> {
    const stored = DataService.get<AuthState>(AUTH_MODULE_ID);
    if (!stored) return false;

    const hash = await hashPassword(password);
    if (hash !== stored.passwordHash) return false;

    await EncryptionService.init(password);
    unlocked = true;
    return true;
  },

  /** Lock the dashboard */
  lock(): void {
    unlocked = false;
    EncryptionService.clear();
  },

  /** Check if currently unlocked */
  isUnlocked(): boolean {
    return unlocked;
  },
};
