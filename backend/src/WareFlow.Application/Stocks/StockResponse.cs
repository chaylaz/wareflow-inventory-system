namespace WareFlow.Application.Stocks;

public sealed record StockResponse(
    Guid Id,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    string Unit,
    int MinimumStock,
    Guid WarehouseId,
    string WarehouseCode,
    string WarehouseName,
    int Quantity,
    string StockStatus,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc
);