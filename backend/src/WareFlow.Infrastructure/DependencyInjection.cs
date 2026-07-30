using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WareFlow.Application.Abstractions;
using WareFlow.Infrastructure.Persistence;
using WareFlow.Infrastructure.Persistence.Repositories;

namespace WareFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new ArgumentException(
                "Database connection string cannot be empty.",
                nameof(connectionString)
            );
        }

        services.AddDbContext<WareFlowDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        services.AddScoped<
            ICategoryRepository,
            CategoryRepository
        >();

        return services;
    }
}