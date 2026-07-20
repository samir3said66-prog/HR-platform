# Mapster — Auto Mapping
## HR Analytics Platform — TypeAdapterConfig · IRegister · DI

---

## Why Mapster Over AutoMapper

| | Mapster | AutoMapper |
|--|---------|-----------|
| Performance | Faster (source generation option) | Slower (reflection-heavy) |
| Config style | Fluent, per-feature `IRegister` | Global profiles |
| DI integration | `MapsterDI` built-in | Separate setup |
| Null safety | Returns null if source is null | Throws |
| Expression mapping | Supports `ProjectTo` for EF Core | Supported |

---

## Global Configuration

```csharp
// Application/Common/Mappings/MappingConfiguration.cs
public static class MappingConfiguration
{
    public static void Configure(IServiceCollection services)
    {
        var config = TypeAdapterConfig.GlobalSettings;

        // Scan all IRegister implementations in Application assembly
        config.Scan(Assembly.GetExecutingAssembly());

        // Global rules applied to all mappings
        config.Default
            .IgnoreNullValues(false)
            .PreserveReference(false);

        // Register config as singleton
        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();
    }
}

// Application/DependencyInjection.cs
services.AddMapster();   // registers IMapper
MappingConfiguration.Configure(services);
```

---

## IRegister — Per Feature Mapping Profile

Each feature defines its own mappings inside `Features/{Name}/Mappings/`:

```csharp
// Features/Employees/Mappings/EmployeeMappings.cs
public sealed class EmployeeMappings : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Entity → DTO
        config.NewConfig<Employee, EmployeeDto>()
            .Map(dest => dest.FullName,
                src => $"{src.FirstName} {src.LastName}")
            .Map(dest => dest.DepartmentName,
                src => src.Department.Name)
            .Map(dest => dest.StatusLabel,
                src => src.Status.ToString());

        // CreateEmployeeCommand → Employee (used in handler)
        config.NewConfig<CreateEmployeeCommand, Employee>()
            .IgnoreNonMapped(true)
            .ConstructUsing(cmd => Employee.Create(
                cmd.FirstName, cmd.LastName, cmd.Email,
                cmd.Department, cmd.BaseSalary, cmd.Country));

        // UpdateEmployeeCommand → Employee (partial update)
        config.NewConfig<UpdateEmployeeCommand, Employee>()
            .IgnoreNullValues(true)
            .Map(dest => dest.UpdatedAt, _ => DateTime.UtcNow);
    }
}
```

---

## Using Mapper in Handlers

```csharp
// Option 1 — Inject IMapper (runtime mapping)
internal sealed class GetEmployeesHandler
    : IQueryHandler<GetEmployeesQuery, PagedResult<EmployeeDto>>
{
    private readonly IReadRepository<Employee> _repo;
    private readonly IMapper _mapper;

    public GetEmployeesHandler(
        IReadRepository<Employee> repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<EmployeeDto>>> Handle(
        GetEmployeesQuery query, CancellationToken ct)
    {
        var items = await _repo.ListAsync(
            new EmployeeSearchSpec(query.SearchTerm, query.Department),
            query.Page, query.PageSize, ct);

        var dtos = _mapper.Map<List<EmployeeDto>>(items);

        return Result<PagedResult<EmployeeDto>>.Success(
            new PagedResult<EmployeeDto>(dtos, await _repo.CountAsync(...), query.Page, query.PageSize));
    }
}

// Option 2 — Extension method (no IMapper injection needed)
var dto = employee.Adapt<EmployeeDto>();
var list = employees.Adapt<List<EmployeeDto>>();
```

---

## EF Core ProjectTo — Query-Level Projection

```csharp
// Avoids loading full entities when only a DTO is needed
// Translates mapping to SQL — fetches only mapped columns

var dtos = await _context.Employees
    .AsNoTracking()
    .Where(e => e.IsActive)
    .ProjectToType<EmployeeDto>()   // Mapster EF extension
    .ToListAsync(ct);
```

Configure projection mapping:

```csharp
config.NewConfig<Employee, EmployeeSummaryDto>()
    .Map(dest => dest.FullName, src => src.FirstName + " " + src.LastName)
    .Map(dest => dest.Department, src => src.Department.Name);
// EF Core will generate: SELECT FirstName || ' ' || LastName AS FullName, ...
```

---

## Nested and Collection Mappings

```csharp
// Mapster handles nested objects and collections automatically
config.NewConfig<Employee, EmployeeDetailDto>()
    .Map(dest => dest.AttendanceSummary,
         src => src.AttendanceRecords
             .Where(a => a.Month == DateTime.UtcNow.Month)
             .Adapt<List<AttendanceSummaryDto>>());
```

---

## Common DTO Base Types

```csharp
// Application/Common/Models/PagedResult.cs
public sealed class PagedResult<T>
{
    public List<T> Items { get; }
    public int TotalCount { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public PagedResult(List<T> items, int total, int page, int pageSize)
    {
        Items = items; TotalCount = total; Page = page; PageSize = pageSize;
    }
}
```

---

## Validation: Ensure All Mappings Are Valid at Startup

```csharp
// Program.cs — catches unmapped required members at startup, not at runtime
var config = app.Services.GetRequiredService<TypeAdapterConfig>();
config.Compile();  // throws if any mapping is misconfigured
```
