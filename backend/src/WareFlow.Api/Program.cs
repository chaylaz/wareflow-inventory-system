using WareFlow.Api.ExceptionHandling;
using WareFlow.Application.Categories;
using WareFlow.Application.Products;
using WareFlow.Application.Warehouses;
using WareFlow.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "Frontend";

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

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

builder.Services.AddScoped<
    IProductService,
    ProductService
>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseExceptionHandler();

app.UseCors(frontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();