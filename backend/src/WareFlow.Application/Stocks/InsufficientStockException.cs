namespace WareFlow.Application.Stocks;

public sealed class InsufficientStockException(
    int availableQuantity,
    int requestedQuantity
) : Exception(
    $"Insufficient stock. Available quantity is " +
    $"{availableQuantity}, while requested quantity is " +
    $"{requestedQuantity}."
);