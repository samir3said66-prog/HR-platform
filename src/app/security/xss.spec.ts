import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SanitizerService } from './sanitizer.service';

/**
 * XSS Vulnerability Tests - Validates: Requirements 31.1
 * 
 * Tests verify:
 * - XSS attacks are prevented
 * - Input sanitization works correctly
 * - Dangerous content is detected
 */

describe('XSS Prevention', () => {
  let service: SanitizerService;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SanitizerService]
    });

    service = TestBed.inject(SanitizerService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  describe('Script Injection Prevention', () => {
    it('should prevent script tag injection', () => {
      const malicious = '<script>alert("XSS")</script>';
      const result = service.stripHtmlTags(malicious);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should prevent inline script execution', () => {
      const malicious = '<img src=x onerror="alert(\'XSS\')">';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should prevent event handler injection', () => {
      const malicious = '<div onclick="alert(\'XSS\')">Click me</div>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should prevent javascript: protocol', () => {
      const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should prevent data: protocol with HTML', () => {
      const malicious = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });
  });

  describe('HTML Injection Prevention', () => {
    it('should escape HTML special characters', () => {
      const input = '<div>Test & "quotes"</div>';
      const result = service.escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;');
    });

    it('should remove HTML tags', () => {
      const input = '<p>Hello <b>World</b></p>';
      const result = service.stripHtmlTags(input);
      expect(result).toBe('Hello World');
    });

    it('should prevent iframe injection', () => {
      const malicious = '<iframe src="http://evil.com"></iframe>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should prevent object tag injection', () => {
      const malicious = '<object data="http://evil.com/malware.swf"></object>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should prevent embed tag injection', () => {
      const malicious = '<embed src="http://evil.com/malware.swf">';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });
  });

  describe('Event Handler Prevention', () => {
    it('should detect onclick handler', () => {
      const malicious = '<button onclick="alert(\'XSS\')">Click</button>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should detect onload handler', () => {
      const malicious = '<img src=x onload="alert(\'XSS\')">';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should detect onerror handler', () => {
      const malicious = '<img src=x onerror="alert(\'XSS\')">';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should detect onmouseover handler', () => {
      const malicious = '<div onmouseover="alert(\'XSS\')">Hover</div>';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });

    it('should detect onkeydown handler', () => {
      const malicious = '<input onkeydown="alert(\'XSS\')">';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', () => {
      expect(service.sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(service.sanitizeEmail('invalid-email')).toBeNull();
      expect(service.sanitizeEmail('test@')).toBeNull();
    });

    it('should validate URL format', () => {
      expect(service.sanitizeUrlInput('https://example.com')).toBe('https://example.com');
      expect(service.sanitizeUrlInput('http://example.com')).toBe('http://example.com');
      expect(service.sanitizeUrlInput('not-a-url')).toBeNull();
      expect(service.sanitizeUrlInput('javascript:alert(1)')).toBeNull();
    });

    it('should validate phone number format', () => {
      expect(service.sanitizePhoneNumber('123-456-7890')).toBe('123-456-7890');
      expect(service.sanitizePhoneNumber('+1 (123) 456-7890')).toBe('+1 (123) 456-7890');
      expect(service.sanitizePhoneNumber('abc-def-ghij')).toBeNull();
    });

    it('should validate alphanumeric input', () => {
      expect(service.sanitizeAlphanumeric('Test123')).toBe('Test123');
      expect(service.sanitizeAlphanumeric('Test-123')).toBe('Test-123');
      expect(service.sanitizeAlphanumeric('Test@123')).toBeNull();
    });

    it('should validate numeric input', () => {
      expect(service.sanitizeNumeric('123')).toBe(123);
      expect(service.sanitizeNumeric('123.45')).toBe(123.45);
      expect(service.sanitizeNumeric('-123')).toBe(-123);
      expect(service.sanitizeNumeric('abc')).toBeNull();
    });
  });

  describe('Text Sanitization', () => {
    it('should remove null bytes', () => {
      const input = 'Hello\x00World';
      const result = service.sanitizeText(input);
      expect(result).not.toContain('\x00');
    });

    it('should remove control characters', () => {
      const input = 'Hello\x01\x02World';
      const result = service.sanitizeText(input);
      expect(result).not.toContain('\x01');
      expect(result).not.toContain('\x02');
    });

    it('should limit text length', () => {
      const input = 'a'.repeat(2000);
      const result = service.sanitizeText(input, 1000);
      expect(result.length).toBeLessThanOrEqual(1000);
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = service.sanitizeText(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('JSON Sanitization', () => {
    it('should sanitize JSON object', () => {
      const json = '{\"name\":\"<script>alert(1)</script>\",\"age\":30}';
      const result = service.sanitizeJson(json);
      expect(result).toBeDefined();
      expect(result.name).not.toContain('<script>');
    });

    it('should handle invalid JSON', () => {
      const json = '{invalid json}';
      const result = service.sanitizeJson(json);
      expect(result).toBeNull();
    });

    it('should sanitize nested objects', () => {
      const json = '{\"user\":{\"name\":\"<img src=x onerror=alert(1)>\"}}';
      const result = service.sanitizeJson(json);
      expect(result).toBeDefined();
      expect(result.user.name).not.toContain('onerror');
    });

    it('should sanitize arrays', () => {
      const json = '[\"<script>alert(1)</script>\",\"normal\"]';
      const result = service.sanitizeJson(json);
      expect(result).toBeDefined();
      expect(result[0]).not.toContain('<script>');
    });
  });

  describe('File Name Sanitization', () => {
    it('should remove path traversal attempts', () => {
      const fileName = '../../etc/passwd';
      const result = service.sanitizeFileName(fileName);
      expect(result).not.toContain('..');
    });

    it('should remove dangerous characters', () => {
      const fileName = 'file<script>.txt';
      const result = service.sanitizeFileName(fileName);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should limit file name length', () => {
      const fileName = 'a'.repeat(300) + '.txt';
      const result = service.sanitizeFileName(fileName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('should handle null bytes in file name', () => {
      const fileName = 'file\x00.txt';
      const result = service.sanitizeFileName(fileName);
      expect(result).not.toContain('\x00');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should remove SQL quotes', () => {
      const input = "'; DROP TABLE users; --";
      const result = service.sanitizeSqlInput(input);
      expect(result).not.toContain("'");
      expect(result).not.toContain('"');
    });

    it('should remove SQL comments', () => {
      const input = 'SELECT * FROM users -- comment';
      const result = service.sanitizeSqlInput(input);
      expect(result).not.toContain('--');
    });

    it('should remove SQL block comments', () => {
      const input = 'SELECT /* comment */ * FROM users';
      const result = service.sanitizeSqlInput(input);
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('should remove backslashes', () => {
      const input = "'; \\ DROP TABLE users;";
      const result = service.sanitizeSqlInput(input);
      expect(result).not.toContain('\\');
    });
  });

  describe('Whitelist Validation', () => {
    it('should validate against whitelist', () => {
      const whitelist = ['admin', 'user', 'guest'];
      expect(service.validateAgainstWhitelist('admin', whitelist)).toBe(true);
      expect(service.validateAgainstWhitelist('user', whitelist)).toBe(true);
      expect(service.validateAgainstWhitelist('hacker', whitelist)).toBe(false);
    });

    it('should be case sensitive', () => {
      const whitelist = ['Admin', 'User'];
      expect(service.validateAgainstWhitelist('admin', whitelist)).toBe(false);
      expect(service.validateAgainstWhitelist('Admin', whitelist)).toBe(true);
    });
  });

  describe('Dangerous Content Detection', () => {
    it('should detect multiple XSS vectors', () => {
      const vectors = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<iframe src=javascript:alert(1)>',
        '<body onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>',
        '<marquee onstart=alert(1)>',
        '<details open ontoggle=alert(1)>',
        '<video src=x onerror=alert(1)>',
        '<audio src=x onerror=alert(1)>'
      ];

      vectors.forEach(vector => {
        expect(service.containsDangerousContent(vector)).toBe(true);
      });
    });

    it('should not flag safe content', () => {
      const safeContent = [
        'Hello World',
        'This is a normal paragraph',
        'user@example.com',
        'https://example.com',
        '123-456-7890'
      ];

      safeContent.forEach(content => {
        expect(service.containsDangerousContent(content)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      expect(service.sanitizeText('')).toBe('');
      expect(service.stripHtmlTags('')).toBe('');
      expect(service.escapeHtml('')).toBe('');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = service.sanitizeText(longString, 1000);
      expect(result.length).toBeLessThanOrEqual(1000);
    });

    it('should handle special Unicode characters', () => {
      const input = '你好世界 🌍 مرحبا';
      const result = service.sanitizeText(input);
      expect(result).toBe(input);
    });

    it('should handle mixed case event handlers', () => {
      const malicious = '<img src=x OnErRoR="alert(1)">';
      expect(service.containsDangerousContent(malicious)).toBe(true);
    });
  });
});
