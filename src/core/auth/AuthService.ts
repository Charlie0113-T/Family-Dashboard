// AuthService - In-memory authentication with master password
// No server-side auth - all local, privacy-first

import { EncryptionService } from '../encryption/EncryptionService';
import { DataService } from '../data/DataService';

const AUTH_MODULE_ID = '__auth';
const TRUST_MODULE_ID = '__trust';

/** How long a "remember this device" unlock stays valid */
export const TRUST_DURATION_DAYS = 7;

interface AuthState {
  passwordHash: string;
}

interface TrustState {
  key: JsonWebKey;
  expiresAt: number;
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

  /** Remember this device so it can unlock without the password for a while */
  async trustDevice(days: number = TRUST_DURATION_DAYS): Promise<void> {
    const key = await EncryptionService.exportKey();
    if (!key) return;
    DataService.set<TrustState>(TRUST_MODULE_ID, {
      key,
      expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
    });
  },

  /** Unlock without a password if this device holds a valid trust record */
  async tryRestoreSession(): Promise<boolean> {
    const trust = DataService.get<TrustState>(TRUST_MODULE_ID);
    if (!trust) return false;

    if (!trust.key || Date.now() > trust.expiresAt) {
      DataService.remove(TRUST_MODULE_ID);
      return false;
    }

    const restored = await EncryptionService.initFromJwk(trust.key);
    if (!restored) {
      DataService.remove(TRUST_MODULE_ID);
      return false;
    }

    unlocked = true;
    return true;
  },

  /** Lock the dashboard and revoke this device's password-free unlock */
  lock(): void {
    unlocked = false;
    EncryptionService.clear();
    DataService.remove(TRUST_MODULE_ID);
  },

  /** Check if currently unlocked */
  isUnlocked(): boolean {
    return unlocked;
  },
};
