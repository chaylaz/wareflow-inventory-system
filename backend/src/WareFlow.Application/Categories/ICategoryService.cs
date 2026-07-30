namespace WareFlow.Application.Categories;

public interface ICategoryService
{
    Task<CategoryResponse> CreateAsync(
        CreateCategoryCommand command,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<CategoryResponse>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<CategoryResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<CategoryResponse> UpdateAsync(
        UpdateCategoryCommand command,
        CancellationToken cancellationToken = default
    );

    Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );
}