import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Authentication Guard
 *
 * Protects routes by verifying user is authenticated.
 * Redirects to login if user is not authenticated.
 *
 * Requirements: 30.1, 30.2, 30.3
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  private router = inject(Router);


  canActivate(): boolean {
    // TODO: Replace with actual authentication check
    // For now, always return true to allow development
    const isAuthenticated = true; // this.authService.isAuthenticated();

    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthGuardService);
  return authService.canActivate();
};
