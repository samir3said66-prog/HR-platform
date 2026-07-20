/**
 * Core Module Configuration
 * Provides all core services as singletons
 */

import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { AuthService } from './auth/auth.service';
import { AuthorizationService } from './services/authorization.service';
import { WebSocketService } from './services/websocket.service';
import { AuditService } from './services/audit.service';
import { I18nService } from './services/i18n.service';
import { ThemeService } from './services/theme.service';
import { ReportService } from './services/report.service';
import { DataService } from './services/data.service';

// Interceptors
import { CSPInterceptor } from './interceptors/csp.interceptor';

export const CORE_PROVIDERS: Provider[] = [
  // Auth & Security
  AuthService,
  AuthorizationService,
  
  // Core Services
  WebSocketService,
  AuditService,
  I18nService,
  ThemeService,
  ReportService,
  DataService,

  // HTTP Interceptors
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CSPInterceptor,
    multi: true,
  },
];
