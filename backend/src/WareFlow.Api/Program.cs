using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using WareFlow.Api.ExceptionHandling;
using WareFlow.Application.Authentication;
using WareFlow.Application.Categories;
using WareFlow.Application.Products;
using WareFlow.Application.Stocks;
using WareFlow.Application.Warehouses;
using WareFlow.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "Frontend";

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<
    GlobalExceptionHandler
>();

builder.Services
    .AddAuthentication(
        CookieAuthenticationDefaults
            .AuthenticationScheme
    )
    .AddCookie(options =>
    {
        options.Cookie.Name =
            "wareflow.auth";

        options.Cookie.HttpOnly = true;

        options.Cookie.SameSite =
            SameSiteMode.Lax;

        options.Cookie.SecurePolicy =
            CookieSecurePolicy.SameAsRequest;

        options.ExpireTimeSpan =
            TimeSpan.FromHours(8);

        options.SlidingExpiration = true;

        options.Events.OnRedirectToLogin =
            context =>
            {
                context.Response.StatusCode =
                    StatusCodes.Status401Unauthorized;

                return Task.CompletedTask;
            };

        options.Events.OnRedirectToAccessDenied =
            context =>
            {
                context.Response.StatusCode =
                    StatusCodes.Status403Forbidden;

                return Task.CompletedTask;
            };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy =
        new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        frontendCorsPolicy,
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:5173"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});

var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    )
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found."
    );

builder.Services.AddInfrastructure(
    connectionString
);

builder.Services.AddScoped<
    ICategoryService,
    CategoryService
>();

builder.Services.AddScoped<
    IWarehouseService,
    WarehouseService
>();

builder.Services.AddScoped<
    IProductService,
    ProductService
>();

builder.Services.AddScoped<
    IInventoryStockService,
    InventoryStockService
>();

builder.Services.AddScoped<
    IAuthService,
    AuthService
>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();

app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();