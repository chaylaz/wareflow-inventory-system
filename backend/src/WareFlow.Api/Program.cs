using WareFlow.Api.ExceptionHandling;
using WareFlow.Application.Categories;
using WareFlow.Application.Warehouses;
using WareFlow.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection"
    )
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found."
    );

builder.Services.AddInfrastructure(connectionString);

builder.Services.AddScoped<
    ICategoryService,
    CategoryService
>();

builder.Services.AddScoped<
    IWarehouseService,
    WarehouseService
>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();

app.UseAuthorization();

app.MapControllers();

app.Run();