# Entity Framework Core 9
## HR Analytics Platform — DbContext · Fluent API · Migrations · Seeds

---

## DbContext

```csharp
// Infrastructure/Persistence/ApplicationDbContext.cs
public class ApplicationDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUser currentUser) : base(options)
    {
        _currentUser = currentUser;
    }

    // ── DbSets ──────────────────────────────────────────────────
    public DbSet<Employee>         Employees         => Set<Employee>();
    public DbSet<Department>       Departments       => Set<Department>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<PayrollRecord>    PayrollRecords    => Set<PayrollRecord>();
    public DbSet<LeaveRequest>     LeaveRequests     => Set<LeaveRequest>();
    public DbSet<PerformanceReview> PerformanceReviews => Set<PerformanceReview>();
    public DbSet<JobPosting>       JobPostings       => Set<JobPosting>();
    public DbSet<Applicant>        Applicants        => Set<Applicant>();
    public DbSet<AuditLog>         AuditLogs         => Set<AuditLog>();
    public DbSet<AppUser>          Users             => Set<AppUser>();
    public DbSet<Role>             Roles             => Set<Role>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Auto-discover all IEntityTypeConfiguration<T> in this assembly
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global query filters
        builder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<PayrollRecord>().HasQueryFilter(p => !p.IsDeleted);

        base.OnModelCreating(builder);
    }

    // ── Audit Interceptor — auto-set audit fields ──────────────
    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.SetCreated(_currentUser.UserId ?? "system");
                    break;
                case EntityState.Modified:
                    entry.Entity.SetUpdated(_currentUser.UserId ?? "system");
                    break;
            }
        }
        return await base.SaveChangesAsync(ct);
    }
}
```

---

## Entity Configuration (Fluent API)

```csharp
// Infrastructure/Persistence/Configurations/EmployeeConfiguration.cs
public sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(254);

        builder.HasIndex(e => e.Email).IsUnique();

        builder.Property(e => e.BaseSalary)
            .HasColumnType("numeric(18,4)")
            .IsRequired();

        builder.Property(e => e.Country)
            .HasConversion<string>()
            .HasMaxLength(2);

        // Owned value object
        builder.OwnsOne(e => e.Address, a =>
        {
            a.Property(x => x.Street).HasMaxLength(200);
            a.Property(x => x.City).HasMaxLength(100);
            a.Property(x => x.PostalCode).HasMaxLength(20);
        });

        // Relationships
        builder.HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.AttendanceRecords)
            .WithOne(a => a.Employee)
            .HasForeignKey(a => a.EmployeeId);

        // Table name convention
        builder.ToTable("employees");
    }
}
```

---

## Global Conventions

```csharp
// Applied inside OnModelCreating before ApplyConfigurationsFromAssembly
protected override void ConfigureConventions(ModelConfigurationBuilder builder)
{
    // All string columns default to varchar(255) — override per entity where needed
    builder.Properties<string>().HaveMaxLength(255);

    // All DateTime stored as UTC
    builder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();

    // All decimal columns: numeric(18,4)
    builder.Properties<decimal>().HavePrecision(18, 4);
}
```

---

## PostgreSQL Registration

```csharp
// Infrastructure/DependencyInjection.cs
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(
        configuration.GetConnectionString("DefaultConnection"),
        npgsql =>
        {
            npgsql.MigrationsAssembly("HRPlatform.Infrastructure");
            npgsql.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null);
            npgsql.CommandTimeout(30);
        });

    if (environment.IsDevelopment())
        options.EnableSensitiveDataLogging().EnableDetailedErrors();
});
```

---

## Migrations

```bash
# Add migration (run from solution root)
dotnet ef migrations add InitialCreate \
  --project src/HRPlatform.Infrastructure \
  --startup-project src/HRPlatform.API

# Apply to database
dotnet ef database update \
  --project src/HRPlatform.Infrastructure \
  --startup-project src/HRPlatform.API

# Generate SQL script (for DBA review before production)
dotnet ef migrations script \
  --project src/HRPlatform.Infrastructure \
  --startup-project src/HRPlatform.API \
  --output migrations.sql

# Rollback last migration
dotnet ef migrations remove \
  --project src/HRPlatform.Infrastructure \
  --startup-project src/HRPlatform.API
```

---

## Database Seeding

```csharp
// Infrastructure/Persistence/Seeds/DataSeeder.cs
public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            // Apply pending migrations first
            if (context.Database.GetPendingMigrations().Any())
                await context.Database.MigrateAsync();

            // Run seeders in order
            await RoleSeeder.SeedAsync(context, logger);
            await DepartmentSeeder.SeedAsync(context, logger);
            await UserSeeder.SeedAsync(context, logger);
            await EmployeeSeeder.SeedAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding database");
            throw;
        }
    }
}

// Infrastructure/Persistence/Seeds/DepartmentSeeder.cs
public static class DepartmentSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Departments.AnyAsync()) return;  // idempotent

        var departments = new[]
        {
            Department.Create("Engineering"),
            Department.Create("Human Resources"),
            Department.Create("Finance"),
            Department.Create("Sales"),
            Department.Create("Operations"),
        };

        await context.Departments.AddRangeAsync(departments);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} departments", departments.Length);
    }
}

// Program.cs — call seeder on startup
await using var scope = app.Services.CreateAsyncScope();
var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
var logger  = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
await DataSeeder.SeedAsync(context, logger);
```

---

## EF Core Best Practices in This Project

| Rule | Why |
|------|-----|
| All configurations in `IEntityTypeConfiguration<T>` | No data annotations on domain entities — keeps domain clean |
| `AsNoTracking()` in read-only queries | 30% faster reads, no state tracking overhead |
| Global query filter for soft deletes | Deleted records never surface unless explicitly ignored |
| UTC everywhere via converter | No timezone bugs across regions (Egypt/KSA/UAE) |
| Retry on failure for PostgreSQL | Handles transient connection errors automatically |
| Owned entities for value objects | Address, Money stored inline, no extra table |
