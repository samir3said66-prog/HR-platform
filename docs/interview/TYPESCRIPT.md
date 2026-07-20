# TypeScript Interview Questions
## HR Analytics Platform — Strict Mode Focus

---

## Strict Mode

**Q: This project uses TypeScript strict mode. What does that enable?**

`tsconfig.json` has `"strict": true` which activates:

| Flag | Effect |
|------|--------|
| `strictNullChecks` | `null`/`undefined` are not assignable to other types |
| `strictFunctionTypes` | Stricter function parameter checking |
| `noImplicitAny` | Variables must have explicit types |
| `noImplicitReturns` | All code paths must return a value |
| `noFallthroughCasesInSwitch` | Switch cases must break/return |
| `strictPropertyInitialization` | Class properties must be set in constructor |

Plus additional flags in this project:
- `noImplicitOverride` — must use `override` keyword when overriding
- `noPropertyAccessFromIndexSignature` — must use bracket notation for index signatures

---

## Generics

**Q: Where are generics used in the shared component library?**

```typescript
// data-table.component.ts
@Component({ ... })
export class DataTableComponent<T extends Record<string, unknown>> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Output() rowClick = new EventEmitter<T>();
}

// table.model.ts
interface TableColumn<T> {
  key: keyof T;           // only valid keys of T
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => string;
}
```

Type safety: `columns[0].key` can only be a real property of `T` — typos are caught at compile time.

---

## Utility Types

**Q: Name TypeScript utility types used in this codebase.**

```typescript
// Partial — optional update payload
type EmployeeUpdate = Partial<Employee>;
function updateEmployee(id: string, changes: Partial<Employee>) { ... }

// Required — all fields mandatory for creation
type CreateEmployee = Required<Pick<Employee, 'name' | 'email' | 'department'>>;

// Readonly — store state is immutable
type EmployeesState = Readonly<{
  employees: Employee[];
  loading: boolean;
}>;

// Record — role-to-routes mapping
type RoleRoutes = Record<UserRole, string[]>;

// Extract — filter union types
type WritableAction = Extract<EmployeeAction, { type: 'update' | 'create' }>;

// ReturnType — infer selector output type
type SelectedEmployees = ReturnType<typeof selectAllEmployees>;
```

---

## Discriminated Unions

**Q: How are discriminated unions used in action/state modeling?**

```typescript
// Request state pattern
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

// Type-narrowing in template/component
const state: RequestState<Employee[]> = ...;

if (state.status === 'success') {
  // TypeScript knows state.data exists here
  console.log(state.data.length);
}
```

---

## Interfaces vs Types

**Q: When do you use `interface` vs `type` in this project?**

| Use case | Choice | Reason |
|----------|--------|--------|
| Data models (Employee, User) | `interface` | Declaration merging if needed, more readable for objects |
| Union types | `type` | Interfaces can't express unions |
| Function signatures | `type` | Cleaner syntax |
| Component input shapes | `interface` | Extendable |
| Store state | `interface` | Entity adapter requires it |
| API response shapes | `interface` | Maps to backend contract |

---

## Module Augmentation

**Q: The project has a custom type declaration. What is it for?**

```typescript
// src/types/arabic-persian-reshaper.d.ts
declare module 'arabic-persian-reshaper' {
  export function reshape(text: string): string;
}
```

The `arabic-persian-reshaper` npm package has no TypeScript types. This file tells TypeScript the shape of its exports so it can be imported with type safety.

---

## Type Guards

**Q: Write a type guard for a User object.**

```typescript
interface AdminUser { role: 'admin'; permissions: string[] }
interface EmployeeUser { role: 'employee'; departmentId: string }
type User = AdminUser | EmployeeUser;

function isAdmin(user: User): user is AdminUser {
  return user.role === 'admin';
}

// Usage in RBAC guard
if (isAdmin(currentUser)) {
  // TypeScript narrows to AdminUser — permissions is available
  return currentUser.permissions.includes(requiredPermission);
}
```

---

## Common TypeScript Pitfalls Fixed in This Project

| Problem | Solution used |
|---------|--------------|
| `Object is possibly null` | Optional chaining `user?.name`, nullish coalescing `user ?? 'Guest'` |
| `any` type leaking | `unknown` + type narrowing, no `as any` |
| Implicit `this` in callbacks | Arrow functions in class methods |
| Enum pitfalls | `const enum` for string unions, or string literal unions |
| Non-null assertion overuse | Proper initialization in constructor or `!` only where truly safe |
