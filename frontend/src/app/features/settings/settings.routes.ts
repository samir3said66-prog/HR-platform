/**
 * Settings Feature Routes
 * Lazy-loaded routes for user preferences and settings
 */

import { Routes } from '@angular/router';
import { authGuard } from '../../core';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings.component').then(
        (m) => m.SettingsComponent
      ),
    canActivate: [authGuard],
    data: {
      title: 'Settings',
      description: 'User preferences and application settings',
    },
  },
];
