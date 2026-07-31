using System.ComponentModel.DataAnnotations;

namespace WareFlow.Api.Contracts.Products;

public sealed class CreateProductRequest
{
    [Required(ErrorMessage = "Product SKU is required.")]
    [MaxLength(
        50,
        ErrorMessage =
            "Product SKU cannot exceed 50 characters."
    )]
    [RegularExpression(
        @"^[A-Za-z0-9-]+$",
        ErrorMessage =
            "Product SKU can only contain letters, numbers, and hyphens."
    )]
    public string Sku { get; init; } = string.Empty;

    [Required(ErrorMessage = "Product name is required.")]
    [MaxLength(
        150,
        ErrorMessage =
            "Product name cannot exceed 150 characters."
    )]
    public string Name { get; init; } = string.Empty;

    public Guid CategoryId { get; init; }

    [Required(ErrorMessage = "Product unit is required.")]
    [MaxLength(
        30,
        ErrorMessage =
            "Product unit cannot exceed 30 characters."
    )]
    public string Unit { get; init; } = string.Empty;

    [MaxLength(
        500,
        ErrorMessage =
            "Product description cannot exceed 500 characters."
    )]
    public string? Description { get; init; }

    [Range(
        0,
        int.MaxValue,
        ErrorMessage =
            "Minimum stock cannot be negative."
    )]
    public int MinimumStock { get; init; }
}