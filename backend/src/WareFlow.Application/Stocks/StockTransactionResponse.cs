namespace WareFlow.Application.Stocks;

public sealed record StockTransactionResponse(
    Guid Id,
    Guid InventoryStockId,
    string Type,
    Guid ProductId,
    string ProductSku,
    string ProductName,
    string Unit,
    Guid WarehouseId,
    string WarehouseCode,
    string WarehouseName,
    int Quantity,
    int BalanceAfter,
    DateTimeOffset CreatedAtUtc
);