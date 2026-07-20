/**
 * Attendance Feature Routes
 * Lazy-loaded routes for attendance management
 */

import { Routes } from '@angular/router';
import { authGuard, authorizationGuard } from '../../core';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/attendance.component').then(
        (m) => m.AttendanceComponent
      ),
    canActivate: [authGuard, authorizationGuard],
    data: {
      title: 'Attendance',
      roles: ['hr_user', 'manager', 'admin'],
    },
  },
];
