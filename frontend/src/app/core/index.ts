/**
 * Core Module Barrel Export
 * Exports all core services, guards, models, and utilities
 */

// Auth & Guards
export { AuthService } from './auth/auth.service';
export { authGuard } from './guards/auth.guard';
export { authorizationGuard } from './guards/authorization.guard';

// Services
export { AuthorizationService } from './services/authorization.service';
export { WebSocketService } from './services/websocket.service';
export { AuditService } from './services/audit.service';
export { I18nService } from './services/i18n.service';
export { ThemeService } from './services/theme.service';
export { ReportService } from './services/report.service';
export { DataService } from './services/data.service';
export { EncryptionService } from './services/encryption.service';
export { SanitizerService } from './services/sanitizer.service';

// Models
export * from './models/index';

// Utils
export * from './utils/index';

// Constants
export * from './constants/index';

// Config
export { CORE_PROVIDERS } from './core.config';
