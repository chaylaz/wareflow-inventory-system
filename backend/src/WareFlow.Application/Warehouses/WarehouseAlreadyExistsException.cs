namespace WareFlow.Application.Warehouses;

public sealed class WarehouseAlreadyExistsException(
    string warehouseCode
) : Exception(
    $"Warehouse with code '{warehouseCode}' already exists."
);