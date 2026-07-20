# API Design
## HR Analytics Platform — REST · Versioning · Response Envelope · Swagger

---

## REST Conventions

| Operation | Method | Path | Status |
|-----------|--------|------|--------|
| List (paged) | GET | `/api/v1/employees` | 200 |
| Get one | GET | `/api/v1/employees/{id}` | 200 / 404 |
| Create | POST | `/api/v1/employees` | 201 |
| Update (full) | PUT | `/api/v1/employees/{id}` | 200 |
| Update (partial) | PATCH | `/api/v1/employees/{id}` | 200 |
| Delete (soft) | DELETE | `/api/v1/employees/{id}` | 204 |
| Feature action | POST | `/api/v1/payroll/run` | 200 |
| Export | GET | `/api/v1/employees/export?format=xlsx` | 200 |

---

## Versioning

```csharp
// API/Extensions/ServiceCollectionExtensions.cs
services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version"),
        new QueryStringApiVersionReader("api-version")
    );
});
```

```csharp
// Controller
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/employees")]
public sealed class EmployeesController : ControllerBase { }
```

---

## Response Envelope

Every response is wrapped in a consistent envelope:

```json
// Success — 200
{
  "success": true,
  "data": { "id": "abc-123", "fullName": "Ali Hassan", ... },
  "direction": "ltr"
}

// Created — 201
{
  "success": true,
  "data": { "id": "new-guid" }
}

// Error — 422 Validation
{
  "type": "ValidationError",
  "title": "One or more validation errors occurred.",
  "status": 422,
  "errors": {
    "Email": ["Invalid email format."],
    "BaseSalary": ["Must be greater than zero."]
  },
  "traceId": "0HN5T4..."
}

// Error — 404
{
  "type": "NotFound",
  "title": "Employee not found.",
  "status": 404,
  "traceId": "0HN5T4..."
}
```

---

## Controller Pattern

```csharp
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/employees")]
[Authorize(Policy = "HRManagerOrAbove")]
[Produces("application/json")]
public sealed class EmployeesController : ControllerBase
{
    private readonly ISender _mediator;

    public EmployeesController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<EmployeeDto>>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetEmployeesQuery query,
        CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);
        return result.IsSuccess
            ? Ok(ApiResponse.Success(result.Value))
            : BadRequest(ApiResponse.Failure(result.Error));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<EmployeeDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetEmployeeByIdQuery(id), ct);
        return result.IsSuccess ? Ok(ApiResponse.Success(result.Value)) : NotFound();
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), 201)]
    [ProducesResponseType(typeof(ProblemDetails), 422)]
    public async Task<IActionResult> Create(
        [FromBody] CreateEmployeeCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        if (!result.IsSuccess) return UnprocessableEntity(result.Error);
        return CreatedAtAction(nameof(GetById),
            new { id = result.Value },
            ApiResponse.Success(result.Value));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeleteEmployeeCommand(id), ct);
        return result.IsSuccess ? NoContent() : NotFound();
    }
}
```

---

## Paged Query Binding

```csharp
// Query parameters bind automatically from URL
// GET /api/v1/employees?searchTerm=ahmed&department=Engineering&page=2&pageSize=10

public sealed record GetEmployeesQuery(
    [FromQuery] string? SearchTerm,
    [FromQuery] string? Department,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 25
) : IQuery<PagedResult<EmployeeDto>>;
```

---

## OpenAPI / Swagger Setup

```csharp
// API/Extensions/ServiceCollectionExtensions.cs
services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title   = "HR Analytics Platform API",
        Version = "v1",
        Description = "Enterprise HR management REST API — ASP.NET Core 9"
    });

    // JWT auth in Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type   = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                    { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // Include XML doc comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFile));
});
```

---

## CORS

```csharp
services.AddCors(options =>
{
    options.AddPolicy("HRPlatformPolicy", policy =>
    {
        policy
            .WithOrigins(
                "https://hrplatform.com",
                "https://staging.hrplatform.com",
                "http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("X-Correlation-Id", "X-Api-Version");
    });
});
```

---

## Authentication — JWT

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = config["Jwt:Issuer"],
            ValidAudience            = config["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Secret"]!)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
```
