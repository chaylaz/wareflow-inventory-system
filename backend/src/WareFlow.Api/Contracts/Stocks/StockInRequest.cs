using System.ComponentModel.DataAnnotations;

namespace WareFlow.Api.Contracts.Stocks;

public sealed class StockInRequest
{
    public Guid ProductId { get; init; }

    public Guid WarehouseId { get; init; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage =
            "Stock quantity must be greater than zero."
    )]
    public int Quantity { get; init; }
}