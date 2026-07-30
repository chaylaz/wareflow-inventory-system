using Microsoft.AspNetCore.Mvc;
using WareFlow.Api.Contracts.Warehouses;
using WareFlow.Application.Warehouses;

namespace WareFlow.Api.Controllers;

[ApiController]
[Route("api/warehouses")]
public sealed class WarehousesController(
    IWarehouseService warehouseService
) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(
        typeof(WarehouseResponse),
        StatusCodes.Status201Created
    )]
    public async Task<ActionResult<WarehouseResponse>> Create(
        CreateWarehouseRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateWarehouseCommand(
            Code: request.Code,
            Name: request.Name,
            Address: request.Address
        );

        var warehouse = await warehouseService.CreateAsync(
            command,
            cancellationToken
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = warehouse.Id },
            warehouse
        );
    }

    [HttpGet]
    public async Task<ActionResult<
        IReadOnlyList<WarehouseResponse>
    >> GetAll(CancellationToken cancellationToken)
    {
        var warehouses =
            await warehouseService.GetAllAsync(
                cancellationToken
            );

        return Ok(warehouses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WarehouseResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var warehouse =
            await warehouseService.GetByIdAsync(
                id,
                cancellationToken
            );

        if (warehouse is null)
        {
            throw new WarehouseNotFoundException(id);
        }

        return Ok(warehouse);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WarehouseResponse>> Update(
        Guid id,
        UpdateWarehouseRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateWarehouseCommand(
            Id: id,
            Code: request.Code,
            Name: request.Name,
            Address: request.Address
        );

        var warehouse =
            await warehouseService.UpdateAsync(
                command,
                cancellationToken
            );

        return Ok(warehouse);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        await warehouseService.DeactivateAsync(
            id,
            cancellationToken
        );

        return NoContent();
    }
}