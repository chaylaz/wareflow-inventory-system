using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Application.Warehouses;

public sealed class WarehouseService(
    IWarehouseRepository warehouseRepository
) : IWarehouseService
{
    public async Task<WarehouseResponse> CreateAsync(
        CreateWarehouseCommand command,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode =
            command.Code.Trim().ToUpperInvariant();

        var warehouseExists =
            await warehouseRepository.ExistsByCodeAsync(
                normalizedCode,
                cancellationToken: cancellationToken
            );

        if (warehouseExists)
        {
            throw new WarehouseAlreadyExistsException(
                normalizedCode
            );
        }

        var warehouse = new Warehouse(
            normalizedCode,
            command.Name,
            command.Address
        );

        await warehouseRepository.AddAsync(
            warehouse,
            cancellationToken
        );

        await warehouseRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(warehouse);
    }

    public async Task<IReadOnlyList<WarehouseResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var warehouses =
            await warehouseRepository.GetAllAsync(
                cancellationToken
            );

        return warehouses
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<WarehouseResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var warehouse =
            await warehouseRepository.GetByIdAsync(
                id,
                cancellationToken
            );

        return warehouse is null
            ? null
            : MapToResponse(warehouse);
    }

    public async Task<WarehouseResponse> UpdateAsync(
        UpdateWarehouseCommand command,
        CancellationToken cancellationToken = default)
    {
        var warehouse =
            await warehouseRepository.GetByIdForUpdateAsync(
                command.Id,
                cancellationToken
            );

        if (warehouse is null)
        {
            throw new WarehouseNotFoundException(command.Id);
        }

        var normalizedCode =
            command.Code.Trim().ToUpperInvariant();

        var warehouseExists =
            await warehouseRepository.ExistsByCodeAsync(
                normalizedCode,
                excludedWarehouseId: command.Id,
                cancellationToken: cancellationToken
            );

        if (warehouseExists)
        {
            throw new WarehouseAlreadyExistsException(
                normalizedCode
            );
        }

        warehouse.Update(
            normalizedCode,
            command.Name,
            command.Address
        );

        await warehouseRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(warehouse);
    }

    public async Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var warehouse =
            await warehouseRepository.GetByIdForUpdateAsync(
                id,
                cancellationToken
            );

        if (warehouse is null)
        {
            throw new WarehouseNotFoundException(id);
        }

        warehouse.Deactivate();

        await warehouseRepository.SaveChangesAsync(
            cancellationToken
        );
    }

    private static WarehouseResponse MapToResponse(
        Warehouse warehouse)
    {
        return new WarehouseResponse(
            Id: warehouse.Id,
            Code: warehouse.Code,
            Name: warehouse.Name,
            Address: warehouse.Address,
            IsActive: warehouse.IsActive,
            CreatedAtUtc: warehouse.CreatedAtUtc,
            UpdatedAtUtc: warehouse.UpdatedAtUtc
        );
    }
}