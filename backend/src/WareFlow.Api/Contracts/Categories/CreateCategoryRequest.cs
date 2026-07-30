using System.ComponentModel.DataAnnotations;

namespace WareFlow.Api.Contracts.Categories;

public sealed class CreateCategoryRequest
{
    [Required(ErrorMessage = "Category name is required.")]
    [MaxLength(
        100,
        ErrorMessage = "Category name cannot exceed 100 characters."
    )]
    public string Name { get; init; } = string.Empty;

    [MaxLength(
        500,
        ErrorMessage =
            "Category description cannot exceed 500 characters."
    )]
    public string? Description { get; init; }
}