# Changelog

All notable changes to the HR Analytics Platform frontend are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### In Progress
- E2E test suite setup
- Google Analytics integration
- Sitemap.xml generation
- PWA service worker

---

## [2.0.0] — 2026-07-20

### Added
- **Feature-based architecture** — 9 self-contained feature modules
  (Dashboard, Employees, Performance, Recruitment, Analytics,
   Attendance, Payroll, Admin, Settings)
- **Core module** — AuthService, guards, interceptors, WebSocket, i18n, Theme, Audit
- **Shared component library** — 22 UI components, 9 common components,
  6 pipes, 5 directives, 5 widgets
- **Three layout shells** — MainLayout, AuthLayout, PrintLayout
- **NgRx feature stores** — per-feature store configuration via `store.config.ts`
- **Full SVG icon set** — favicon (32×32), icon-16/32/48/64/96/192/512,
  apple-touch-icon (180×180), og-image (1200×630), twitter-image (1200×600)
- **PWA manifest** — 12 icon entries, 4 app shortcuts, share target
- **Comprehensive SEO** — 30+ meta tags, JSON-LD structured data,
  Open Graph, Twitter Card, security headers
- **Global styles** — CSS custom properties, dark mode, accessibility,
  responsive design, print styles
- **docs/ folder** — 13 markdown documentation files
- **robots.txt + browserconfig.xml** — in public/

### Changed
- `app.config.ts` — now delegates to `CORE_PROVIDERS` + `getStoreConfig()`
- `app.routes.ts` — feature-based lazy loading under layout wrappers
- `index.html` — enhanced with full SEO, all icon sizes, preloads
- `app.ts` + `app.spec.ts` — imports updated to `@app/core`

### Removed
- `src/app/components/` — migrated to `shared/components/ui/`
- `src/app/services/` — migrated to `core/services/`
- `src/app/guards/` — migrated to `core/guards/`
- `src/app/store/` — migrated to `features/*/store/`
- `src/app/pages/` — migrated to `features/*/pages/`
- `src/app/security/` — migrated to `core/`
- `src/app/testing/` — moved to `src/config/`
- `src/app/assets/` — moved to `src/assets/`
- `src/config/styles.css` — duplicate removed, `src/styles.css` is canonical
- `src/assets/images/logos/favicon-192.svg` + `favicon-512.svg` — wrong folder,
  replaced by `src/assets/images/icons/icon-192.svg` + `icon-512.svg`

---

## [1.0.0] — 2026-06-01 (initial clone)

### Added
- Angular 21 project scaffold
- Basic flat component structure
- Initial NgRx store
- Tailwind CSS integration
- ESLint + Prettier + Husky setup
- Vitest test configuration
- ECharts integration
- XLSX + jsPDF export utilities
- Arabic text support (arabic-persian-reshaper)
- Environment files (dev + prod)
