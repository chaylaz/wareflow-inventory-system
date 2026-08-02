namespace WareFlow.Domain.Entities;

public sealed class StockTransaction
{
    private StockTransaction()
    {
        // Digunakan oleh Entity Framework Core.
    }

    public StockTransaction(
        Guid inventoryStockId,
        Guid productId,
        Guid warehouseId,
        StockTransactionType type,
        int quantity,
        int balanceAfter)
    {
        if (inventoryStockId == Guid.Empty)
        {
            throw new ArgumentException(
                "Inventory stock is required.",
                nameof(inventoryStockId)
            );
        }

        if (productId == Guid.Empty)
        {
            throw new ArgumentException(
                "Product is required.",
                nameof(productId)
            );
        }

        if (warehouseId == Guid.Empty)
        {
            throw new ArgumentException(
                "Warehouse is required.",
                nameof(warehouseId)
            );
        }

        if (quantity <= 0)
        {
            throw new ArgumentException(
                "Transaction quantity must be greater than zero.",
                nameof(quantity)
            );
        }

        if (balanceAfter < 0)
        {
            throw new ArgumentException(
                "Stock balance cannot be negative.",
                nameof(balanceAfter)
            );
        }

        Id = Guid.NewGuid();
        InventoryStockId = inventoryStockId;
        ProductId = productId;
        WarehouseId = warehouseId;
        Type = type;
        Quantity = quantity;
        BalanceAfter = balanceAfter;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid InventoryStockId { get; private set; }

    public InventoryStock InventoryStock { get; private set; } = null!;

    public Guid ProductId { get; private set; }

    public Product Product { get; private set; } = null!;

    public Guid WarehouseId { get; private set; }

    public Warehouse Warehouse { get; private set; } = null!;

    public StockTransactionType Type { get; private set; }

    public int Quantity { get; private set; }

    public int BalanceAfter { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }
}