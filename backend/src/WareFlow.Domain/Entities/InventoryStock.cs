namespace WareFlow.Domain.Entities;

public sealed class InventoryStock
{
    private InventoryStock()
    {
        // Digunakan oleh Entity Framework Core.
    }

    public InventoryStock(
        Guid productId,
        Guid warehouseId,
        int initialQuantity = 0)
    {
        Id = Guid.NewGuid();

        SetProduct(productId);
        SetWarehouse(warehouseId);
        SetInitialQuantity(initialQuantity);

        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid ProductId { get; private set; }

    public Product Product { get; private set; } = null!;

    public Guid WarehouseId { get; private set; }

    public Warehouse Warehouse { get; private set; } = null!;

    public int Quantity { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? UpdatedAtUtc { get; private set; }

    public void Increase(int quantity)
    {
        ValidateAdjustmentQuantity(quantity);

        checked
        {
            Quantity += quantity;
        }

        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    public void Decrease(int quantity)
    {
        ValidateAdjustmentQuantity(quantity);

        if (Quantity < quantity)
        {
            throw new InvalidOperationException(
                $"Insufficient stock. Available quantity is {Quantity}."
            );
        }

        Quantity -= quantity;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }

    private void SetProduct(Guid productId)
    {
        if (productId == Guid.Empty)
        {
            throw new ArgumentException(
                "Product is required.",
                nameof(productId)
            );
        }

        ProductId = productId;
    }

    private void SetWarehouse(Guid warehouseId)
    {
        if (warehouseId == Guid.Empty)
        {
            throw new ArgumentException(
                "Warehouse is required.",
                nameof(warehouseId)
            );
        }

        WarehouseId = warehouseId;
    }

    private void SetInitialQuantity(int initialQuantity)
    {
        if (initialQuantity < 0)
        {
            throw new ArgumentException(
                "Initial stock quantity cannot be negative.",
                nameof(initialQuantity)
            );
        }

        Quantity = initialQuantity;
    }

    private static void ValidateAdjustmentQuantity(
        int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException(
                "Stock adjustment quantity must be greater than zero.",
                nameof(quantity)
            );
        }
    }
}