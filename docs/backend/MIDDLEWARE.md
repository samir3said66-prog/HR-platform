# Middleware Pipeline
## HR Analytics Platform — ASP.NET Core 9

---

## Middleware Order

Order matters — registered in this exact sequence in `Program.cs`:

```csharp
// API/Extensions/WebApplicationExtensions.cs
public static WebApplication UseApiMiddleware(this WebApplication app)
{
    // 1. Exception handler — must be first to catch all errors
    app.UseMiddleware<ExceptionHandlerMiddleware>();

    // 2. Correlation ID — attach before any logging
    app.UseMiddleware<CorrelationIdMiddleware>();

    // 3. Request logging — after correlation ID so logs include it
    app.UseMiddleware<RequestLoggingMiddleware>();

    // 4. HTTPS redirect
    app.UseHttpsRedirection();

    // 5. Request localization — before auth, so error messages are localized
    app.UseRequestLocalization();

    // 6. CORS
    app.UseCors("HRPlatformPolicy");

    // 7. Rate limiting
    app.UseRateLimiter();

    // 8. Authentication + Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // 9. Swagger (development only)
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    return app;
}
```

---

## 1 — Exception Handler Middleware

Catches all unhandled exceptions and returns consistent JSON error responses. No try-catch in controllers.

```csharp
// API/Middleware/ExceptionHandlerMiddleware.cs
public sealed class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (status, type, detail) = ex switch
        {
            ValidationException ve  => (422, "ValidationError", ve.Message),
            NotFoundException       => (404, "NotFound",        ex.Message),
            ForbiddenException      => (403, "Forbidden",       ex.Message),
            ConflictException       => (409, "Conflict",        ex.Message),
            UnauthorizedException   => (401, "Unauthorized",    ex.Message),
            _                       => (500, "InternalError",   "An unexpected error occurred.")
        };

        _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);

        var response = new ProblemDetails
        {
            Type    = type,
            Title   = detail,
            Status  = status,
            Detail  = ex is ValidationException ve2 ? null : ex.Message,
            Extensions = {
                ["traceId"] = context.TraceIdentifier,
                ["errors"]  = ex is ValidationException ve3 ? ve3.Errors : null
            }
        };

        context.Response.StatusCode  = status;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(response);
    }
}
```

---

## 2 — Correlation ID Middleware

Attaches a unique ID to every request. Included in all logs and error responses for tracing.

```csharp
// API/Middleware/CorrelationIdMiddleware.cs
public sealed class CorrelationIdMiddleware
{
    private const string Header = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[Header].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        context.Items[Header]         = correlationId;
        context.Response.Headers[Header] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

---

## 3 — Request Logging Middleware

```csharp
// API/Middleware/RequestLoggingMiddleware.cs
public sealed class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();

        await _next(context);

        sw.Stop();

        var level = context.Response.StatusCode >= 500
            ? LogLevel.Error
            : context.Response.StatusCode >= 400
                ? LogLevel.Warning
                : LogLevel.Information;

        _logger.Log(level,
            "HTTP {Method} {Path} responded {Status} in {ElapsedMs}ms",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            sw.ElapsedMilliseconds);
    }
}
```

---

## 4 — Rate Limiting (AspNetCoreRateLimit)

```csharp
// API/Extensions/ServiceCollectionExtensions.cs
services.AddRateLimiter(options =>
{
    // Global policy: 100 req/min per IP
    options.AddFixedWindowLimiter("global", cfg =>
    {
        cfg.Window           = TimeSpan.FromMinutes(1);
        cfg.PermitLimit      = 100;
        cfg.QueueLimit       = 0;
        cfg.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    // Auth endpoints: 10 req/min (brute force protection)
    options.AddFixedWindowLimiter("auth", cfg =>
    {
        cfg.Window      = TimeSpan.FromMinutes(1);
        cfg.PermitLimit = 10;
    });

    options.RejectionStatusCode = 429;
    options.OnRejected = async (ctx, ct) =>
    {
        ctx.HttpContext.Response.Headers["Retry-After"] = "60";
        await ctx.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Too many requests. Try again in 60 seconds." }, ct);
    };
});

// Apply per controller/endpoint
[EnableRateLimiting("auth")]
[HttpPost("login")]
public async Task<IActionResult> Login(...) { }
```

---

## 5 — RBAC Authorization Policy

```csharp
// API/Extensions/ServiceCollectionExtensions.cs
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly",
        p => p.RequireRole("Admin"));

    options.AddPolicy("HRManagerOrAbove",
        p => p.RequireRole("Admin", "HRManager"));

    options.AddPolicy("FinanceAccess",
        p => p.RequireRole("Admin", "HRManager", "FinanceManager"));

    options.AddPolicy("EmployeeSelf",
        p => p.RequireAuthenticatedUser()
              .AddRequirements(new SameEmployeeRequirement()));
});

// Usage on controllers
[Authorize(Policy = "HRManagerOrAbove")]
[HttpGet]
public async Task<IActionResult> GetEmployees(...)

[Authorize(Policy = "EmployeeSelf")]
[HttpGet("{id}/payslip")]
public async Task<IActionResult> GetPayslip(Guid id, ...)
```

---

## 6 — ICurrentUser Service

```csharp
// Infrastructure/Services/CurrentUserService.cs
public sealed class CurrentUserService : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor)
        => _accessor = accessor;

    public string? UserId =>
        _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? Email =>
        _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

    public IEnumerable<string> Roles =>
        _accessor.HttpContext?.User.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value) ?? [];

    public bool IsInRole(string role) => Roles.Contains(role);
    public bool IsAuthenticated =>
        _accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
```
