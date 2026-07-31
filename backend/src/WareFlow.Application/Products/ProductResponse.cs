namespace WareFlow.Application.Products;

public sealed record ProductResponse(
    Guid Id,
    string Sku,
    string Name,
    Guid CategoryId,
    string CategoryName,
    string Unit,
    string? Description,
    int MinimumStock,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc
);