using Microsoft.EntityFrameworkCore;
using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Repositories;

public sealed class WarehouseRepository(
    WareFlowDbContext dbContext
) : IWarehouseRepository
{
    public Task<bool> ExistsByCodeAsync(
        string code,
        Guid? excludedWarehouseId = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Warehouses
            .Where(warehouse => warehouse.Code == code);

        if (excludedWarehouseId.HasValue)
        {
            query = query.Where(
                warehouse =>
                    warehouse.Id != excludedWarehouseId.Value
            );
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Warehouse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Warehouses
            .AsNoTracking()
            .OrderBy(warehouse => warehouse.Code)
            .ToListAsync(cancellationToken);
    }

    public Task<Warehouse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Warehouses
            .AsNoTracking()
            .FirstOrDefaultAsync(
                warehouse => warehouse.Id == id,
                cancellationToken
            );
    }

    public Task<Warehouse?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Warehouses
            .FirstOrDefaultAsync(
                warehouse => warehouse.Id == id,
                cancellationToken
            );
    }

    public async Task AddAsync(
        Warehouse warehouse,
        CancellationToken cancellationToken = default)
    {
        await dbContext.Warehouses.AddAsync(
            warehouse,
            cancellationToken
        );
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}