namespace WareFlow.Application.Warehouses;

public sealed class WarehouseNotFoundException(
    Guid warehouseId
) : Exception(
    $"Warehouse with ID '{warehouseId}' was not found."
);