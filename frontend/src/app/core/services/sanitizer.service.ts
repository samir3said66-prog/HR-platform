import { Injectable, inject } from '@angular/core';

import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';

/**
 * Input Sanitization Service - Validates: Requirements 31.1
 * 
 * Sanitizes user input to prevent:
 * - XSS (Cross-Site Scripting)
 * - HTML injection
 * - Script injection
 * - URL injection
 */

@Injectable({
  providedIn: 'root'
})
export class SanitizerService {
  
  // Regex patterns for validation
  private readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly URL_PATTERN = /^https?:\/\/.+/;
  private readonly PHONE_PATTERN = /^[\d\s\-\+\(\)]+$/;
  private readonly ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9\s\-_]+$/;
  private readonly NUMERIC_PATTERN = /^[\d\.\-]+$/;

  // Dangerous HTML tags
  private readonly DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'link', 'style',
    'form', 'input', 'button', 'textarea', 'select'
  ];

  // Dangerous attributes
  private readonly DANGEROUS_ATTRIBUTES = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
    'onkeydown', 'onkeyup', 'onchange', 'onfocus', 'onblur',
    'onsubmit', 'ondblclick', 'oncontextmenu', 'onwheel'
  ];

  private domSanitizer = inject(DomSanitizer);


  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.domSanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.domSanitizer.sanitize(4, url) || '';
  }

  /**
   * Sanitize resource URL (for iframes, etc.)
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Sanitize style
   */
  sanitizeStyle(style: string): SafeStyle {
    return this.domSanitizer.sanitize(2, style) || '';
  }

  /**
   * Sanitize script
   */
  sanitizeScript(script: string): SafeScript {
    return this.domSanitizer.sanitize(5, script) || '';
  }

  /**
   * Remove HTML tags from string
   */
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Validate and sanitize email
   */
  sanitizeEmail(email: string): string | null {
    const trimmed = email.trim().toLowerCase();
    if (this.EMAIL_PATTERN.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  /**
   * Validate and sanitize URL
   */
  sanitizeUrlInput(url: string): string | null {
    const trimmed = url.trim();
    if (this.URL_PATTERN.test(trimmed)) {
      try {
        new URL(trimmed);
        return trimmed;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Validate and sanitize phone number
   */
  sanitizePhoneNumber(phone: string): string | null {
    const trimmed = phone.trim();
    if (this.PHONE_PATTERN.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  /**
   * Validate and sanitize alphanumeric input
   */
  sanitizeAlphanumeric(input: string): string | null {
    const trimmed = input.trim();
    if (this.ALPHANUMERIC_PATTERN.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  /**
   * Validate and sanitize numeric input
   */
  sanitizeNumeric(input: string): number | null {
    const trimmed = input.trim();
    if (this.NUMERIC_PATTERN.test(trimmed)) {
      const num = parseFloat(trimmed);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * Sanitize text input (remove dangerous characters)
   */
  sanitizeText(text: string, maxLength: number = 1000): string {
    let sanitized = text.trim();
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  }

  /**
   * Sanitize JSON input
   */
  sanitizeJson(json: string): any | null {
    try {
      const parsed = JSON.parse(json);
      return this.sanitizeObject(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Recursively sanitize object
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Check if string contains dangerous content
   */
  containsDangerousContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Check for dangerous tags
    for (const tag of this.DANGEROUS_TAGS) {
      if (lowerText.includes(`<${tag}`)) {
        return true;
      }
    }
    
    // Check for dangerous attributes
    for (const attr of this.DANGEROUS_ATTRIBUTES) {
      if (lowerText.includes(attr)) {
        return true;
      }
    }
    
    // Check for script protocols
    if (lowerText.includes('javascript:') || lowerText.includes('data:text/html')) {
      return true;
    }
    
    return false;
  }

  /**
   * Validate input against whitelist
   */
  validateAgainstWhitelist(input: string, whitelist: string[]): boolean {
    return whitelist.includes(input);
  }

  /**
   * Sanitize file name
   */
  sanitizeFileName(fileName: string): string {
    // Remove path traversal attempts
    let sanitized = fileName.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
    
    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
    
    // Remove leading/trailing spaces and dots
    sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');
    
    // Limit length
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }
    
    return sanitized || 'file';
  }

  /**
   * Sanitize SQL-like input (basic protection)
   */
  sanitizeSqlInput(input: string): string {
    // Remove SQL keywords and dangerous characters
    let sanitized = input.replace(/['";\\]/g, '');
    sanitized = sanitized.replace(/--/g, '');
    sanitized = sanitized.replace(/\/\*/g, '');
    sanitized = sanitized.replace(/\*\//g, '');
    
    return sanitized;
  }

  /**
   * Create safe HTML from trusted source
   */
  bypassSecurityTrustHtml(html: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }
}
