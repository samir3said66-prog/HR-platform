/**
 * Storage Utility
 * Secure local and session storage operations
 */

export class StorageUtil {
  private static prefix = 'hr_platform_';

  static setItem(key: string, value: any, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const prefixedKey = this.prefix + key;
      storage.setItem(prefixedKey, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  static getItem<T>(key: string, useSession = false): T | null {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const prefixedKey = this.prefix + key;
      const item = storage.getItem(prefixedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  }

  static removeItem(key: string, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const prefixedKey = this.prefix + key;
      storage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }

  static clear(useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
}
