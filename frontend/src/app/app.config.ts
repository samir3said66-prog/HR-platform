/**
 * Application Configuration
 * 
 * Bootstraps the HR Platform with:
 * - Core services and providers
 * - Feature-based routing with lazy loading
 * - NgRx store with feature stores
 * - HTTP client and interceptors
 * - Animations and global error handling
 * - Store DevTools for debugging
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Routing
import { routes } from './app.routes';

// Core providers (services, guards, interceptors)
import { CORE_PROVIDERS } from './core/core.config';

// Store configuration
import { getStoreConfig } from './store.config';

/**
 * Application Configuration
 * 
 * Features:
 * - Centralized provider management
 * - Feature-based store registration
 * - Core service singletons
 * - HTTP interceptors
 * - Development tools
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Angular animations
    provideAnimationsAsync(),

    // Global error handling
    provideBrowserGlobalErrorListeners(),

    // Routing with lazy-loaded features
    provideRouter(routes),

    // HTTP client with interceptors
    provideHttpClient(),

    // Core providers (Auth, Guards, Interceptors, Services)
    ...CORE_PROVIDERS,

    // Feature store configuration (NgRx)
    ...getStoreConfig(),

    // NgRx Store DevTools (for debugging in development)
    provideStoreDevtools({
      maxAge: 25,                // Retain last 25 actions
      logOnly: !isDevMode(),     // Log only in production
      features: {
        pause: true,             // Pause action dispatch
        lock: true,              // Lock time-travel
        persist: true,           // Persist state
      },
    }),
  ],
};
