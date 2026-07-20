# Localization
## HR Analytics Platform — EN / AR · RequestLocalization · RTL · Formatting

---

## Setup

```csharp
// Infrastructure/DependencyInjection.cs
services.AddLocalization(options =>
    options.ResourcesPath = "Resources");

services.Configure<RequestLocalizationOptions>(options =>
{
    var supported = new[] { "en", "ar" };
    options.SetDefaultCulture("en")
           .AddSupportedCultures(supported)
           .AddSupportedUICultures(supported);

    // Accept language from: query string → cookie → Accept-Language header
    options.RequestCultureProviders = new List<IRequestCultureProvider>
    {
        new QueryStringRequestCultureProvider { QueryStringKey = "lang" },
        new CookieRequestCultureProvider(),
        new AcceptLanguageHeaderRequestCultureProvider(),
    };
});
```

---

## Resource Files Structure

```
HRPlatform.Application/
└── Resources/
    ├── Common/
    │   ├── SharedMessages.en.resx       ← English fallback
    │   └── SharedMessages.ar.resx       ← Arabic translations
    └── Features/
        ├── Employees/
        │   ├── CreateEmployeeValidator.en.resx
        │   └── CreateEmployeeValidator.ar.resx
        ├── Payroll/
        │   ├── RunPayrollValidator.en.resx
        │   └── RunPayrollValidator.ar.resx
        └── ...
```

**Sample `SharedMessages.ar.resx`:**

```xml
<data name="Employee.NotFound" xml:space="preserve">
  <value>لم يتم العثور على الموظف.</value>
</data>
<data name="Validation.Required" xml:space="preserve">
  <value>هذا الحقل مطلوب.</value>
</data>
<data name="Payroll.AlreadyProcessed" xml:space="preserve">
  <value>تمت معالجة كشف الرواتب لهذه الفترة بالفعل.</value>
</data>
```

---

## Using Localizer in Handlers

```csharp
internal sealed class GetEmployeeByIdHandler
    : IQueryHandler<GetEmployeeByIdQuery, EmployeeDto>
{
    private readonly IReadRepository<Employee> _repo;
    private readonly IStringLocalizer<GetEmployeeByIdHandler> _localizer;

    public async Task<Result<EmployeeDto>> Handle(
        GetEmployeeByIdQuery query, CancellationToken ct)
    {
        var employee = await _repo.GetByIdAsync(query.Id, ct);

        if (employee is null)
            return Result<EmployeeDto>.Failure(
                _localizer["Employee.NotFound"]);

        return Result<EmployeeDto>.Success(employee.Adapt<EmployeeDto>());
    }
}
```

---

## Localized Validation Messages

```csharp
public sealed class CreateEmployeeValidator
    : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeValidator(
        IStringLocalizer<CreateEmployeeValidator> localizer,
        IReadRepository<Employee> employees)
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage(_ => localizer["Validation.FirstName.Required"]);

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage(_ => localizer["Validation.Email.Invalid"])
            .MustAsync(async (email, ct) =>
                !await employees.AnyAsync(
                    new EmployeeByEmailSpec(email), ct))
            .WithMessage(_ => localizer["Validation.Email.AlreadyExists"]);
    }
}
```

---

## Currency Formatting by Country

```csharp
// Application/Common/Services/CurrencyFormatter.cs
public static class CurrencyFormatter
{
    private static readonly Dictionary<string, (string Code, string Culture)> Map = new()
    {
        ["EG"] = ("EGP", "ar-EG"),
        ["SA"] = ("SAR", "ar-SA"),
        ["AE"] = ("AED", "ar-AE"),
        ["IQ"] = ("IQD", "ar-IQ"),
        ["KW"] = ("KWD", "ar-KW"),
    };

    public static string Format(decimal amount, string countryCode)
    {
        if (!Map.TryGetValue(countryCode, out var entry))
            return amount.ToString("C", CultureInfo.GetCultureInfo("en-US"));

        var culture = CultureInfo.GetCultureInfo(entry.Culture);
        return amount.ToString("C", culture);
    }
}

// Usage in payroll DTO mapping
config.NewConfig<PayrollRecord, PayrollDto>()
    .Map(dest => dest.FormattedNetPay,
         src => CurrencyFormatter.Format(src.NetPay, src.Employee.Country));
```

---

## Date Formatting

```csharp
// Hijri calendar for Saudi Arabia, Gregorian for rest
public static string FormatDate(DateTime date, string countryCode, string uiCulture)
{
    if (countryCode == "SA" && uiCulture == "ar")
    {
        var hijri = new System.Globalization.HijriCalendar();
        return $"{hijri.GetYear(date)}/{hijri.GetMonth(date):D2}/{hijri.GetDayOfMonth(date):D2}";
    }
    return date.ToString("dd/MM/yyyy",
        CultureInfo.GetCultureInfo(uiCulture == "ar" ? "ar-EG" : "en-US"));
}
```

---

## RTL Direction in API Responses

```csharp
// API returns direction metadata so frontend applies dir="rtl"
public sealed class ApiResponse<T>
{
    public T? Data { get; init; }
    public bool Success { get; init; }
    public string? Error { get; init; }
    public string Direction { get; init; } = "ltr";  // "ltr" or "rtl"
}

// Middleware adds direction based on current culture
public static ApiResponse<T> Create<T>(T data, HttpContext ctx)
{
    var culture = ctx.Features.Get<IRequestCultureFeature>()?.RequestCulture.Culture;
    return new ApiResponse<T>
    {
        Data = data,
        Success = true,
        Direction = culture?.TextInfo.IsRightToLeft == true ? "rtl" : "ltr"
    };
}
```

---

## Switching Language via Request

```bash
# Via query string
GET /api/employees?lang=ar

# Via Accept-Language header
GET /api/employees
Accept-Language: ar-EG

# Via cookie (persists across requests)
Cookie: .AspNetCore.Culture=c=ar|uic=ar
```
