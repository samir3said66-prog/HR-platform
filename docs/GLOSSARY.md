# Glossary
## HR Analytics Platform — Domain & Technical Terms

---

## HR Domain Terms

| Term | Definition |
|------|-----------|
| **Attendance** | Record of employee presence, absence, check-in and check-out times |
| **Base Salary** | Fixed monthly compensation before overtime, bonuses, or deductions |
| **Biometric** | Authentication using physical characteristics — fingerprint or face recognition |
| **Branch** | A physical office location. Platform supports multi-branch, multi-country |
| **Buddy Punching** | Fraudulent attendance — one employee clocking in for another. Prevented by face recognition |
| **Check-in / Check-out** | The act of recording arrival and departure times |
| **Compliance** | Adherence to labor laws, tax regulations, and data protection rules |
| **Deduction** | Amount subtracted from gross salary — tax, social insurance, absence, loan |
| **Department** | Organizational unit (Engineering, HR, Finance, Sales, Operations) |
| **GOSI** | General Organization for Social Insurance — Saudi Arabia social insurance body |
| **GPS Tracking** | Location verification at check-in to confirm employee is at work site |
| **Gross Pay** | Total earnings before deductions — base salary + overtime + bonuses |
| **Headcount** | Total number of active employees at a point in time |
| **Hire Date** | Date an employee officially joined the company |
| **HRMS** | Human Resource Management System |
| **Hijri Calendar** | Islamic lunar calendar used in Saudi Arabia for official dates |
| **KPI** | Key Performance Indicator — measurable metric for a goal |
| **Leave** | Approved absence — annual, sick, maternity, unpaid |
| **Net Pay** | Amount paid to employee after all deductions |
| **NOSI** | National Organization for Social Insurance — Egypt |
| **OKR** | Objectives and Key Results — goal-setting framework |
| **Offboarding** | Process of managing an employee's departure |
| **Onboarding** | Process of integrating a new employee |
| **Overtime** | Hours worked beyond contracted hours, paid at a premium rate |
| **Payroll** | Process of calculating and distributing employee salaries |
| **Payslip** | Document showing salary breakdown for a pay period |
| **Performance Review** | Formal evaluation of employee work performance against targets |
| **Pipeline** | Recruitment pipeline — stages an applicant moves through |
| **RBAC** | Role-Based Access Control — permissions granted by assigned role |
| **Recruitment** | Process of sourcing, screening, and hiring new employees |
| **RTL** | Right-to-Left text direction — used for Arabic |
| **Shift** | Defined working hours pattern (morning, afternoon, night, flexible) |
| **Social Insurance** | Government-mandated employee and employer contributions |
| **Termination** | End of employment relationship |
| **Timesheet** | Record of hours worked in a given period |
| **Turnover** | Rate at which employees leave and are replaced |
| **WPS** | Wage Protection System — UAE mandatory payroll compliance scheme |

---

## Technical Terms

| Term | Definition |
|------|-----------|
| **Adapter Pattern** | Wraps incompatible interfaces — used in Mapster `IRegister` |
| **ASP.NET Core 9** | Microsoft's cross-platform web framework — the backend runtime |
| **Behavior (Pipeline)** | MediatR middleware that wraps command/query execution |
| **CQRS** | Command Query Responsibility Segregation — separates writes from reads |
| **Clean Architecture** | Layered architecture where inner layers have no knowledge of outer layers |
| **Command** | MediatR request that changes state — implements `ICommand` |
| **CSP** | Content Security Policy — HTTP header that restricts resource loading |
| **DbContext** | EF Core entry point for all database operations |
| **DTO** | Data Transfer Object — shape of data sent over the API |
| **EF Core** | Entity Framework Core — ORM for .NET, maps C# objects to database tables |
| **Entity** | Domain object with an identity that persists in the database |
| **Fluent API** | EF Core configuration style using method chaining instead of data annotations |
| **Fluent Validation** | .NET library for strongly-typed validation rules with a fluent API |
| **Handler** | Class that processes a single MediatR command or query |
| **i18n** | Internationalization — building software to support multiple languages |
| **IUnitOfWork** | Interface that centralizes `SaveAsync()` — one save per command via pipeline |
| **JWT** | JSON Web Token — compact, signed token used for authentication |
| **k6** | Open-source load testing tool — tests written in JavaScript |
| **Lazy Loading** | Loading a module or component only when it's needed (Angular routes) |
| **Mapster** | High-performance .NET object-to-object mapping library |
| **MediatR** | In-process mediator library implementing CQRS in .NET |
| **Migration** | EF Core-generated script that applies schema changes to the database |
| **NgRx** | Redux-pattern state management for Angular — store, effects, selectors |
| **OnPush** | Angular change detection strategy that skips checks unless inputs change |
| **Options Pattern** | ASP.NET Core pattern for binding and validating configuration sections |
| **Playwright** | End-to-end browser testing framework |
| **PostgreSQL** | Open-source relational database — used as the platform's primary store |
| **Query** | MediatR request that reads state — implements `IQuery<T>` |
| **Repository Pattern** | Abstraction layer between domain and data access |
| **Result<T>** | Typed return type for commands/queries — `Success(value)` or `Failure(error)` |
| **Seeder** | Code that inserts initial or test data into the database |
| **Specification** | Encapsulates a query filter as a reusable object |
| **Standalone Component** | Angular component that declares its own imports without an NgModule |
| **UoW** | Unit of Work — tracks changes and commits them in a single transaction |
| **Value Object** | Immutable domain object defined by its value, not identity (Money, Address) |
| **Vertical Slice** | Organizing code by feature (all layers for one feature together) |
| **Vitest** | Fast unit test runner for Vite-based projects |
| **WebSocket** | Protocol for persistent two-way communication — used for real-time updates |
| **WOFF2** | Web font format — best compression, used for all fonts in the project |

---

## RBAC Roles

| Role | Code | Access Level |
|------|------|-------------|
| Admin | `Admin` | Full access — all features, all data |
| HR Manager | `HRManager` | All HR operations — employees, payroll, attendance, recruitment |
| Finance Manager | `FinanceManager` | Payroll view + export only |
| Recruiter | `Recruiter` | Recruitment pipeline only |
| Manager | `Manager` | Own team's attendance, performance, leave |
| Employee | `Employee` | Own profile, own payslips, own leave requests |
| Analyst | `Analyst` | Read-only analytics and reports |

---

## Country Codes & Currencies

| Country | Code | Currency | Social Insurance | Income Tax |
|---------|------|---------|-----------------|-----------|
| Egypt | `EG` | EGP | NOSI (11% employee) | Sliding scale 0–25% |
| Saudi Arabia | `SA` | SAR | GOSI (9.75% employee) | None |
| UAE | `AE` | AED | GPSSA (5% employee) | None |
| Iraq | `IQ` | IQD | Social Security (5%) | None |
| Kuwait | `KW` | KWD | PIFSS (7.5% employee) | None |

---

## File Format Conventions

| Extension | Format | Used For |
|-----------|--------|---------|
| `.md` | Markdown | All documentation |
| `.json` | JSON | Configuration, API responses, manifest |
| `.svg` | Scalable Vector Graphics | Icons, favicons, OG images |
| `.resx` | .NET XML resource file | Localization strings |
| `.cs` | C# source | Backend code |
| `.ts` | TypeScript | Frontend code |
| `.yaml` / `.yml` | YAML | Docker Compose, Kubernetes, GitHub Actions |
| `.sql` | SQL | Database migration scripts |
