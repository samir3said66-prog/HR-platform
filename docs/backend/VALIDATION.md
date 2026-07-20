# FluentValidation
## HR Analytics Platform — Pipeline-Integrated, Per-Feature Validators

---

## How It Works

FluentValidation runs automatically via `ValidationBehavior` in the MediatR pipeline. Controllers never manually call validators — the pipeline handles it before the handler executes.

```
POST /api/employees
    │
    ▼
CreateEmployeeCommand dispatched
    │
    ▼ ValidationBehavior runs CreateEmployeeValidator
    ├─ Fails → throws ValidationException → ExceptionMiddleware → 422 response
    └─ Passes → CreateEmployeeHandler.Handle()
```

---

## AbstractValidator — Per Command/Query

Each command/query has its own validator in the same folder:

```csharp
// Features/Employees/Commands/CreateEmployee/CreateEmployeeValidator.cs
public sealed class CreateEmployeeValidator
    : AbstractValidator<CreateEmployeeCommand>
{
    private readonly IReadRepository<Employee> _employees;

    public CreateEmployeeValidator(IReadRepository<Employee> employees)
    {
        _employees = employees;

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress().WithMessage("Invalid email format.")
            .MaximumLength(254)
            .MustAsync(BeUniqueEmail)
                .WithMessage("This email is already registered.");

        RuleFor(x => x.BaseSalary)
            .GreaterThan(0).WithMessage("Salary must be greater than zero.")
            .LessThanOrEqualTo(9_999_999);

        RuleFor(x => x.Country)
            .NotEmpty()
            .Must(c => new[] { "EG", "SA", "AE", "IQ", "KW" }.Contains(c))
                .WithMessage("Unsupported country code.");

        RuleFor(x => x.Department)
            .NotEmpty()
            .MaximumLength(100);
    }

    private async Task<bool> BeUniqueEmail(
        string email, CancellationToken ct)
        => !await _employees.AnyAsync(
            new EmployeeByEmailSpec(email), ct);
}
```

---

## Common Validators (Shared / Reusable)

```csharp
// Application/Common/Validators/PaginationValidator.cs
public abstract class PaginationValidatorBase<T> : AbstractValidator<T>
    where T : class
{
    protected void AddPaginationRules(
        Expression<Func<T, int>> page,
        Expression<Func<T, int>> pageSize)
    {
        RuleFor(page)
            .GreaterThan(0).WithMessage("Page must be ≥ 1.");

        RuleFor(pageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("PageSize must be between 1 and 100.");
    }
}

// Used by queries that are paged
public sealed class GetEmployeesValidator
    : PaginationValidatorBase<GetEmployeesQuery>
{
    public GetEmployeesValidator()
    {
        AddPaginationRules(x => x.Page, x => x.PageSize);

        RuleFor(x => x.SearchTerm)
            .MaximumLength(100).When(x => x.SearchTerm is not null);
    }
}
```

---

## Async Validators with Database Checks

```csharp
// Always inject IReadRepository — never IRepository — in validators
// Validators are read-only and should never trigger UoW
public sealed class UpdateEmployeeValidator
    : AbstractValidator<UpdateEmployeeCommand>
{
    public UpdateEmployeeValidator(IReadRepository<Employee> employees)
    {
        RuleFor(x => x.Id)
            .MustAsync(async (id, ct) =>
                await employees.AnyAsync(new EmployeeByIdSpec(id), ct))
            .WithMessage("Employee not found.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .MustAsync(async (cmd, email, ct) =>
                !await employees.AnyAsync(
                    new EmployeeByEmailExcludingSpec(email, cmd.Id), ct))
            .WithMessage("Email already used by another employee.");
    }
}
```

---

## ValidationException — Centralized Error Shape

```csharp
// Application/Common/Exceptions/ValidationException.cs
public sealed class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : base("One or more validation errors occurred.")
    {
        Errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());
    }
}
```

This is caught by `ExceptionHandlerMiddleware` and serialized to:

```json
{
  "type": "ValidationError",
  "title": "One or more validation errors occurred.",
  "status": 422,
  "errors": {
    "Email": ["Invalid email format.", "This email is already registered."],
    "BaseSalary": ["Salary must be greater than zero."]
  },
  "traceId": "0HN5T4K6B1..."
}
```

---

## Localized Validation Messages

```csharp
// For EN/AR support, messages reference IStringLocalizer
public sealed class CreateEmployeeValidator
    : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeValidator(
        IStringLocalizer<CreateEmployeeValidator> localizer,
        IReadRepository<Employee> employees)
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage(x => localizer["Validation.FirstName.Required"]);

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage(x => localizer["Validation.Email.Invalid"]);
    }
}
```

Resources in `Resources/Features/Employees/`:
- `CreateEmployeeValidator.en.resx` → English messages
- `CreateEmployeeValidator.ar.resx` → Arabic messages

---

## Registration

```csharp
// Application/DependencyInjection.cs
// Scans the Application assembly — discovers all AbstractValidator<T> automatically
services.AddValidatorsFromAssembly(
    Assembly.GetExecutingAssembly(),
    includeInternalTypes: true);
```

No manual registration needed. Adding a new validator class is all that's required.
