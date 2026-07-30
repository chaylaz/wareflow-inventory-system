namespace WareFlow.Application.Warehouses;

public sealed record WarehouseResponse(
    Guid Id,
    string Code,
    string Name,
    string? Address,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc
);