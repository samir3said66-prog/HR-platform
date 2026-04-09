# HR Analytics Platform

Enterprise-grade HR analytics platform built with Angular 18, NgRx, and real-time WebSocket support. Provides comprehensive workforce analytics, performance management, and hiring forecasts.

## 📚 Documentation

Complete documentation is available in the `/docs` folder:

### Quick Links

- **[📖 Documentation Index](./docs/DOCUMENTATION_INDEX.md)** - Start here for an overview of all documentation
- **[👤 User Guide](./docs/USER_GUIDE.md)** - For end users and HR professionals
- **[⚙️ Admin Guide](./docs/ADMIN_GUIDE.md)** - For system administrators
- **[🔧 Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md)** - For developers and architects
- **[❓ FAQ](./docs/FAQ.md)** - Frequently asked questions and troubleshooting

### Documentation Overview

| Document | Audience | Purpose |
|----------|----------|---------|
| [User Guide](./docs/USER_GUIDE.md) | End Users, HR Professionals | Learn how to use all platform features |
| [Admin Guide](./docs/ADMIN_GUIDE.md) | System Administrators, IT Ops | Configure, monitor, and maintain the system |
| [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md) | Developers, Architects | Understand architecture and implementation |
| [FAQ](./docs/FAQ.md) | All Users | Find answers to common questions |
| [Documentation Index](./docs/DOCUMENTATION_INDEX.md) | All Users | Navigate all documentation |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Angular CLI 21+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4200/`

## 🛠️ Development

### Development Server

Start the development server with hot reload:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application automatically reloads when you modify source files.

### Code Scaffolding

Generate new components:

```bash
ng generate component component-name
```

Available schematics: `components`, `directives`, `pipes`, `services`, `guards`, etc.

For a complete list:

```bash
ng generate --help
```

### Building

Build the project for production:

```bash
ng build
```

Build artifacts are stored in the `dist/` directory. The production build optimizes for performance and speed.

### Running Tests

#### Unit Tests

Run unit tests with Vitest:

```bash
ng test
```

Run tests in watch mode:

```bash
ng test --watch
```

Run tests with coverage:

```bash
ng test --coverage
```

#### End-to-End Tests

Run E2E tests:

```bash
ng e2e
```

## 📊 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── services/            # Business logic services
│   ├── store/               # NgRx state management
│   │   ├── employees/       # Employee data state
│   │   ├── performance/     # Performance metrics
│   │   ├── dashboard/       # Dashboard configuration
│   │   └── preferences/     # User preferences
│   ├── guards/              # Route guards
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   ├── app.routes.ts        # Route configuration
│   └── app.config.ts        # App configuration
├── data/                    # Mock data
├── environments/            # Environment configs
└── styles/                  # Global styles
```

## 🏗️ Architecture

The platform uses a modern, scalable architecture:

- **Frontend**: Angular 18 with standalone components
- **Build Tool**: Vite
- **State Management**: NgRx with feature modules
- **Real-Time**: WebSocket with RxJS
- **Styling**: Tailwind CSS with dark mode
- **Testing**: Vitest with property-based testing
- **i18n**: Angular i18n (English & Arabic)

For detailed architecture information, see [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md).

## ✨ Key Features

- **Real-Time Dashboard** - Live KPI updates and metrics
- **Employee Analytics** - Comprehensive employee data management
- **Performance Analytics** - Performance tracking and analysis
- **Workforce Metrics** - Headcount and staffing analysis
- **Turnover Analysis** - Historical trends and predictions
- **Hiring Forecasts** - 12-month hiring predictions
- **Advanced Filtering** - Powerful search and filter capabilities
- **Report Generation** - PDF, Excel, and CSV exports
- **Dark Mode** - Full dark mode support
- **Internationalization** - English and Arabic with RTL support
- **Accessibility** - WCAG 2.2 Level AA compliant
- **Real-Time Sync** - WebSocket-based data synchronization

## 🔒 Security

- JWT-based authentication
- Role-Based Access Control (RBAC)
- HTTPS/TLS encryption
- AES-256 data encryption
- Content Security Policy (CSP)
- Audit logging (7-year retention)
- 30-minute session timeout

For security details, see [Technical Documentation - Security](./docs/TECHNICAL_DOCUMENTATION.md#security).

## ♿ Accessibility

The platform meets WCAG 2.2 Level AA standards:

- Full keyboard navigation
- Screen reader support (NVDA, JAWS, VoiceOver)
- High contrast support
- Text resizable up to 200%
- Semantic HTML structure
- ARIA labels and roles

For accessibility details, see [User Guide - Accessibility Features](./docs/USER_GUIDE.md#accessibility-features).

## 🌍 Internationalization

Supported languages:

- English (en-US)
- العربية (ar-SA) with RTL layout

For i18n details, see [Technical Documentation - Internationalization](./docs/TECHNICAL_DOCUMENTATION.md#internationalization-i18n).

## 📈 Performance

Performance targets:

- Bundle size: <2.5MB
- Initial load: <2 seconds
- Lighthouse score: >94
- Real-time sync: <500ms
- Filter performance: <600ms for 10,000+ records

For optimization details, see [Technical Documentation - Performance](./docs/TECHNICAL_DOCUMENTATION.md#performance-optimization).

## 🧪 Testing

Comprehensive testing strategy:

- **Unit Tests**: >80% coverage for services, components, state management
- **Property-Based Tests**: Filter consistency, metric calculations, stream propagation
- **Integration Tests**: Real-time features, connection handling
- **E2E Tests**: Critical user workflows

Run tests:

```bash
# Unit tests
ng test

# Unit tests with coverage
ng test --coverage

# E2E tests
ng e2e
```

## 🚢 Deployment

### CI/CD Pipeline

The project uses GitHub Actions for:

- Automated testing on pull requests
- Automated build and deployment
- Staging environment testing
- Blue-green deployment strategy

### Production Build

```bash
ng build --configuration production
```

For deployment details, see [Admin Guide - Deployment](./docs/ADMIN_GUIDE.md#deployment).

## 📝 Development Guidelines

### Code Style

- ESLint for code quality
- Prettier for code formatting
- Pre-commit hooks for validation

### Component Development

- Use standalone components
- Apply OnPush change detection
- Use Angular Signals for local state
- Implement proper error handling
- Add ARIA attributes

### State Management

- Keep state normalized
- Use selectors for derived state
- Handle side effects in effects
- Implement error handling
- Write unit tests

For detailed guidelines, see [Technical Documentation - Development Guidelines](./docs/TECHNICAL_DOCUMENTATION.md#development-guidelines).

## 🐛 Troubleshooting

### Common Issues

**Development server won't start**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

**Tests failing**
```bash
# Clear test cache
ng test --no-cache
```

**Build errors**
```bash
# Clean build
ng build --configuration production --no-cache
```

For more troubleshooting, see:
- [User Guide - Troubleshooting](./docs/USER_GUIDE.md#troubleshooting)
- [Admin Guide - Troubleshooting](./docs/ADMIN_GUIDE.md#troubleshooting)
- [FAQ - Troubleshooting](./docs/FAQ.md#troubleshooting)

## 📞 Support

For help and support:

- Check the [FAQ](./docs/FAQ.md)
- Review relevant documentation in `/docs`
- Contact support: support@company.com
- Report bugs: bugs@company.com

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Angular Documentation](https://angular.io)
- [NgRx Documentation](https://ngrx.io)
- [RxJS Documentation](https://rxjs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Angular CLI Reference](https://angular.dev/tools/cli)

## 📋 Additional Resources

- [PHASE_3_IMPLEMENTATION.md](./PHASE_3_IMPLEMENTATION.md) - Phase 3 implementation details
- [PHASE_4_IMPLEMENTATION.md](./PHASE_4_IMPLEMENTATION.md) - Phase 4 implementation details

---

**Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready
