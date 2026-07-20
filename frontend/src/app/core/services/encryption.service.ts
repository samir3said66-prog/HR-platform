import { Injectable } from '@angular/core';

/**
 * Encryption Service - Validates: Requirements 31.1, 31.2
 * 
 * Provides AES-256 encryption/decryption for sensitive data at rest
 * Uses Web Crypto API for secure encryption without external dependencies
 */

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private encryptionKey: CryptoKey | null = null;

  constructor() {
    this.initializeKey();
  }

  /**
   * Initialize encryption key from environment or generate new one
   */
  private async initializeKey(): Promise<void> {
    try {
      const keyMaterial = await this.getKeyMaterial();
      this.encryptionKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: this.getSalt().buffer as ArrayBuffer,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initializeKey();
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey!,
        dataBuffer
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);

      // Convert to base64 for storage
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initializeKey();
    }

    try {
      const combined = this.base64ToArrayBuffer(encryptedData);
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey!,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Get key material from password
   */
  private async getKeyMaterial(): Promise<CryptoKey> {
    const password = this.getEncryptionPassword();
    const encoder = new TextEncoder();
    return window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
  }

  /**
   * Get encryption password from environment or localStorage
   */
  private getEncryptionPassword(): string {
    // In production, this should come from environment variables or secure key management
    // For now, use a combination of browser fingerprint and stored key
    let password = localStorage.getItem('_enc_key');
    if (!password) {
      password = this.generateSecurePassword();
      localStorage.setItem('_enc_key', password);
    }
    return password;
  }

  /**
   * Generate secure password
   */
  private generateSecurePassword(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array);
  }

  /**
   * Get salt for key derivation
   */
  private getSalt(): Uint8Array {
    const salt = new Uint8Array(16);
    // Use a fixed salt for consistency (in production, use random salt)
    salt.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    return salt;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
