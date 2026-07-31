using WareFlow.Application.Abstractions;
using WareFlow.Application.Categories;
using WareFlow.Domain.Entities;

namespace WareFlow.Application.Products;

public sealed class ProductService(
    IProductRepository productRepository,
    ICategoryRepository categoryRepository
) : IProductService
{
    public async Task<ProductResponse> CreateAsync(
        CreateProductCommand command,
        CancellationToken cancellationToken = default)
    {
        var normalizedSku =
            command.Sku.Trim().ToUpperInvariant();

        var productExists =
            await productRepository.ExistsBySkuAsync(
                normalizedSku,
                cancellationToken: cancellationToken
            );

        if (productExists)
        {
            throw new ProductAlreadyExistsException(
                normalizedSku
            );
        }

        var category =
            await categoryRepository.GetByIdAsync(
                command.CategoryId,
                cancellationToken
            );

        if (category is null)
        {
            throw new CategoryNotFoundException(
                command.CategoryId
            );
        }

        if (!category.IsActive)
        {
            throw new ArgumentException(
                "Selected category is inactive.",
                nameof(command.CategoryId)
            );
        }

        var product = new Product(
            sku: normalizedSku,
            name: command.Name,
            categoryId: command.CategoryId,
            unit: command.Unit,
            description: command.Description,
            minimumStock: command.MinimumStock
        );

        await productRepository.AddAsync(
            product,
            cancellationToken
        );

        await productRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(
            product,
            category.Name
        );
    }

    public async Task<IReadOnlyList<ProductResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var products =
            await productRepository.GetAllAsync(
                cancellationToken
            );

        return products
            .Select(product =>
                MapToResponse(
                    product,
                    product.Category.Name
                )
            )
            .ToList();
    }

    public async Task<ProductResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product =
            await productRepository.GetByIdAsync(
                id,
                cancellationToken
            );

        return product is null
            ? null
            : MapToResponse(
                product,
                product.Category.Name
            );
    }

    public async Task<ProductResponse> UpdateAsync(
        UpdateProductCommand command,
        CancellationToken cancellationToken = default)
    {
        var product =
            await productRepository.GetByIdForUpdateAsync(
                command.Id,
                cancellationToken
            );

        if (product is null)
        {
            throw new ProductNotFoundException(
                command.Id
            );
        }

        var normalizedSku =
            command.Sku.Trim().ToUpperInvariant();

        var productExists =
            await productRepository.ExistsBySkuAsync(
                normalizedSku,
                excludedProductId: command.Id,
                cancellationToken: cancellationToken
            );

        if (productExists)
        {
            throw new ProductAlreadyExistsException(
                normalizedSku
            );
        }

        var category =
            await categoryRepository.GetByIdAsync(
                command.CategoryId,
                cancellationToken
            );

        if (category is null)
        {
            throw new CategoryNotFoundException(
                command.CategoryId
            );
        }

        if (!category.IsActive)
        {
            throw new ArgumentException(
                "Selected category is inactive.",
                nameof(command.CategoryId)
            );
        }

        product.Update(
            sku: normalizedSku,
            name: command.Name,
            categoryId: command.CategoryId,
            unit: command.Unit,
            description: command.Description,
            minimumStock: command.MinimumStock
        );

        await productRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(
            product,
            category.Name
        );
    }

    public async Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product =
            await productRepository.GetByIdForUpdateAsync(
                id,
                cancellationToken
            );

        if (product is null)
        {
            throw new ProductNotFoundException(id);
        }

        product.Deactivate();

        await productRepository.SaveChangesAsync(
            cancellationToken
        );
    }

    private static ProductResponse MapToResponse(
        Product product,
        string categoryName)
    {
        return new ProductResponse(
            Id: product.Id,
            Sku: product.Sku,
            Name: product.Name,
            CategoryId: product.CategoryId,
            CategoryName: categoryName,
            Unit: product.Unit,
            Description: product.Description,
            MinimumStock: product.MinimumStock,
            IsActive: product.IsActive,
            CreatedAtUtc: product.CreatedAtUtc,
            UpdatedAtUtc: product.UpdatedAtUtc
        );
    }
}