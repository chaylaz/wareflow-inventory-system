namespace WareFlow.Application.Stocks;

public sealed record StockOutCommand(
    Guid ProductId,
    Guid WarehouseId,
    int Quantity
);