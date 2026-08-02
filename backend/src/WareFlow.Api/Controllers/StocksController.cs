using Microsoft.AspNetCore.Mvc;
using WareFlow.Api.Contracts.Stocks;
using WareFlow.Application.Stocks;

namespace WareFlow.Api.Controllers;

[ApiController]
[Route("api/stocks")]
public sealed class StocksController(
    IInventoryStockService inventoryStockService
) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<StockResponse>),
        StatusCodes.Status200OK
    )]
    public async Task<ActionResult<
        IReadOnlyList<StockResponse>
    >> GetAll(CancellationToken cancellationToken)
    {
        var inventoryStocks =
            await inventoryStockService.GetAllAsync(
                cancellationToken
            );

        return Ok(inventoryStocks);
    }

    [HttpGet("history")]
    [ProducesResponseType(
        typeof(IReadOnlyList<StockTransactionResponse>),
        StatusCodes.Status200OK
    )]
    public async Task<ActionResult<
        IReadOnlyList<StockTransactionResponse>
    >> GetHistory(
        CancellationToken cancellationToken)
    {
        var transactions =
            await inventoryStockService.GetHistoryAsync(
                cancellationToken
            );

        return Ok(transactions);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(
        typeof(StockResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status404NotFound
    )]
    public async Task<ActionResult<StockResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var inventoryStock =
            await inventoryStockService.GetByIdAsync(
                id,
                cancellationToken
            );

        if (inventoryStock is null)
        {
            throw new InventoryStockNotFoundException(
                id
            );
        }

        return Ok(inventoryStock);
    }

    [HttpPost("in")]
    [ProducesResponseType(
        typeof(StockResponse),
        StatusCodes.Status200OK
    )]
    public async Task<ActionResult<StockResponse>> StockIn(
        StockInRequest request,
        CancellationToken cancellationToken)
    {
        var command = new StockInCommand(
            ProductId: request.ProductId,
            WarehouseId: request.WarehouseId,
            Quantity: request.Quantity
        );

        var inventoryStock =
            await inventoryStockService.StockInAsync(
                command,
                cancellationToken
            );

        return Ok(inventoryStock);
    }

    [HttpPost("out")]
    [ProducesResponseType(
        typeof(StockResponse),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(
        StatusCodes.Status409Conflict
    )]
    public async Task<ActionResult<StockResponse>> StockOut(
        StockOutRequest request,
        CancellationToken cancellationToken)
    {
        var command = new StockOutCommand(
            ProductId: request.ProductId,
            WarehouseId: request.WarehouseId,
            Quantity: request.Quantity
        );

        var inventoryStock =
            await inventoryStockService.StockOutAsync(
                command,
                cancellationToken
            );

        return Ok(inventoryStock);
    }
}