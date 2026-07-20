/**
 * Logger Utility
 * Centralized logging for the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private static isDevelopment = !this.isProduction();

  static debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  static info(message: string, data?: any): void {
    console.info(`[INFO] ${message}`, data);
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
  }

  private static isProduction(): boolean {
    return (window as any)['ng'].probe(document.body).injector.get('platform') === 'prod';
  }
}
