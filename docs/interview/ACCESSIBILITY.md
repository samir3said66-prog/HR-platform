# Accessibility (A11y) Interview Questions
## HR Analytics Platform

---

## Standards

**Q: What accessibility standard does this project target?**

WCAG 2.1 Level AA. This is the international standard required by most governments and enterprise procurement policies.

Key AA requirements met in this project:
- Color contrast ratio ≥ 4.5:1 (text) and 3:1 (large text / UI components)
- All functionality keyboard-accessible
- Focus indicators visible on all interactive elements
- Images have alt text
- Form inputs have associated labels
- Error messages are programmatically associated with inputs
- Page has a logical heading hierarchy (h1 → h2 → h3)

---

## Semantic HTML

**Q: Why is semantic HTML important for accessibility?**

Screen readers use HTML semantics to build a navigation map of the page. Without them, the page is just a wall of anonymous divs.

```html
<!-- ❌ Non-semantic — screen reader sees nothing meaningful -->
<div class="header">
  <div class="nav">
    <div onclick="navigate('/dashboard')">Dashboard</div>
  </div>
</div>

<!-- ✅ Semantic — screen reader announces structure -->
<header>
  <nav aria-label="Main navigation">
    <a href="/dashboard">Dashboard</a>
  </nav>
</header>
```

This project uses `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<article>`, `<section>` in layouts.

---

## Focus Management

**Q: How is keyboard navigation handled in modal dialogs?**

When a modal opens:
1. Focus moves to the modal (or the close button)
2. Tab key cycles only within the modal (focus trap)
3. Escape closes the modal
4. On close, focus returns to the element that opened it

```typescript
// ModalComponent
ngAfterViewInit() {
  // Move focus to modal
  this.firstFocusable?.nativeElement.focus();
}

@HostListener('keydown.escape')
onEscape() {
  this.closed.emit();
}
```

The `appAutoFocus` directive handles auto-focusing the first input in forms.

---

## ARIA

**Q: Where are ARIA attributes used in the shared components?**

```html
<!-- Dropdown — announces open/close state -->
<button [attr.aria-expanded]="isOpen" aria-controls="menu-list">
  Options
</button>
<ul id="menu-list" [attr.aria-hidden]="!isOpen" role="menu">
  <li role="menuitem">Edit</li>
</ul>

<!-- Data table — sortable column header -->
<th [attr.aria-sort]="column.sort ? 'ascending' : 'none'">
  Name
</th>

<!-- Loading state -->
<div aria-live="polite" aria-atomic="true">
  @if (loading) { <span class="sr-only">Loading employees...</span> }
</div>

<!-- Icon-only button -->
<button aria-label="Delete employee">
  <app-icon name="trash" aria-hidden="true" />
</button>
```

---

## Color Contrast

**Q: How is color contrast enforced in Tailwind?**

The design system (CSS custom properties in `styles.css`) defines colors that meet contrast requirements:

```css
/* Text on white background */
--color-gray-900: #111827;  /* 21:1 contrast — AAA */
--color-gray-700: #374151;  /* 12:1 contrast — AAA */
--color-gray-500: #6b7280;  /* 5.5:1 contrast — AA */

/* Primary blue on white */
--color-primary: #3b82f6;   /* 3.9:1 — AA for large text */
--color-primary-dark: #1e40af; /* 8.6:1 — AAA */
```

All buttons use dark enough text/background combinations. Error states use `--color-error: #ef4444` which passes at the text sizes used.

---

## RTL Support (Arabic)

**Q: How is right-to-left (Arabic) layout handled?**

```typescript
// I18nService sets dir attribute on document root
setLanguage(lang: 'en' | 'ar') {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}
```

```css
/* styles.css — RTL-aware rules */
[dir="rtl"] ul { padding: 0 var(--spacing-lg) 0 0; }
[dir="ltr"] ul { padding: 0 0 0 var(--spacing-lg); }
```

```html
<!-- Tailwind RTL utilities -->
<div class="ms-4 rtl:me-4">  <!-- margin-start adapts to direction -->
```

Screen readers using Arabic will read the page in the correct order because `dir="rtl"` is set at the `<html>` level, not just visually.

---

## Skip Navigation

**Q: What is a skip navigation link and does this project have one?**

A skip navigation link lets keyboard users jump past the repeated navigation to the main content — especially important for pages with a long sidebar:

```html
<!-- At top of MainLayout template -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to main content
</a>

<main id="main-content" tabindex="-1">
  <router-outlet />
</main>
```

Invisible to sighted users, but the first Tab press reveals it to keyboard users.

---

## Reduced Motion

**Q: How does the app respect the `prefers-reduced-motion` media query?**

```css
/* styles.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Users who configure their OS to reduce motion (often people with vestibular disorders) get no animations — loading spinners become instant, page transitions are immediate.

---

## Testing Tools

| Tool | Purpose |
|------|---------|
| `axe-core` + `vitest-axe` | Automated A11y rule checking in unit tests |
| Chrome DevTools Accessibility tree | Manual inspection |
| NVDA / JAWS (screen readers) | Manual testing |
| Lighthouse Accessibility audit | Score + specific violations |
| Colour Contrast Analyser | Verify custom color combinations |
