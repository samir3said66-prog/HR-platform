/**
 * Authentication Constants
 * Auth-related configuration and constants
 */

export const AUTH_CONSTANTS = {
  // Storage keys
  TOKEN_KEY: 'hr_platform_token',
  REFRESH_TOKEN_KEY: 'hr_platform_refresh_token',
  USER_KEY: 'hr_platform_user',

  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // Refresh 5 minutes before expiry

  // JWT settings
  JWT_HEADER: 'Authorization',
  JWT_PREFIX: 'Bearer',

  // Default paths
  LOGIN_PATH: '/login',
  HOME_PATH: '/',
  UNAUTHORIZED_PATH: '/unauthorized',
};
