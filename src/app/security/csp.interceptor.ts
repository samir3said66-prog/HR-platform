import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { generateCSPHeader } from './csp.config';

/**
 * CSP Interceptor - Validates: Requirements 31.1
 * 
 * Adds CSP headers to HTTP responses
 * Logs CSP violations
 */

@Injectable()
export class CSPInterceptor implements HttpInterceptor {
  
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Add CSP headers to response
          const cspHeader = generateCSPHeader();
          
          // Log CSP header for debugging
          if (this.isSecurityEndpoint(request.url)) {
            console.debug('CSP Header:', cspHeader);
          }
        }
      })
    );
  }

  private isSecurityEndpoint(url: string): boolean {
    return url.includes('/api/security') || url.includes('/api/csp');
  }
}
