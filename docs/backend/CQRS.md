# CQRS Pattern
## HR Analytics Platform — MediatR + Pipeline Behaviors + UnitOfWork

---

## Overview

CQRS (Command Query Responsibility Segregation) separates write operations (Commands) from read operations (Queries). MediatR is the in-process mediator that dispatches requests to their handlers.

```
Controller
    │
    ▼  mediator.Send(command/query)
MediatR Pipeline
    │
    ├─ LoggingBehavior        ← logs request + response
    ├─ ValidationBehavior     ← FluentValidation, throws on failure
    ├─ TransactionBehavior    ← wraps commands in UoW transaction
    └─ CachingBehavior        ← returns cached result for queries
    │
    ▼
Handler.Handle()
    │
    ├─ (Commands) → Repository → UnitOfWork.SaveAsync()
    └─ (Queries)  → DbContext direct read (no UoW needed)
```

---

## Base Types

### ICommand / IQuery — centralized contracts

```csharp
// Application/Common/Interfaces/CQRS/ICommand.cs
public interface ICommand : IRequest<Result> { }
public interface ICommand<TResponse> : IRequest<Result<TResponse>> { }

// Application/Common/Interfaces/CQRS/IQuery.cs
public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }

// Application/Common/Interfaces/CQRS/ICommandHandler.cs
public interface ICommandHandler<TCommand>
    : IRequestHandler<TCommand, Result>
    where TCommand : ICommand { }

public interface ICommandHandler<TCommand, TResponse>
    : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse> { }

// Application/Common/Interfaces/CQRS/IQueryHandler.cs
public interface IQueryHandler<TQuery, TResponse>
    : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse> { }
```

All commands and queries implement these — handler discovery, pipeline behaviors, and return types are 100% consistent across every feature.

---

## Result Type — Centralized Response Wrapper

```csharp
// Application/Common/Models/Result.cs
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; }

    protected Result(bool isSuccess, string error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, string.Empty);
    public static Result Failure(string error) => new(false, error);
}

public class Result<T> : Result
{
    public T? Value { get; }

    private Result(T value) : base(true, string.Empty) => Value = value;
    private Result(string error) : base(false, error) { }

    public static Result<T> Success(T value) => new(value);
    public new static Result<T> Failure(string error) => new(error);
}
```

---

## Command Example — CreateEmployee

```csharp
// Features/Employees/Commands/CreateEmployee/CreateEmployeeCommand.cs
public sealed record CreateEmployeeCommand(
    string FirstName,
    string LastName,
    string Email,
    string Department,
    decimal BaseSalary,
    string Country
) : ICommand<Guid>;

// Features/Employees/Commands/CreateEmployee/CreateEmployeeHandler.cs
internal sealed class CreateEmployeeHandler
    : ICommandHandler<CreateEmployeeCommand, Guid>
{
    private readonly IRepository<Employee> _employees;
    private readonly IUnitOfWork _uow;

    public CreateEmployeeHandler(
        IRepository<Employee> employees,
        IUnitOfWork uow)
    {
        _employees = employees;
        _uow = uow;
    }

    public async Task<Result<Guid>> Handle(
        CreateEmployeeCommand command,
        CancellationToken ct)
    {
        var existing = await _employees
            .FirstOrDefaultAsync(e => e.Email == command.Email, ct);

        if (existing is not null)
            return Result<Guid>.Failure("Email already registered.");

        var employee = Employee.Create(
            command.FirstName,
            command.LastName,
            command.Email,
            command.Department,
            command.BaseSalary,
            command.Country);

        await _employees.AddAsync(employee, ct);
        await _uow.SaveAsync(ct);          // centralized save — no direct context.SaveChanges()

        return Result<Guid>.Success(employee.Id);
    }
}
```

---

## Query Example — GetEmployees (Paged)

```csharp
// Features/Employees/Queries/GetEmployees/GetEmployeesQuery.cs
public sealed record GetEmployeesQuery(
    string? SearchTerm,
    string? Department,
    int Page = 1,
    int PageSize = 25
) : IQuery<PagedResult<EmployeeDto>>;

// Features/Employees/Queries/GetEmployees/GetEmployeesHandler.cs
internal sealed class GetEmployeesHandler
    : IQueryHandler<GetEmployeesQuery, PagedResult<EmployeeDto>>
{
    private readonly IReadRepository<Employee> _employees;

    public GetEmployeesHandler(IReadRepository<Employee> employees)
        => _employees = employees;

    public async Task<Result<PagedResult<EmployeeDto>>> Handle(
        GetEmployeesQuery query,
        CancellationToken ct)
    {
        var spec = new EmployeeSearchSpec(query.SearchTerm, query.Department);

        var total = await _employees.CountAsync(spec, ct);
        var items = await _employees.ListAsync(
            spec, query.Page, query.PageSize, ct);

        var dtos = items.Adapt<List<EmployeeDto>>();

        return Result<PagedResult<EmployeeDto>>.Success(
            new PagedResult<EmployeeDto>(dtos, total, query.Page, query.PageSize));
    }
}
```

**Key rule:** Queries use `IReadRepository` (no tracking, no UoW) — read-only path is cheaper and never accidentally writes.

---

## Pipeline Behaviors (Centralized Cross-Cutting Concerns)

All behaviors live in `Application/Common/Behaviors/` and apply automatically to every request.

### 1. ValidationBehavior

```csharp
// Common/Behaviors/ValidationBehavior.cs
public sealed class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        => _validators = validators;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!_validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var failures = _validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Any())
            throw new Application.Common.Exceptions.ValidationException(failures);

        return await next();
    }
}
```

### 2. LoggingBehavior

```csharp
public sealed class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUser _currentUser;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var name = typeof(TRequest).Name;
        _logger.LogInformation(
            "Handling {RequestName} for user {UserId}",
            name, _currentUser.UserId);

        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();

        if (sw.ElapsedMilliseconds > 500)
            _logger.LogWarning(
                "Slow request: {RequestName} took {ElapsedMs}ms",
                name, sw.ElapsedMilliseconds);

        return response;
    }
}
```

### 3. TransactionBehavior — Centralized UoW Save

```csharp
// Wraps all ICommand requests in a database transaction.
// Handlers NEVER call uow.SaveAsync() themselves — the behavior handles it.
// Exception: if handler needs fine-grained control, it implements ITransactionless.
public sealed class TransactionBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IUnitOfWork _uow;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        // Only wrap commands (writes), not queries (reads)
        if (request is not ICommand and not ICommand<>)
            return await next();

        await using var transaction = await _uow.BeginTransactionAsync(ct);
        try
        {
            var response = await next();
            await _uow.SaveAsync(ct);
            await transaction.CommitAsync(ct);
            return response;
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
```

> With `TransactionBehavior`, handlers focus purely on business logic. The pipeline guarantees every command either fully commits or fully rolls back.

### 4. CachingBehavior

```csharp
// Queries implementing ICacheable get automatic response caching
public interface ICacheable
{
    string CacheKey { get; }
    TimeSpan CacheDuration { get; }
}

public sealed class CachingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IMemoryCache _cache;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (request is not ICacheable cacheable)
            return await next();

        if (_cache.TryGetValue(cacheable.CacheKey, out TResponse? cached))
            return cached!;

        var response = await next();
        _cache.Set(cacheable.CacheKey, response, cacheable.CacheDuration);
        return response;
    }
}
```

---

## MediatR Registration

```csharp
// Infrastructure/DependencyInjection.cs (Application layer part)
public static IServiceCollection AddApplicationServices(
    this IServiceCollection services,
    IConfiguration config)
{
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());

        // Behaviors run in registration order
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));
    });

    services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

    return services;
}
```

---

## Domain Events (Notifications)

```csharp
// Domain/Events/EmployeeCreatedEvent.cs
public sealed record EmployeeCreatedEvent(Guid EmployeeId, string Email)
    : INotification;

// Application/Features/Employees/Events/EmployeeCreatedHandler.cs
internal sealed class EmployeeCreatedHandler
    : INotificationHandler<EmployeeCreatedEvent>
{
    private readonly IEmailService _email;

    public async Task Handle(EmployeeCreatedEvent notification, CancellationToken ct)
        => await _email.SendWelcomeEmailAsync(notification.Email, ct);
}
```

Domain events are published AFTER `SaveAsync()` — entity state is committed before side effects run.
