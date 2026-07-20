# Configuration Guide
## HR Analytics Platform — appsettings · Options Pattern · DI Registration

---

## appsettings.json Structure

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hrplatform;Username=hrplatform;Password=changeme;"
  },

  "Jwt": {
    "Secret":   "REPLACE_WITH_64_CHAR_MIN_RANDOM_STRING",
    "Issuer":   "https://api.hrplatform.com",
    "Audience": "https://hrplatform.com",
    "AccessTokenExpiryMinutes":  60,
    "RefreshTokenExpiryDays":     7
  },

  "Cors": {
    "AllowedOrigins": [
      "https://hrplatform.com",
      "https://staging.hrplatform.com",
      "http://localhost:4200"
    ]
  },

  "Localization": {
    "DefaultCulture": "en",
    "SupportedCultures": ["en", "ar"]
  },

  "RateLimit": {
    "GlobalPermitLimit":    100,
    "GlobalWindowSeconds":   60,
    "AuthPermitLimit":       10,
    "AuthWindowSeconds":     60
  },

  "Cache": {
    "DefaultDurationSeconds": 300,
    "EmployeeListDurationSeconds": 60
  },

  "Email": {
    "SmtpHost":     "smtp.mailgun.org",
    "SmtpPort":      587,
    "FromAddress":  "noreply@hrplatform.com",
    "FromName":     "HR Platform"
  },

  "Storage": {
    "Provider": "S3",
    "BucketName": "hrplatform-files",
    "Region": "us-east-1"
  },

  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.EntityFrameworkCore": "Warning",
        "Microsoft.AspNetCore": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "logs/hrplatform-.log", "rollingInterval": "Day" } }
    ]
  }
}
```

---

## appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hrplatform_dev;Username=hrplatform;Password=hrplatform;"
  },
  "Jwt": {
    "Secret": "dev-only-secret-min-64-chars-not-for-production-use-ever"
  },
  "Serilog": {
    "MinimumLevel": { "Default": "Debug" }
  }
}
```

---

## Options Pattern — Strongly Typed Settings

```csharp
// Application/Common/Options/JwtOptions.cs
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required] public string Secret { get; init; } = string.Empty;
    [Required] public string Issuer { get; init; } = string.Empty;
    [Required] public string Audience { get; init; } = string.Empty;
    [Range(5, 1440)] public int AccessTokenExpiryMinutes { get; init; } = 60;
    [Range(1, 30)]   public int RefreshTokenExpiryDays   { get; init; } = 7;
}

// Application/Common/Options/EmailOptions.cs
public sealed class EmailOptions
{
    public const string SectionName = "Email";
    [Required] public string SmtpHost    { get; init; } = string.Empty;
    [Range(1, 65535)] public int SmtpPort { get; init; } = 587;
    [Required] public string FromAddress { get; init; } = string.Empty;
    public string FromName { get; init; } = "HR Platform";
    public string? SmtpPassword { get; init; }
}
```

---

## Registration with Validation

```csharp
// Infrastructure/DependencyInjection.cs
public static IServiceCollection AddInfrastructureServices(
    this IServiceCollection services,
    IConfiguration config)
{
    // Register + validate all options at startup
    services
        .AddOptions<JwtOptions>()
        .Bind(config.GetSection(JwtOptions.SectionName))
        .ValidateDataAnnotations()
        .ValidateOnStart();

    services
        .AddOptions<EmailOptions>()
        .Bind(config.GetSection(EmailOptions.SectionName))
        .ValidateDataAnnotations()
        .ValidateOnStart();

    services
        .AddOptions<RateLimitOptions>()
        .Bind(config.GetSection("RateLimit"))
        .ValidateDataAnnotations()
        .ValidateOnStart();

    return services;
}
```

---

## Layer Registration Order

```csharp
// Program.cs — clean, each layer registers itself
builder.Services
    .AddApplicationServices(builder.Configuration)
    .AddInfrastructureServices(builder.Configuration)
    .AddApiServices(builder.Configuration);
```

```csharp
// Application/DependencyInjection.cs
public static IServiceCollection AddApplicationServices(
    this IServiceCollection services, IConfiguration config)
{
    services.AddMediatR(cfg => {
        cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));
    });
    services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly(), includeInternalTypes: true);
    services.AddMapster();
    MappingConfiguration.Configure(services);
    services.AddMemoryCache();
    services.AddLocalization(o => o.ResourcesPath = "Resources");
    return services;
}

// Infrastructure/DependencyInjection.cs
public static IServiceCollection AddInfrastructureServices(
    this IServiceCollection services, IConfiguration config)
{
    services.AddDbContext<ApplicationDbContext>(o =>
        o.UseNpgsql(config.GetConnectionString("DefaultConnection"))
         .UseSnakeCaseNamingConvention());
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
    services.AddScoped(typeof(IReadRepository<>), typeof(Repository<>));
    services.AddScoped<IUnitOfWork, UnitOfWork>();
    services.AddHttpContextAccessor();
    services.AddScoped<ICurrentUser, CurrentUserService>();
    services.AddSingleton<IDateTime, DateTimeService>();
    return services;
}

// API/DependencyInjection.cs
public static IServiceCollection AddApiServices(
    this IServiceCollection services, IConfiguration config)
{
    services.AddControllers();
    services.AddApiVersioning();
    services.AddSwaggerGen(...);
    services.AddAuthentication(...);
    services.AddAuthorization(...);
    services.AddCors(...);
    services.AddRateLimiter(...);
    services.Configure<RequestLocalizationOptions>(...);
    return services;
}
```

---

## Environment Variables Override

```bash
# Any appsettings key can be overridden via env var
# Use double underscore __ as separator

ConnectionStrings__DefaultConnection="Host=prod-db;..."
Jwt__Secret="production-real-secret-here"
Email__SmtpPassword="smtp-password-here"

# In Docker / Kubernetes
env:
  - name: ConnectionStrings__DefaultConnection
    valueFrom:
      secretKeyRef:
        name: backend-secrets
        key: DATABASE_URL
```
