using Microsoft.EntityFrameworkCore;
using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository(
    WareFlowDbContext dbContext
) : ICategoryRepository
{
    public Task<bool> ExistsByNameAsync(
        string name,
        Guid? excludedCategoryId = null,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Categories
            .Where(category => category.Name == name);

        if (excludedCategoryId.HasValue)
        {
            query = query.Where(
                category => category.Id != excludedCategoryId.Value
            );
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<Category?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(
                category => category.Id == id,
                cancellationToken
            );
    }

    public Task<Category?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Categories
            .FirstOrDefaultAsync(
                category => category.Id == id,
                cancellationToken
            );
    }

    public async Task AddAsync(
        Category category,
        CancellationToken cancellationToken = default)
    {
        await dbContext.Categories.AddAsync(
            category,
            cancellationToken
        );
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}