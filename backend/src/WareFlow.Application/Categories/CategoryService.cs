using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Application.Categories;

public sealed class CategoryService(
    ICategoryRepository categoryRepository
) : ICategoryService
{
    public async Task<CategoryResponse> CreateAsync(
        CreateCategoryCommand command,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = command.Name.Trim();

        var categoryExists =
            await categoryRepository.ExistsByNameAsync(
                normalizedName,
                cancellationToken: cancellationToken
            );

        if (categoryExists)
        {
            throw new CategoryAlreadyExistsException(
                normalizedName
            );
        }

        var category = new Category(
            normalizedName,
            command.Description
        );

        await categoryRepository.AddAsync(
            category,
            cancellationToken
        );

        await categoryRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(category);
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var categories =
            await categoryRepository.GetAllAsync(
                cancellationToken
            );

        return categories
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<CategoryResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var category =
            await categoryRepository.GetByIdAsync(
                id,
                cancellationToken
            );

        return category is null
            ? null
            : MapToResponse(category);
    }

    public async Task<CategoryResponse> UpdateAsync(
        UpdateCategoryCommand command,
        CancellationToken cancellationToken = default)
    {
        var category =
            await categoryRepository.GetByIdForUpdateAsync(
                command.Id,
                cancellationToken
            );

        if (category is null)
        {
            throw new CategoryNotFoundException(command.Id);
        }

        var normalizedName = command.Name.Trim();

        var categoryExists =
            await categoryRepository.ExistsByNameAsync(
                normalizedName,
                excludedCategoryId: command.Id,
                cancellationToken: cancellationToken
            );

        if (categoryExists)
        {
            throw new CategoryAlreadyExistsException(
                normalizedName
            );
        }

        category.Update(
            normalizedName,
            command.Description
        );

        await categoryRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(category);
    }

    public async Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var category =
            await categoryRepository.GetByIdForUpdateAsync(
                id,
                cancellationToken
            );

        if (category is null)
        {
            throw new CategoryNotFoundException(id);
        }

        category.Deactivate();

        await categoryRepository.SaveChangesAsync(
            cancellationToken
        );
    }

    private static CategoryResponse MapToResponse(
        Category category)
    {
        return new CategoryResponse(
            Id: category.Id,
            Name: category.Name,
            Description: category.Description,
            IsActive: category.IsActive,
            CreatedAtUtc: category.CreatedAtUtc,
            UpdatedAtUtc: category.UpdatedAtUtc
        );
    }
}