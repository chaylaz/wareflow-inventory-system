namespace WareFlow.Application.Stocks;

public sealed class InventoryStockNotFoundException
    : Exception
{
    public InventoryStockNotFoundException(
        Guid inventoryStockId
    ) : base(
        $"Inventory stock with ID '{inventoryStockId}' was not found."
    )
    {
    }

    public InventoryStockNotFoundException(
        Guid productId,
        Guid warehouseId
    ) : base(
        $"Inventory stock for product '{productId}' " +
        $"and warehouse '{warehouseId}' was not found."
    )
    {
    }
}