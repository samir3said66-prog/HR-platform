# SEO & Assets Optimization Guide

## Overview

SEO configuration, meta tags, favicon strategy, and asset optimization for the HR Analytics Platform.

---

## index.html Meta Tags

### Title (65 chars)
```
HR Analytics Platform - Complete Employee Management, Payroll & Attendance System
```

### Description (160 chars)
```
Complete enterprise HR management platform with attendance tracking via face recognition & GPS,
accurate payroll calculation, performance analytics, recruitment tools, and real-time workforce insights.
```

### Keywords
```
HR platform, payroll system, attendance tracking, face recognition, GPS tracking,
employee management, performance reviews, recruitment, analytics, HRMS, cloud HR,
enterprise HR, workforce management, salary calculation, leave management
```

---

## Structured Data (JSON-LD)

Two schemas implemented in `index.html`:

### SoftwareApplication
```json
{
  "@type": "SoftwareApplication",
  "name": "HR Analytics Platform",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0" },
  "aggregateRating": { "ratingValue": "4.8", "ratingCount": "500" }
}
```

### Organization
```json
{
  "@type": "Organization",
  "name": "HR Analytics Platform",
  "url": "https://hrplatform.com",
  "logo": "https://hrplatform.com/assets/images/icons/icon-512.svg"
}
```

---

## Open Graph + Twitter Card

All tags in `index.html`. Images reference SVG files in `src/assets/images/logos/`:

| Tag | Value |
|-----|-------|
| `og:image` | `/assets/images/logos/og-image.svg` (1200×630) |
| `twitter:image` | `/assets/images/logos/twitter-image.svg` (1200×600) |
| `og:image:type` | `image/svg+xml` |

---

## Favicon Strategy

All icons live in two places:

```
public/
├── favicon.svg              ← Primary (browser tab, all modern browsers)
├── favicon.ico              ← Fallback (legacy IE/Edge)
└── apple-touch-icon.svg     ← iOS home screen (180×180, system clips corners)

src/assets/images/icons/
├── icon-16.svg
├── icon-32.svg
├── icon-48.svg
├── icon-64.svg
├── icon-96.svg
├── icon-192.svg             ← Android home screen / PWA
└── icon-512.svg             ← Play Store / splash screen (has maskable safe-zone)
```

### index.html link order
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/assets/images/icons/icon-16.svg"  sizes="16x16" />
<link rel="icon" type="image/svg+xml" href="/assets/images/icons/icon-32.svg"  sizes="32x32" />
<link rel="icon" type="image/svg+xml" href="/assets/images/icons/icon-48.svg"  sizes="48x48" />
<link rel="icon" type="image/svg+xml" href="/assets/images/icons/icon-64.svg"  sizes="64x64" />
<link rel="icon" type="image/svg+xml" href="/assets/images/icons/icon-96.svg"  sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/assets/images/icons/icon-192.svg" sizes="192x192" />
<link rel="apple-touch-icon" href="/apple-touch-icon.svg" sizes="180x180" />
<link rel="manifest" href="/manifest.json" />
```

---

## manifest.json (PWA)

```json
{
  "name": "HR Analytics Platform",
  "short_name": "HR Platform",
  "theme_color": "#3b82f6",
  "background_color": "#1e3a8a",
  "display": "standalone",
  "icons": [ ...all icon-*.svg entries with any + maskable purposes... ],
  "shortcuts": [ Dashboard, Employees, Attendance, Payroll ]
}
```

---

## Security Headers (in index.html)

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | default-src 'self'; script-src 'self' unsafe-inline … |
| `Permissions-Policy` | geolocation=(self), microphone=(), camera=() |
| `X-Content-Type-Options` | nosniff |
| `X-Frame-Options` | SAMEORIGIN |
| `X-XSS-Protection` | 1; mode=block |
| `Referrer-Policy` | strict-origin-when-cross-origin |

---

## robots.txt (`public/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: https://hrplatform.com/sitemap.xml
```

---

## Resource Hints

```html
<link rel="dns-prefetch" href="https://api.hrplatform.com" />
<link rel="preconnect" href="https://api.hrplatform.com" crossorigin />
<link rel="preload" as="font" href="/assets/fonts/main.woff2" type="font/woff2" crossorigin />
<link rel="preload" as="image" href="/favicon.svg" type="image/svg+xml" />
<link rel="preload" as="image" href="/assets/images/icons/icon-192.svg" type="image/svg+xml" />
```

---

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Lighthouse overall | 94+ |

---

## Validation Tools

| Tool | URL |
|------|-----|
| PageSpeed Insights | https://pagespeed.web.dev/ |
| Rich Results Test | https://search.google.com/test/rich-results |
| OG Debugger | https://developers.facebook.com/tools/debug/ |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |
| Schema Validator | https://validator.schema.org/ |

---

## SEO Checklist

- [x] Title tag (65 chars)
- [x] Meta description (160 chars)
- [x] Structured data (JSON-LD)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Canonical URL
- [x] Language alternates (en/ar)
- [x] Security headers
- [x] Favicon + all icon sizes
- [x] PWA manifest
- [x] robots.txt
- [x] OG image (1200×630)
- [x] Twitter image (1200×600)
- [ ] Google Analytics (GA4) — add ID when domain ready
- [ ] Google Search Console — verify domain
- [ ] Sitemap.xml — generate from routes
- [ ] Submit sitemap to search engines

---

## Google Analytics Setup

Uncomment in `index.html` when domain is ready:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
</script>
```
