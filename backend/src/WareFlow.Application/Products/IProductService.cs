namespace WareFlow.Application.Products;

public interface IProductService
{
    Task<ProductResponse> CreateAsync(
        CreateProductCommand command,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<ProductResponse>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<ProductResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<ProductResponse> UpdateAsync(
        UpdateProductCommand command,
        CancellationToken cancellationToken = default
    );

    Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );
}