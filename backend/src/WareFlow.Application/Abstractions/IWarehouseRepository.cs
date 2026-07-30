using WareFlow.Domain.Entities;

namespace WareFlow.Application.Abstractions;

public interface IWarehouseRepository
{
    Task<bool> ExistsByCodeAsync(
        string code,
        Guid? excludedWarehouseId = null,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<Warehouse>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<Warehouse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<Warehouse?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task AddAsync(
        Warehouse warehouse,
        CancellationToken cancellationToken = default
    );

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default
    );
}