using Microsoft.EntityFrameworkCore;
using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Repositories;

public sealed class ProductRepository(
    WareFlowDbContext dbContext
) : IProductRepository
{
    public Task<bool> ExistsBySkuAsync(
        string sku,
        Guid? excludedProductId = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Products
            .Where(product => product.Sku == sku);

        if (excludedProductId.HasValue)
        {
            query = query.Where(
                product =>
                    product.Id != excludedProductId.Value
            );
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .OrderBy(product => product.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<Product?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken
            );
    }

    public Task<Product?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Products
            .FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken
            );
    }

    public async Task AddAsync(
        Product product,
        CancellationToken cancellationToken = default)
    {
        await dbContext.Products.AddAsync(
            product,
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