# HR Analytics Platform — Frontend

Enterprise-grade HR management platform built with Angular 21, NgRx, Tailwind CSS, and WebSocket support.

---

## Features

- **Attendance** — Face recognition + GPS check-in/out, shift management
- **Payroll** — Automated salary calculation, payslip generation
- **Employees** — Full employee lifecycle management
- **Performance** — OKRs, reviews, 360 feedback
- **Analytics** — Workforce insights, turnover, headcount trends
- **Recruitment** — Job postings, pipeline, applicant tracking
- **Admin** — User management, RBAC, audit logs
- **Settings** — Platform configuration, i18n, themes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21.2 |
| State | NgRx 21.1 |
| Styling | Tailwind CSS 4.1 |
| Language | TypeScript 5.9 |
| Build | Angular CLI 21.2 |
| Testing | Vitest 4.0 |
| Linting | ESLint 8 + Prettier 3.8 |
| Charts | ECharts 6 |
| Export | XLSX + jsPDF |
| Real-time | WebSocket |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
cd HR-platform/frontend
npm install
```

### Develop

```bash
npm start
# → http://localhost:4200
```

### Build

```bash
npm run build          # production build
npm run watch          # watch mode (development)
```

### Test

```bash
npm test               # run all tests
```

### Lint & Format

```bash
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier format
npm run format:check   # Prettier check only
```

---

## Project Structure

```
src/
├── app/
│   ├── core/          ← Auth, guards, services, interceptors
│   ├── shared/        ← 22 UI components, pipes, directives, widgets
│   ├── features/      ← 9 feature modules (lazy-loaded)
│   ├── layouts/       ← Main, Auth, Print layouts
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── store.config.ts
├── assets/
│   ├── i18n/          ← en.json, ar.json
│   ├── images/        ← icons, logos, feature images
│   └── fonts/
├── environments/
├── index.html
└── styles.css
```

---

## Documentation

All docs are in the `docs/` folder:

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design overview |
| [COMPONENTS.md](docs/COMPONENTS.md) | UI component API reference |
| [LAYOUTS.md](docs/LAYOUTS.md) | Layout shells guide |
| [ROUTES.md](docs/ROUTES.md) | Routing structure |
| [SHARED.md](docs/SHARED.md) | Shared module guide |
| [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) | Migrate from old structure |
| [IMPORT_VERIFICATION.md](docs/IMPORT_VERIFICATION.md) | Import checklist |
| [SEO.md](docs/SEO.md) | SEO & meta tags |
| [ASSETS_GUIDE.md](docs/ASSETS_GUIDE.md) | Asset organization |
| [ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment configuration |
| [TESTING.md](docs/TESTING.md) | Testing strategy |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute |
| [CHANGELOG.md](docs/CHANGELOG.md) | Version history |

---

## Environment

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for environment variable setup.

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines.

## License

Private — All rights reserved.
