# Repository & Unit of Work Pattern
## HR Analytics Platform — Generic, Centralized, EF Core 9

---

## Design Goals

1. **Generic `Repository<T>`** — one implementation serves all entities
2. **`IUnitOfWork`** — single `SaveAsync()` call owned by the pipeline (not handlers)
3. **`IReadRepository<T>`** — separate read-only path (no tracking, no UoW needed)
4. **Specification pattern** — complex filter logic lives in reusable spec classes, not handlers
5. **No leaking EF Core** — handlers depend on `IRepository<T>`, never on `DbContext` directly

---

## Domain Interfaces

```csharp
// Domain/Interfaces/IRepository.cs
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}

// Domain/Interfaces/IReadRepository.cs
public interface IReadRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<T>> ListAsync(ISpecification<T> spec, int page, int pageSize, CancellationToken ct = default);
    Task<List<T>> ListAllAsync(ISpecification<T>? spec = null, CancellationToken ct = default);
    Task<int> CountAsync(ISpecification<T> spec, CancellationToken ct = default);
    Task<bool> AnyAsync(ISpecification<T> spec, CancellationToken ct = default);
}

// Domain/Interfaces/IUnitOfWork.cs
public interface IUnitOfWork
{
    Task<int> SaveAsync(CancellationToken ct = default);
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct = default);
}
```

---

## Generic Repository Implementation

```csharp
// Infrastructure/Persistence/Repositories/Repository.cs
public class Repository<T> : IRepository<T>, IReadRepository<T>
    where T : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    // ── Write operations (tracked) ──────────────────────────────
    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _dbSet.FindAsync([id], ct);

    public async Task<T?> FirstOrDefaultAsync(
        Expression<Func<T, bool>> predicate, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(predicate, ct);

    public async Task<bool> AnyAsync(
        Expression<Func<T, bool>> predicate, CancellationToken ct = default)
        => await _dbSet.AnyAsync(predicate, ct);

    public async Task AddAsync(T entity, CancellationToken ct = default)
        => await _dbSet.AddAsync(entity, ct);

    public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken ct = default)
        => await _dbSet.AddRangeAsync(entities, ct);

    public void Update(T entity)
        => _dbSet.Update(entity);

    public void Remove(T entity)
        => _dbSet.Remove(entity);

    // ── Read operations (no-tracking) ──────────────────────────
    public async Task<List<T>> ListAsync(
        ISpecification<T> spec, int page, int pageSize, CancellationToken ct = default)
        => await ApplySpec(_dbSet.AsNoTracking(), spec)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

    public async Task<List<T>> ListAllAsync(
        ISpecification<T>? spec = null, CancellationToken ct = default)
        => await ApplySpec(_dbSet.AsNoTracking(), spec)
            .ToListAsync(ct);

    public async Task<int> CountAsync(ISpecification<T> spec, CancellationToken ct = default)
        => await ApplySpec(_dbSet.AsNoTracking(), spec)
            .CountAsync(ct);

    public async Task<bool> AnyAsync(ISpecification<T> spec, CancellationToken ct = default)
        => await ApplySpec(_dbSet.AsNoTracking(), spec)
            .AnyAsync(ct);

    private static IQueryable<T> ApplySpec(IQueryable<T> query, ISpecification<T>? spec)
    {
        if (spec is null) return query;
        if (spec.Criteria is not null) query = query.Where(spec.Criteria);
        query = spec.Includes.Aggregate(query, (q, i) => q.Include(i));
        if (spec.OrderBy is not null) query = query.OrderBy(spec.OrderBy);
        if (spec.OrderByDescending is not null) query = query.OrderByDescending(spec.OrderByDescending);
        return query;
    }
}
```

---

## Unit of Work Implementation

```csharp
// Infrastructure/Persistence/Repositories/UnitOfWork.cs
public sealed class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context) => _context = context;

    public async Task<int> SaveAsync(CancellationToken ct = default)
    {
        // Dispatch domain events before saving
        await DispatchDomainEventsAsync(ct);
        return await _context.SaveChangesAsync(ct);
    }

    public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken ct = default)
        => await _context.Database.BeginTransactionAsync(ct);

    private async Task DispatchDomainEventsAsync(CancellationToken ct)
    {
        var entities = _context.ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var events = entities.SelectMany(e => e.DomainEvents).ToList();
        entities.ForEach(e => e.ClearDomainEvents());

        foreach (var evt in events)
            await _mediator.Publish(evt, ct);
    }
}
```

**Key point:** `SaveAsync()` is called ONLY by `TransactionBehavior` in the MediatR pipeline. Handlers call repository methods but **never** call `SaveAsync()` directly. This makes save logic centralized and consistent across all 9 features.

---

## Specification Pattern

```csharp
// Application/Common/Specifications/ISpecification.cs
public interface ISpecification<T>
{
    Expression<Func<T, bool>>? Criteria { get; }
    List<Expression<Func<T, object>>> Includes { get; }
    Expression<Func<T, object>>? OrderBy { get; }
    Expression<Func<T, object>>? OrderByDescending { get; }
}

// Application/Common/Specifications/BaseSpecification.cs
public abstract class BaseSpecification<T> : ISpecification<T>
{
    public Expression<Func<T, bool>>? Criteria { get; private set; }
    public List<Expression<Func<T, object>>> Includes { get; } = [];
    public Expression<Func<T, object>>? OrderBy { get; private set; }
    public Expression<Func<T, object>>? OrderByDescending { get; private set; }

    protected void AddCriteria(Expression<Func<T, bool>> criteria) => Criteria = criteria;
    protected void AddInclude(Expression<Func<T, object>> include) => Includes.Add(include);
    protected void AddOrderBy(Expression<Func<T, object>> orderBy) => OrderBy = orderBy;
    protected void AddOrderByDesc(Expression<Func<T, object>> orderBy) => OrderByDescending = orderBy;
}

// Feature-specific spec
// Features/Employees/Specifications/EmployeeSearchSpec.cs
public sealed class EmployeeSearchSpec : BaseSpecification<Employee>
{
    public EmployeeSearchSpec(string? search, string? department)
    {
        AddCriteria(e =>
            (string.IsNullOrEmpty(search) ||
             e.FirstName.Contains(search) ||
             e.LastName.Contains(search) ||
             e.Email.Contains(search)) &&
            (string.IsNullOrEmpty(department) || e.Department == department) &&
            e.IsActive);

        AddInclude(e => e.Department);
        AddOrderBy(e => e.LastName);
    }
}
```

---

## Dependency Registration

```csharp
// Infrastructure/DependencyInjection.cs
services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
services.AddScoped(typeof(IReadRepository<>), typeof(Repository<>));
services.AddScoped<IUnitOfWork, UnitOfWork>();
```

---

## BaseEntity

```csharp
// Domain/Entities/Common/BaseEntity.cs
public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public string? UpdatedBy { get; protected set; }

    private readonly List<INotification> _domainEvents = [];
    public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(INotification evt) => _domainEvents.Add(evt);
    public void ClearDomainEvents() => _domainEvents.Clear();
}
```
