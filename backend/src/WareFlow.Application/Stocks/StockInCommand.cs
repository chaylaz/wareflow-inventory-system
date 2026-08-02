namespace WareFlow.Application.Stocks;

public sealed record StockInCommand(
    Guid ProductId,
    Guid WarehouseId,
    int Quantity
);