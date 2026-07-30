namespace WareFlow.Application.Warehouses;

public interface IWarehouseService
{
    Task<WarehouseResponse> CreateAsync(
        CreateWarehouseCommand command,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<WarehouseResponse>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<WarehouseResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<WarehouseResponse> UpdateAsync(
        UpdateWarehouseCommand command,
        CancellationToken cancellationToken = default
    );

    Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );
}