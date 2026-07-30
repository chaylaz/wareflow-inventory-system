namespace WareFlow.Application.Warehouses;

public sealed record UpdateWarehouseCommand(
    Guid Id,
    string Code,
    string Name,
    string? Address
);