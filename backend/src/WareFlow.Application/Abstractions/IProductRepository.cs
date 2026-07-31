using WareFlow.Domain.Entities;

namespace WareFlow.Application.Abstractions;

public interface IProductRepository
{
    Task<bool> ExistsBySkuAsync(
        string sku,
        Guid? excludedProductId = null,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<Product>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<Product?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<Product?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task AddAsync(
        Product product,
        CancellationToken cancellationToken = default
    );

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default
    );
}