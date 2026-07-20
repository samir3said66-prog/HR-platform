/**
 * Admin Feature Routes
 * Lazy-loaded routes for admin panel
 */

import { Routes } from '@angular/router';
import { authGuard, authorizationGuard } from '../../core';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard, authorizationGuard],
    data: {
      title: 'Admin Panel',
      roles: ['admin'],
    },
  },
];
