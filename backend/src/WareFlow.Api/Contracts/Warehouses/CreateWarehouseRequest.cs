using System.ComponentModel.DataAnnotations;

namespace WareFlow.Api.Contracts.Warehouses;

public sealed class CreateWarehouseRequest
{
    [Required(ErrorMessage = "Warehouse code is required.")]
    [MaxLength(
        20,
        ErrorMessage =
            "Warehouse code cannot exceed 20 characters."
    )]
    public string Code { get; init; } = string.Empty;

    [Required(ErrorMessage = "Warehouse name is required.")]
    [MaxLength(
        100,
        ErrorMessage =
            "Warehouse name cannot exceed 100 characters."
    )]
    public string Name { get; init; } = string.Empty;

    [MaxLength(
        300,
        ErrorMessage =
            "Warehouse address cannot exceed 300 characters."
    )]
    public string? Address { get; init; }
}