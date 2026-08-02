using WareFlow.Domain.Entities;

namespace WareFlow.Application.Abstractions;

public interface IInventoryStockRepository
{
    Task<IReadOnlyList<InventoryStock>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<InventoryStock?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<InventoryStock?>
        GetByProductAndWarehouseForUpdateAsync(
            Guid productId,
            Guid warehouseId,
            CancellationToken cancellationToken = default
        );

    Task AddAsync(
        InventoryStock inventoryStock,
        CancellationToken cancellationToken = default
    );

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default
    );
}