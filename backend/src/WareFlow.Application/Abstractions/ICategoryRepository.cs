using WareFlow.Domain.Entities;

namespace WareFlow.Application.Abstractions;

public interface ICategoryRepository
{
    Task<bool> ExistsByNameAsync(
        string name,
        Guid? excludedCategoryId = null,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<Category>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<Category?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<Category?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task AddAsync(
        Category category,
        CancellationToken cancellationToken = default
    );

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default
    );
}