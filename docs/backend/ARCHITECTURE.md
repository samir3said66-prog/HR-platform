# Backend Architecture
## HR Analytics Platform — ASP.NET Core 9

**Stack:** ASP.NET Core 9 · EF Core 9 · PostgreSQL · MediatR · FluentValidation · Mapster

---

## Architectural Style

The backend combines two complementary patterns:

| Pattern | Applied To | Benefit |
|---------|-----------|---------|
| **Clean Architecture** | Dependency direction between layers | Domain never depends on infrastructure |
| **Vertical Slice Architecture** | Feature organization within the Application layer | Each feature is fully self-contained |

Clean Architecture defines **what** depends on **what**.
Vertical Slice defines **how features are grouped** inside the Application layer.

---

## Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        API Layer                        │
│  Controllers · Minimal APIs · Middleware · Filters      │
│  Program.cs · appsettings.json                          │
└──────────────────────┬──────────────────────────────────┘
                       │  depends on ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │   Common/    │  │         Features/                │ │
│  │  Behaviors   │  │  Employees · Payroll · Attendance │ │
│  │  Interfaces  │  │  Performance · Recruitment …     │ │
│  │  Exceptions  │  │  Each: Commands · Queries ·      │ │
│  │  Base Types  │  │  Validators · Mappings · DTOs    │ │
│  └──────────────┘  └──────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │  depends on ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                         │
│  Entities · Value Objects · Domain Events              │
│  Domain Exceptions · Enums · Constants                 │
│  IRepository<T> · IUnitOfWork (interfaces only)        │
└──────────────────────┬──────────────────────────────────┘
                       │  implemented by ▼
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                     │
│  EF Core DbContext · Repository<T> · UnitOfWork        │
│  PostgreSQL · Migrations · Seeds                       │
│  Email · Storage · External APIs                       │
└─────────────────────────────────────────────────────────┘
```

**Dependency Rule:** arrows point inward only. Domain knows nothing about EF Core, HTTP, or PostgreSQL.

---

## Solution Structure

```
HRPlatform.sln
│
├── src/
│   ├── HRPlatform.API/                      ← Presentation layer
│   │   ├── Controllers/
│   │   │   ├── EmployeesController.cs
│   │   │   ├── AttendanceController.cs
│   │   │   └── ... (one per feature)
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlerMiddleware.cs
│   │   │   ├── RequestLoggingMiddleware.cs
│   │   │   └── CorrelationIdMiddleware.cs
│   │   ├── Filters/
│   │   │   └── ValidationFilter.cs
│   │   ├── Extensions/
│   │   │   ├── ServiceCollectionExtensions.cs
│   │   │   └── WebApplicationExtensions.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── appsettings.Production.json
│   │   └── Program.cs
│   │
│   ├── HRPlatform.Application/              ← Application layer (CQRS + Vertical Slice)
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   │   ├── ValidationBehavior.cs
│   │   │   │   ├── LoggingBehavior.cs
│   │   │   │   ├── TransactionBehavior.cs
│   │   │   │   └── CachingBehavior.cs
│   │   │   ├── Exceptions/
│   │   │   │   ├── NotFoundException.cs
│   │   │   │   ├── ValidationException.cs
│   │   │   │   ├── ForbiddenException.cs
│   │   │   │   └── ConflictException.cs
│   │   │   ├── Interfaces/
│   │   │   │   ├── ICurrentUser.cs
│   │   │   │   └── IDateTime.cs
│   │   │   ├── Models/
│   │   │   │   ├── Result.cs
│   │   │   │   ├── PagedResult.cs
│   │   │   │   └── ApiResponse.cs
│   │   │   └── Mappings/
│   │   │       └── MappingConfiguration.cs
│   │   │
│   │   └── Features/
│   │       ├── Employees/
│   │       │   ├── Commands/
│   │       │   │   ├── CreateEmployee/
│   │       │   │   │   ├── CreateEmployeeCommand.cs
│   │       │   │   │   ├── CreateEmployeeHandler.cs
│   │       │   │   │   └── CreateEmployeeValidator.cs
│   │       │   │   ├── UpdateEmployee/
│   │       │   │   └── DeleteEmployee/
│   │       │   ├── Queries/
│   │       │   │   ├── GetEmployees/
│   │       │   │   │   ├── GetEmployeesQuery.cs
│   │       │   │   │   ├── GetEmployeesHandler.cs
│   │       │   │   │   └── EmployeeDto.cs
│   │       │   │   └── GetEmployeeById/
│   │       │   └── Mappings/
│   │       │       └── EmployeeMappings.cs
│   │       ├── Attendance/
│   │       ├── Payroll/
│   │       ├── Performance/
│   │       ├── Recruitment/
│   │       ├── Analytics/
│   │       ├── Admin/
│   │       └── Settings/
│   │
│   ├── HRPlatform.Domain/                   ← Domain layer (no dependencies)
│   │   ├── Entities/
│   │   │   ├── Common/
│   │   │   │   └── BaseEntity.cs
│   │   │   ├── Employee.cs
│   │   │   ├── Department.cs
│   │   │   ├── AttendanceRecord.cs
│   │   │   ├── PayrollRecord.cs
│   │   │   └── ...
│   │   ├── ValueObjects/
│   │   │   ├── Money.cs
│   │   │   └── Address.cs
│   │   ├── Enums/
│   │   │   ├── EmployeeStatus.cs
│   │   │   └── UserRole.cs
│   │   ├── Events/
│   │   │   └── EmployeeCreatedEvent.cs
│   │   ├── Exceptions/
│   │   │   └── DomainException.cs
│   │   └── Interfaces/
│   │       ├── IRepository.cs
│   │       └── IUnitOfWork.cs
│   │
│   └── HRPlatform.Infrastructure/          ← Infrastructure layer
│       ├── Persistence/
│       │   ├── ApplicationDbContext.cs
│       │   ├── Configurations/
│       │   │   ├── EmployeeConfiguration.cs
│       │   │   └── ...
│       │   ├── Migrations/
│       │   ├── Seeds/
│       │   │   ├── DataSeeder.cs
│       │   │   ├── EmployeeSeeder.cs
│       │   │   └── RoleSeeder.cs
│       │   └── Repositories/
│       │       ├── Repository.cs
│       │       └── UnitOfWork.cs
│       ├── Services/
│       │   ├── CurrentUserService.cs
│       │   └── DateTimeService.cs
│       └── DependencyInjection.cs
│
└── tests/
    ├── HRPlatform.UnitTests/
    ├── HRPlatform.IntegrationTests/
    └── HRPlatform.ArchitectureTests/
```

---

## Vertical Slice — Feature Anatomy

Each feature slice is a **self-contained folder** inside `Application/Features/`. It owns all its CQRS pieces:

```
Features/Employees/
├── Commands/
│   ├── CreateEmployee/
│   │   ├── CreateEmployeeCommand.cs    ← IRequest<Result<Guid>>
│   │   ├── CreateEmployeeHandler.cs   ← IRequestHandler
│   │   └── CreateEmployeeValidator.cs ← AbstractValidator
│   ├── UpdateEmployee/
│   └── DeleteEmployee/
├── Queries/
│   ├── GetEmployees/
│   │   ├── GetEmployeesQuery.cs        ← IRequest<Result<PagedResult<EmployeeDto>>>
│   │   ├── GetEmployeesHandler.cs
│   │   └── EmployeeDto.cs             ← Output shape lives with its query
│   └── GetEmployeeById/
└── Mappings/
    └── EmployeeMappings.cs            ← Mapster IRegister for this feature
```

**Rule:** DTOs live next to the handler that produces them — not in a global `DTOs/` folder.

---

## Dependency Registration

```csharp
// Program.cs — clean startup, each layer registers itself
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddDomainServices()                     // Domain (minimal)
    .AddApplicationServices(builder.Configuration)  // MediatR, Behaviors, FluentValidation, Mapster
    .AddInfrastructureServices(builder.Configuration) // EF Core, Repos, UoW, external
    .AddApiServices(builder.Configuration);  // Controllers, Swagger, Auth, Middleware

var app = builder.Build();

app.UseApiMiddleware();  // ordering: exception → correlation → logging → auth → localization

await app.SeedDatabaseAsync();  // idempotent seeder

app.Run();
```

---

## Key Packages

```xml
<!-- HRPlatform.Application -->
<PackageReference Include="MediatR" Version="12.*" />
<PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.*" />
<PackageReference Include="Mapster" Version="7.*" />
<PackageReference Include="Mapster.DependencyInjection" Version="1.*" />

<!-- HRPlatform.Infrastructure -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.*" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.*" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.*" />

<!-- HRPlatform.API -->
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.*" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.*" />
<PackageReference Include="Serilog.AspNetCore" Version="9.*" />
<PackageReference Include="AspNetCoreRateLimit" Version="5.*" />
```

---

## Principles Enforced

| Principle | How |
|-----------|-----|
| Single Responsibility | Each command/query = one handler, one validator |
| Open/Closed | Add feature = add new folder, never touch existing |
| Dependency Inversion | Domain defines interfaces, Infrastructure implements |
| Separation of Concerns | API = routing, Application = logic, Domain = rules, Infra = data |
| DRY | Generic `Repository<T>`, `IUnitOfWork`, pipeline behaviors |
| No anemic domain | Business rules on entities, not services |
