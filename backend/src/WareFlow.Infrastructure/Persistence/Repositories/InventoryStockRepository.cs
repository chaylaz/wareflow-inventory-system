using Microsoft.EntityFrameworkCore;
using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Repositories;

public sealed class InventoryStockRepository(
    WareFlowDbContext dbContext
) : IInventoryStockRepository
{
    public async Task<IReadOnlyList<InventoryStock>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.InventoryStocks
            .AsNoTracking()
            .Include(stock => stock.Product)
            .Include(stock => stock.Warehouse)
            .OrderBy(stock => stock.Product.Name)
            .ThenBy(stock => stock.Warehouse.Code)
            .ToListAsync(cancellationToken);
    }

    public Task<InventoryStock?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.InventoryStocks
            .AsNoTracking()
            .Include(stock => stock.Product)
            .Include(stock => stock.Warehouse)
            .FirstOrDefaultAsync(
                stock => stock.Id == id,
                cancellationToken
            );
    }

    public Task<InventoryStock?>
        GetByProductAndWarehouseForUpdateAsync(
            Guid productId,
            Guid warehouseId,
            CancellationToken cancellationToken = default)
    {
        return dbContext.InventoryStocks
            .FirstOrDefaultAsync(
                stock =>
                    stock.ProductId == productId &&
                    stock.WarehouseId == warehouseId,
                cancellationToken
            );
    }

    public async Task AddAsync(
        InventoryStock inventoryStock,
        CancellationToken cancellationToken = default)
    {
        await dbContext.InventoryStocks.AddAsync(
            inventoryStock,
            cancellationToken
        );
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(
            cancellationToken
        );
    }
}