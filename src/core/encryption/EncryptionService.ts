// EncryptionService - Provides encryption/decryption using Web Crypto API
// Uses AES-GCM for symmetric encryption with a derived key from password

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 100_000;

let cachedKey: CryptoKey | null = null;

/** Derive a CryptoKey from a password string */
async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = encoder.encode('family-dashboard-salt-v1');

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export const EncryptionService = {
  /** Initialize encryption with a master password */
  async init(password: string): Promise<void> {
    cachedKey = await deriveKey(password);
  },

  /** Encrypt a plaintext string, returns base64-encoded ciphertext */
  async encrypt(data: string): Promise<string> {
    if (!cachedKey) throw new Error('Encryption not initialized. Call init() first.');

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGO, iv },
      cachedKey,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  },

  /** Decrypt a base64-encoded ciphertext string */
  async decrypt(data: string): Promise<string> {
    if (!cachedKey) throw new Error('Encryption not initialized. Call init() first.');

    const combined = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv },
      cachedKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  },

  /** Check if encryption has been initialized */
  isReady(): boolean {
    return cachedKey !== null;
  },

  /** Clear the cached key (on lock) */
  clear(): void {
    cachedKey = null;
  },
};
