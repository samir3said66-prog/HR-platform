# Database Design
## HR Analytics Platform — PostgreSQL · Schema · Indexes · Conventions

---

## Connection String

```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hrplatform;Username=hrplatform;Password=YOUR_PASSWORD;Pooling=true;MinPoolSize=5;MaxPoolSize=100;CommandTimeout=30;"
  }
}

// appsettings.Production.json — injected by CI, never committed
{
  "ConnectionStrings": {
    "DefaultConnection": "#{DB_CONNECTION_STRING}#"
  }
}
```

---

## Schema Overview

```sql
-- All tables in lowercase snake_case (PostgreSQL convention)
-- All primary keys: UUID (guid) — avoids sequential int exposure

employees
  id              UUID PK DEFAULT gen_random_uuid()
  first_name      VARCHAR(100) NOT NULL
  last_name       VARCHAR(100) NOT NULL
  email           VARCHAR(254) NOT NULL UNIQUE
  department_id   UUID FK → departments.id
  base_salary     NUMERIC(18,4) NOT NULL
  country         CHAR(2) NOT NULL          -- ISO: EG, SA, AE, IQ, KW
  status          VARCHAR(20) NOT NULL      -- Active, Inactive, OnLeave
  hire_date       DATE NOT NULL
  is_deleted      BOOLEAN NOT NULL DEFAULT false
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at      TIMESTAMPTZ
  created_by      VARCHAR(100)
  updated_by      VARCHAR(100)

departments
  id              UUID PK
  name            VARCHAR(100) NOT NULL UNIQUE
  manager_id      UUID FK → employees.id (nullable)
  created_at      TIMESTAMPTZ NOT NULL

attendance_records
  id              UUID PK
  employee_id     UUID FK → employees.id NOT NULL
  check_in        TIMESTAMPTZ NOT NULL
  check_out       TIMESTAMPTZ
  date            DATE NOT NULL
  type            VARCHAR(20)  -- Present, Absent, Late, Remote
  override_reason TEXT
  created_at      TIMESTAMPTZ NOT NULL

payroll_records
  id              UUID PK
  employee_id     UUID FK → employees.id NOT NULL
  period          VARCHAR(7) NOT NULL    -- 'YYYY-MM'
  gross_pay       NUMERIC(18,4) NOT NULL
  deductions      NUMERIC(18,4) NOT NULL
  net_pay         NUMERIC(18,4) NOT NULL
  status          VARCHAR(20) NOT NULL   -- Draft, Processed, Paid
  processed_at    TIMESTAMPTZ
  is_deleted      BOOLEAN DEFAULT false
  UNIQUE(employee_id, period)

performance_reviews
  id              UUID PK
  employee_id     UUID FK → employees.id
  reviewer_id     UUID FK → employees.id
  period          VARCHAR(7) NOT NULL
  score           NUMERIC(4,2)           -- 0.00–100.00
  status          VARCHAR(20)            -- Draft, Submitted, Approved
  submitted_at    TIMESTAMPTZ

job_postings
  id              UUID PK
  title           VARCHAR(200) NOT NULL
  department_id   UUID FK → departments.id
  status          VARCHAR(20)            -- Open, Closed, OnHold
  posted_at       TIMESTAMPTZ

applicants
  id              UUID PK
  job_posting_id  UUID FK → job_postings.id
  full_name       VARCHAR(200) NOT NULL
  email           VARCHAR(254) NOT NULL
  stage           VARCHAR(30)            -- Applied, Screening, Interview, Offer, Hired, Rejected
  applied_at      TIMESTAMPTZ

audit_logs
  id              UUID PK
  user_id         UUID NOT NULL
  action          VARCHAR(100) NOT NULL
  resource_type   VARCHAR(100) NOT NULL
  resource_id     UUID
  old_values      JSONB
  new_values      JSONB
  ip_address      INET
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## Index Strategy

```sql
-- Employees — most common query patterns
CREATE INDEX ix_employees_email         ON employees(email);
CREATE INDEX ix_employees_department    ON employees(department_id);
CREATE INDEX ix_employees_status        ON employees(status) WHERE is_deleted = false;
CREATE INDEX ix_employees_name_search   ON employees USING gin(
    to_tsvector('english', first_name || ' ' || last_name)
);

-- Attendance — date-range queries (most common)
CREATE INDEX ix_attendance_employee     ON attendance_records(employee_id);
CREATE INDEX ix_attendance_date         ON attendance_records(date DESC);
CREATE INDEX ix_attendance_emp_date     ON attendance_records(employee_id, date DESC);

-- Payroll — period + employee lookups
CREATE UNIQUE INDEX ix_payroll_emp_period ON payroll_records(employee_id, period)
    WHERE is_deleted = false;

-- Audit logs — by user + date
CREATE INDEX ix_audit_user_date         ON audit_logs(user_id, created_at DESC);
CREATE INDEX ix_audit_resource          ON audit_logs(resource_type, resource_id);

-- JSON search on audit log values (advanced queries)
CREATE INDEX ix_audit_new_values        ON audit_logs USING gin(new_values);
```

---

## Naming Conventions

| Object | Convention | Example |
|--------|-----------|---------|
| Tables | `snake_case` plural | `employees`, `attendance_records` |
| Columns | `snake_case` | `first_name`, `created_at` |
| PKs | `id` (UUID) | `id UUID DEFAULT gen_random_uuid()` |
| FKs | `{table_singular}_id` | `employee_id`, `department_id` |
| Indexes | `ix_{table}_{column}` | `ix_employees_email` |
| Unique indexes | `uq_{table}_{column}` | `uq_employees_email` |

EF Core applies these via `UseSnakeCaseNamingConvention()`:

```csharp
options.UseNpgsql(connString)
       .UseSnakeCaseNamingConvention();  // Npgsql.EntityFrameworkCore.PostgreSQL.Design
```

---

## PostgreSQL-Specific Features Used

```csharp
// 1. UUID as PK (built-in gen_random_uuid())
builder.Property(e => e.Id)
    .HasDefaultValueSql("gen_random_uuid()");

// 2. JSONB for audit log values
builder.Property(a => a.NewValues)
    .HasColumnType("jsonb");

// 3. Full-text search on employee names
modelBuilder.Entity<Employee>()
    .HasGeneratedTsVectorColumn(
        e => e.SearchVector,
        "english",
        e => new { e.FirstName, e.LastName, e.Email })
    .HasIndex(e => e.SearchVector)
    .HasMethod("GIN");

// 4. Date-only columns (EF Core 9)
builder.Property(e => e.HireDate).HasColumnType("date");

// 5. Timestamptz (timezone-aware)
builder.Property(e => e.CreatedAt).HasColumnType("timestamptz");
```

---

## Backup Strategy

```bash
# Daily full backup (via cron)
pg_dump hrplatform \
  --format=custom \
  --compress=9 \
  --file=/backups/hrplatform_$(date +%Y%m%d).dump

# Restore
pg_restore \
  --dbname=hrplatform \
  --clean \
  /backups/hrplatform_20260720.dump

# S3 upload
aws s3 cp /backups/hrplatform_$(date +%Y%m%d).dump \
  s3://hrplatform-backups/ \
  --sse AES256
```

Retention: 30 daily backups, 12 monthly backups.
