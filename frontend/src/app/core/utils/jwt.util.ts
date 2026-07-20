/**
 * JWT Utility
 * JWT token parsing and validation
 */

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  roles?: string[];
  [key: string]: any;
}

export class JwtUtil {
  static parseToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const decoded = this.decode(parts[1]);
      return decoded as JwtPayload;
    } catch (error) {
      console.error('JWT parsing error:', error);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload) {
      return true;
    }

    const expiration = payload.exp * 1000;
    return Date.now() >= expiration;
  }

  static getTokenExpiration(token: string): Date | null {
    const payload = this.parseToken(token);
    if (!payload) {
      return null;
    }

    return new Date(payload.exp * 1000);
  }

  static getRoles(token: string): string[] {
    const payload = this.parseToken(token);
    return payload?.roles || [];
  }

  private static decode(str: string): any {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw new Error('Invalid token');
    }

    try {
      return JSON.parse(decodeURIComponent(atob(output)));
    } catch (error) {
      return null;
    }
  }
}
