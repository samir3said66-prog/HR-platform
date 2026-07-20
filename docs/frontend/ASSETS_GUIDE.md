# Assets Organization Guide

## Directory Map

```
src/assets/
├── fonts/                    ← Web fonts (WOFF2)
│   └── main.woff2
│
├── i18n/                     ← Translation JSON files
│   ├── en.json
│   └── ar.json
│
├── images/
│   ├── icons/                ← App icon set (all SVG)
│   │   ├── icon-16.svg
│   │   ├── icon-32.svg
│   │   ├── icon-48.svg
│   │   ├── icon-64.svg
│   │   ├── icon-96.svg
│   │   ├── icon-192.svg
│   │   └── icon-512.svg
│   │
│   ├── logos/                ← Brand / social images
│   │   ├── og-image.svg      (1200×630 — Open Graph)
│   │   └── twitter-image.svg (1200×600 — Twitter Card)
│   │
│   ├── screenshots/          ← PWA store screenshots
│   │   ├── desktop.png       (1280×720)
│   │   └── mobile.png        (540×960)
│   │
│   ├── dashboard/            ← Dashboard feature images
│   ├── employees/            ← Employee feature images
│   ├── performance/          ← Performance feature images
│   ├── analytics/            ← Analytics feature images
│   └── recruitment/          ← Recruitment feature images
│
└── seo/
    ├── robots.txt
    ├── sitemap.xml
    └── .htaccess

public/                       ← Served at root URL /
├── favicon.svg               ← Primary browser tab icon
├── favicon.ico               ← Legacy fallback
├── apple-touch-icon.svg      ← iOS home screen (180×180)
├── manifest.json             ← PWA manifest
├── robots.txt                ← Crawler rules
└── browserconfig.xml         ← Windows tile config
```

---

## Referencing Assets in Components

### Icons
```html
<img src="/assets/images/icons/icon-96.svg" alt="HR Platform" width="96" height="96" />
```

### Feature Images
```html
<img src="/assets/images/employees/avatar.webp" alt="Employee photo" loading="lazy" />
```

### Logos / OG images (social sharing only — referenced from index.html)
```html
<meta property="og:image" content="https://hrplatform.com/assets/images/logos/og-image.svg" />
```

### Fonts (in styles.css)
```css
@font-face {
  font-family: 'Main';
  src: url('/assets/fonts/main.woff2') format('woff2');
  font-display: swap;
}
```

### i18n (via I18nService — not direct URL)
```typescript
this.i18nService.loadTranslations('en'); // loads /assets/i18n/en.json
```

---

## Adding Assets

### New feature images
```
1. Add file to src/assets/images/{feature-name}/
2. Reference via /assets/images/{feature-name}/{file}.webp
3. Always include alt="" and loading="lazy" for below-fold images
```

### New icon size
```
1. Create icon-{size}.svg in src/assets/images/icons/
2. Add <link rel="icon" …> entry in index.html
3. Add entry to manifest.json icons array
```

### New translation file
```
1. Create src/assets/i18n/{lang}.json
2. Register in I18nService supported languages
3. Add hreflang link in index.html
```

---

## Image Format Guide

| Content type | Format | Notes |
|-------------|--------|-------|
| Icons / logos | SVG | Scales perfectly, tiny file |
| UI illustrations | SVG | Prefer SVG over PNG |
| Photos | WebP | With JPEG fallback |
| Screenshots | PNG | Exact pixel rendering |
| Animated | WebP/AVIF | Avoid GIF |

---

## Optimization Checklist

- [ ] All SVGs minified (remove unused attrs, comments)
- [ ] Photos compressed with TinyPNG or Squoosh
- [ ] WebP versions for all JPEG/PNG photos
- [ ] Icons referenced via `<link rel="icon">` — not `<img>`
- [ ] Below-fold images use `loading="lazy"`
- [ ] Critical images preloaded in `<head>`
