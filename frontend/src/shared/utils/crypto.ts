// frontend/src/shared/utils/crypto.ts

const ENCRYPTION_KEY_STR = (import.meta as any).env.VITE_ENCRYPTION_KEY || 'default-super-secret-key-32chars!';

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const hash = await window.crypto.subtle.digest('SHA-256', keyData);
  return window.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getCryptoKey(ENCRYPTION_KEY_STR);
    const enc = new TextEncoder();
    const encoded = enc.encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    // Use btoa safely for binary data
    let binary = '';
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error;
  }
}

export async function decryptData(encryptedBase64: string): Promise<string> {
  try {
    const key = await getCryptoKey(ENCRYPTION_KEY_STR);
    const binaryString = atob(encryptedBase64);
    const len = binaryString.length;
    const combined = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}
