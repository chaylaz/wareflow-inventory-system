namespace WareFlow.Application.Products;

public sealed record CreateProductCommand(
    string Sku,
    string Name,
    Guid CategoryId,
    string Unit,
    string? Description,
    int MinimumStock
);