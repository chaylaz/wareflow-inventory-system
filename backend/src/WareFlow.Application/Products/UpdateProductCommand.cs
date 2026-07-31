namespace WareFlow.Application.Products;

public sealed record UpdateProductCommand(
    Guid Id,
    string Sku,
    string Name,
    Guid CategoryId,
    string Unit,
    string? Description,
    int MinimumStock
);