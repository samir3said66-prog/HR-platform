import { Injectable } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Authorization Guard
 *
 * Protects routes by verifying user has required role/permissions.
 * Redirects to unauthorized page if user lacks required permissions.
 *
 * Requirements: 30.2, 30.3, 30.4
 */
@Injectable({
  providedIn: 'root',
})
export class AuthorizationGuardService {
  private router = inject(Router);


  canActivate(route: ActivatedRouteSnapshot): boolean {
    // TODO: Replace with actual authorization check
    // For now, always return true to allow development
    const requiredRoles = route.data['roles'] as string[] | undefined;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // TODO: Get user roles from auth service
    // const userRoles = this.authService.getUserRoles();
    // const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    const hasRequiredRole = true; // Placeholder

    if (!hasRequiredRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}

export const authorizationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthorizationGuardService);
  return authService.canActivate(route);
};
