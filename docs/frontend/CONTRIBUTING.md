# Contributing Guide

Guidelines for contributing to the HR Analytics Platform frontend.

---

## Getting Started

1. Clone the repository
2. `cd HR-platform/frontend && npm install`
3. Create a feature branch: `git checkout -b feat/my-feature`
4. Make your changes
5. Run checks before committing (see below)
6. Submit a pull request

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/short-description` | `feat/attendance-map-view` |
| Bug fix | `fix/short-description` | `fix/payroll-rounding-error` |
| Docs | `docs/what-changed` | `docs/update-routes-guide` |
| Refactor | `refactor/what` | `refactor/employee-store` |
| Chore | `chore/what` | `chore/update-angular-21-3` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(employees): add bulk import via CSV
fix(payroll): correct rounding for overtime hours
docs(routes): update role access table
refactor(store): extract dashboard effects to own file
chore(deps): update @angular/* to 21.2.8
```

---

## Pre-Commit Checks

Husky runs these automatically on `git commit`:

```bash
npm run lint           # ESLint — must pass
npm run format:check   # Prettier — must pass
```

To fix before committing:

```bash
npm run lint:fix
npm run format
```

---

## Adding a New Feature Module

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for the full checklist. Quick summary:

```
1. Create src/app/features/my-feature/
2. Add pages/, components/, services/, store/, models/
3. Create my-feature.routes.ts + index.ts
4. Register in features/index.ts + app.routes.ts
5. Add store config to store.config.ts if needed
6. Add docs/MY_FEATURE.md
```

---

## Adding a Shared Component

```
1. Create src/app/shared/components/ui/my-component/my-component.component.ts
2. Use standalone: true, OnPush, no store access
3. Export from shared/components/ui/index.ts
4. Add to shared/components/index.ts group
5. Add to SharedModule imports[] + exports[]
6. Document in docs/COMPONENTS.md
```

---

## Code Standards

### TypeScript
- Strict mode is enabled — no `any` without justification
- All public inputs/outputs must have types
- Use `readonly` for inputs where possible
- Prefer `const` over `let`

### Components
- Always `standalone: true`
- Always `ChangeDetectionStrategy.OnPush`
- No store access in shared components — use inputs/outputs
- Keep templates under 100 lines; extract sub-components otherwise

### Styles
- Tailwind utility classes in templates
- Custom CSS only in `styles.css` or component `styleUrl`
- Use CSS custom properties from `styles.css` (`var(--color-primary)`)
- No `!important`

### Services
- Singleton services belong in `core/services/`
- Feature services belong in `features/my-feature/services/`
- Never provide a singleton service inside a component

### Imports
- Use path aliases: `@app/core`, `@app/shared/...`, `@app/features/...`
- Never use deep relative paths across module boundaries

---

## Pull Request Checklist

- [ ] Branch name follows convention
- [ ] Commits follow Conventional Commits
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm run build` succeeds
- [ ] New components have OnPush + standalone
- [ ] New shared components documented in COMPONENTS.md
- [ ] New routes documented in ROUTES.md
- [ ] CHANGELOG.md updated under [Unreleased]

---

## Code Review Standards

Reviewers check for:
- Correct import paths (`@app/*` not relative `../../`)
- No accidental singleton re-provision
- No `any` types
- Accessibility (alt text, ARIA, keyboard nav)
- Lazy loading used for new feature components
- No console.log left in production code
