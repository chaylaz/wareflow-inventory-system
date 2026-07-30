namespace WareFlow.Application.Warehouses;

public sealed record CreateWarehouseCommand(
    string Code,
    string Name,
    string? Address
);