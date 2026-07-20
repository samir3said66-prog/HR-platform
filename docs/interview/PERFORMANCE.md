# Performance Interview Questions
## HR Analytics Platform

---

## Core Web Vitals Targets

| Metric | Target | Technique |
|--------|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s | Preload favicon + fonts, lazy load features |
| FID (First Input Delay) | < 100ms | OnPush, no heavy computation on main thread |
| CLS (Cumulative Layout Shift) | < 0.1 | Reserve space for images/charts with skeletons |
| Lighthouse overall | ≥ 94 | All of the above |

---

## Bundle Size

**Q: How is bundle size kept under 2.5MB total?**

1. **Lazy loading** — 9 features split into 9 separate JS chunks, loaded on demand
2. **Tree shaking** — Angular CLI + esbuild removes unused exports
3. **Standalone components** — no NgModule overhead, cleaner dead code elimination
4. **Tailwind CSS purge** — only used CSS classes included in production build
5. **ECharts selective import** — only import chart types used, not the full library

```typescript
// ❌ Full ECharts (600KB)
import * as echarts from 'echarts';

// ✅ Selective import (only bar + line + tooltip)
import { BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
```

---

## Change Detection Optimization

**Q: What strategies are used to prevent unnecessary re-renders?**

```typescript
// 1. OnPush on every component
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })

// 2. trackBy on *ngFor — prevents DOM re-creation when array changes
<tr *ngFor="let emp of employees; trackBy: trackById">

trackById(index: number, emp: Employee): string {
  return emp.id; // returns stable identity
}

// 3. Memoized selectors — only emit when result actually changes
const selectFilteredEmployees = createSelector(
  selectAll,
  selectFilter,
  (employees, filter) => employees.filter(e => e.dept === filter)
);

// 4. async pipe — automatically unsubscribes, triggers OnPush correctly
employees$ = this.store.select(selectFilteredEmployees);
// template: *ngIf="employees$ | async as employees"
```

---

## Large Dataset Handling

**Q: The platform handles 10,000+ employee records. How is that handled in the UI?**

```
1. Virtual scrolling (CDK VirtualScrollViewport)
   - Only renders visible rows (~20)
   - Remaining rows exist as blank spacer
   - Scroll performance stays at 60fps

2. Pagination at API level
   - Never fetch all 10,000 at once
   - GET /employees?page=1&pageSize=25

3. Server-side filtering and sorting
   - Filter/sort happens on backend
   - Frontend sends filter params, receives pre-filtered page

4. Debounced search (300ms)
   - searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
   - Prevents a store dispatch on every keystroke
```

---

## @defer for Heavy Components

**Q: Which components use @defer in this app and why?**

```html
<!-- Dashboard — charts load after critical KPI cards -->
@defer (on viewport; prefetch on idle) {
  <app-chart [data]="performanceData" />
} @loading {
  <app-loading-skeleton class="h-64" />
}
```

Components deferred:
- ECharts visualizations (heavy, below the fold)
- Data export panel (rarely used)
- Activity feed (not critical on first paint)
- Analytics detailed tables

Result: Time-to-Interactive for dashboard drops from ~3s to ~1.4s because ECharts (250KB) loads after the page is interactive.

---

## Image & Asset Optimization

**Q: How are assets optimized in this project?**

| Asset type | Strategy |
|-----------|---------|
| Icons / logos | SVG — scalable, 1–5KB each |
| Favicon | SVG — single file covers all sizes |
| OG images | SVG — 1200×630 at ~15KB vs 100KB PNG |
| Component icons | Inline SVG or CSS masks — no HTTP request |
| Fonts | WOFF2 (30% smaller than TTF) + `font-display: swap` |

Preloads in `<head>` for critical resources:
```html
<link rel="preload" as="font" href="/assets/fonts/main.woff2" crossorigin />
<link rel="preload" as="image" href="/favicon.svg" />
```

---

## Memory Management

**Q: How do you prevent memory leaks in Angular components?**

```typescript
// Option 1 — async pipe (recommended, auto-unsubscribes)
employees$ = this.store.select(selectEmployees);
// template: {{ employees$ | async }}

// Option 2 — takeUntilDestroyed (Angular 16+)
employees$ = this.store.select(selectEmployees).pipe(
  takeUntilDestroyed(this.destroyRef)
);

// Option 3 — DestroyRef
constructor(private destroyRef: DestroyRef) {
  this.webSocket.messages$
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(msg => this.handleMessage(msg));
}
```

WebSocket subscriptions are particularly important — a leaked WebSocket subscription processes every message even after the component is destroyed.

---

## Performance Audit Results (targets)

| Category | Target Score |
|----------|-------------|
| Performance | ≥ 95 |
| Accessibility | ≥ 98 |
| Best Practices | ≥ 95 |
| SEO | ≥ 90 |
| PWA | ≥ 90 |
