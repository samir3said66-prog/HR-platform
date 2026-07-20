# Backend Testing Guide
## HR Analytics Platform — API, Integration & Contract Tests

> **Not covered here:** Frontend unit tests → `docs/frontend/TESTING.md`
> Security audit results → `docs/backend/SECURITY_COMPLETE.md`
> Load/stress testing → `docs/testing/PERFORMANCE_TESTING.md`

---

## Tools

| Purpose | Tool |
|---------|------|
| Unit tests | Jest / Vitest |
| API integration | Supertest |
| HTTP client testing | Postman / Newman |
| Contract testing | Pact |
| Database testing | testcontainers (PostgreSQL in Docker) |
| Mocking | Jest mocks / MSW |

---

## Unit Tests — Services

Test business logic in isolation. Mock all I/O (database, HTTP, file system).

```typescript
// payroll.service.spec.ts
describe('PayrollService.calculateNetPay()', () => {

  it('deducts social insurance for Egyptian employees', () => {
    const result = payrollService.calculateNetPay({
      baseSalary: 10000,
      country: 'EG',
      overtimeHours: 0,
      absenceDays: 0,
    });
    // Egypt NOSI = 11% employee contribution
    expect(result.socialInsurance).toBe(1100);
    expect(result.netPay).toBe(8900);
  });

  it('applies zero income tax for UAE employees', () => {
    const result = payrollService.calculateNetPay({
      baseSalary: 20000,
      country: 'AE',
      overtimeHours: 5,
      absenceDays: 0,
    });
    expect(result.incomeTax).toBe(0);
  });

  it('deducts absence days proportionally', () => {
    const result = payrollService.calculateNetPay({
      baseSalary: 6000,    // 200/day (30-day month)
      country: 'EG',
      overtimeHours: 0,
      absenceDays: 3,
    });
    expect(result.absenceDeduction).toBe(600);
  });
});
```

---

## Unit Tests — Auth Middleware

```typescript
// auth.middleware.spec.ts
describe('authMiddleware', () => {

  it('passes valid JWT to next()', () => {
    const token = jwt.sign({ userId: '1', roles: ['admin'] }, SECRET);
    const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user.roles).toContain('admin');
  });

  it('returns 401 for expired token', () => {
    const token = jwt.sign({ userId: '1' }, SECRET, { expiresIn: '-1s' });
    const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when Authorization header is missing', () => {
    const req = mockRequest({ headers: {} });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

---

## API Integration Tests — Supertest

Test full HTTP request → controller → service → database (using test DB).

```typescript
// employees.api.spec.ts
describe('GET /api/employees', () => {

  beforeAll(async () => {
    await seedTestEmployees(10);
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  it('returns 200 with paginated list for HR manager', async () => {
    const token = await getTestToken('hr_manager');
    const res = await request(app)
      .get('/api/employees?page=1&pageSize=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.total).toBe(10);
    expect(res.body.page).toBe(1);
  });

  it('returns 403 for employee role', async () => {
    const token = await getTestToken('employee');
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/employees', () => {

  it('creates employee and returns 201', async () => {
    const token = await getTestToken('hr_manager');
    const payload = { name: 'Jane Doe', email: 'jane@co.com', department: 'Engineering' };
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.email).toBe('jane@co.com');
  });

  it('returns 422 for missing required fields', async () => {
    const token = await getTestToken('hr_manager');
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Email' });
    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });
});
```

---

## Database Integration — Testcontainers

Run real PostgreSQL in Docker during integration tests:

```typescript
// setup/db.setup.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('hr_test')
    .start();

  process.env['DATABASE_URL'] = container.getConnectionUri();
  await runMigrations();
}, 60_000); // allow up to 60s for container start

afterAll(async () => {
  await container.stop();
});
```

---

## Contract Testing — Pact

Ensures frontend (consumer) and backend (provider) agree on API shape.

```typescript
// Frontend consumer defines contract
const interaction = {
  uponReceiving: 'a request for employees list',
  withRequest: { method: 'GET', path: '/api/employees' },
  willRespondWith: {
    status: 200,
    body: {
      data: eachLike({ id: string(), name: string(), department: string() }),
      total: integer(),
      page: integer(),
    },
  },
};
```

Backend publishes contract verification results to Pact Broker.
Frontend CI fails if backend breaks a consumer contract.

---

## Postman / Newman Collection

A Postman collection covers all 40+ API endpoints.

```bash
# Run via Newman in CI
npx newman run docs/testing/postman/hr-platform.postman_collection.json \
  --environment docs/testing/postman/staging.postman_environment.json \
  --reporters cli,junit \
  --reporter-junit-export results/api-test-results.xml
```

Collection covers:
- Auth: login, refresh, logout
- Employees: CRUD + search + export
- Attendance: check-in, check-out, history
- Payroll: calculate, payslip, export
- Analytics: reports, filters
- Admin: user management, roles

---

## Coverage Targets

| Layer | Target |
|-------|--------|
| Service / business logic | 85% |
| API route handlers | 80% |
| Auth middleware | 90% |
| Validation schemas | 90% |
| Database repositories | 70% |

```bash
# Run with coverage
npm run test:coverage
# Report output: coverage/lcov-report/index.html
```

---

## Running All Backend Tests

```bash
npm run test                 # unit + integration
npm run test:unit            # unit only (fast, no Docker)
npm run test:integration     # requires Docker for testcontainers
npm run test:coverage        # coverage report
npm run test:api             # Newman API collection
```
