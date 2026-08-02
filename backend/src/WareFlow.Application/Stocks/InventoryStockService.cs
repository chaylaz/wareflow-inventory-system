using WareFlow.Application.Abstractions;
using WareFlow.Application.Products;
using WareFlow.Application.Warehouses;
using WareFlow.Domain.Entities;

namespace WareFlow.Application.Stocks;

public sealed class InventoryStockService(
    IInventoryStockRepository inventoryStockRepository,
    IStockTransactionRepository stockTransactionRepository,
    IProductRepository productRepository,
    IWarehouseRepository warehouseRepository
) : IInventoryStockService
{
    public async Task<IReadOnlyList<StockResponse>>
        GetAllAsync(
            CancellationToken cancellationToken = default)
    {
        var inventoryStocks =
            await inventoryStockRepository.GetAllAsync(
                cancellationToken
            );

        return inventoryStocks
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<StockResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var inventoryStock =
            await inventoryStockRepository.GetByIdAsync(
                id,
                cancellationToken
            );

        return inventoryStock is null
            ? null
            : MapToResponse(inventoryStock);
    }

    public async Task<IReadOnlyList<StockTransactionResponse>>
        GetHistoryAsync(
            CancellationToken cancellationToken = default)
    {
        var transactions =
            await stockTransactionRepository.GetAllAsync(
                cancellationToken
            );

        return transactions
            .Select(MapTransactionToResponse)
            .ToList();
    }

    public async Task<StockResponse> StockInAsync(
        StockInCommand command,
        CancellationToken cancellationToken = default)
    {
        ValidateQuantity(command.Quantity);

        var (product, warehouse) =
            await GetActiveReferencesAsync(
                command.ProductId,
                command.WarehouseId,
                cancellationToken
            );

        var inventoryStock =
            await inventoryStockRepository
                .GetByProductAndWarehouseForUpdateAsync(
                    command.ProductId,
                    command.WarehouseId,
                    cancellationToken
                );

        if (inventoryStock is null)
        {
            inventoryStock = new InventoryStock(
                productId: command.ProductId,
                warehouseId: command.WarehouseId,
                initialQuantity: command.Quantity
            );

            await inventoryStockRepository.AddAsync(
                inventoryStock,
                cancellationToken
            );
        }
        else
        {
            inventoryStock.Increase(command.Quantity);
        }

        var transaction = new StockTransaction(
            inventoryStockId: inventoryStock.Id,
            productId: product.Id,
            warehouseId: warehouse.Id,
            type: StockTransactionType.In,
            quantity: command.Quantity,
            balanceAfter: inventoryStock.Quantity
        );

        await stockTransactionRepository.AddAsync(
            transaction,
            cancellationToken
        );

        await inventoryStockRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(
            inventoryStock,
            product,
            warehouse
        );
    }

    public async Task<StockResponse> StockOutAsync(
        StockOutCommand command,
        CancellationToken cancellationToken = default)
    {
        ValidateQuantity(command.Quantity);

        var (product, warehouse) =
            await GetActiveReferencesAsync(
                command.ProductId,
                command.WarehouseId,
                cancellationToken
            );

        var inventoryStock =
            await inventoryStockRepository
                .GetByProductAndWarehouseForUpdateAsync(
                    command.ProductId,
                    command.WarehouseId,
                    cancellationToken
                );

        if (inventoryStock is null)
        {
            throw new InventoryStockNotFoundException(
                command.ProductId,
                command.WarehouseId
            );
        }

        if (inventoryStock.Quantity < command.Quantity)
        {
            throw new InsufficientStockException(
                availableQuantity: inventoryStock.Quantity,
                requestedQuantity: command.Quantity
            );
        }

        inventoryStock.Decrease(command.Quantity);

        var transaction = new StockTransaction(
            inventoryStockId: inventoryStock.Id,
            productId: product.Id,
            warehouseId: warehouse.Id,
            type: StockTransactionType.Out,
            quantity: command.Quantity,
            balanceAfter: inventoryStock.Quantity
        );

        await stockTransactionRepository.AddAsync(
            transaction,
            cancellationToken
        );

        await inventoryStockRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(
            inventoryStock,
            product,
            warehouse
        );
    }

    private async Task<(Product Product, Warehouse Warehouse)>
        GetActiveReferencesAsync(
            Guid productId,
            Guid warehouseId,
            CancellationToken cancellationToken)
    {
        var product =
            await productRepository.GetByIdAsync(
                productId,
                cancellationToken
            );

        if (product is null)
        {
            throw new ProductNotFoundException(productId);
        }

        if (!product.IsActive)
        {
            throw new ArgumentException(
                "Selected product is inactive.",
                nameof(productId)
            );
        }

        var warehouse =
            await warehouseRepository.GetByIdAsync(
                warehouseId,
                cancellationToken
            );

        if (warehouse is null)
        {
            throw new WarehouseNotFoundException(
                warehouseId
            );
        }

        if (!warehouse.IsActive)
        {
            throw new ArgumentException(
                "Selected warehouse is inactive.",
                nameof(warehouseId)
            );
        }

        return (product, warehouse);
    }

    private static void ValidateQuantity(int quantity)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException(
                "Stock quantity must be greater than zero.",
                nameof(quantity)
            );
        }
    }

    private static StockResponse MapToResponse(
        InventoryStock inventoryStock)
    {
        return MapToResponse(
            inventoryStock,
            inventoryStock.Product,
            inventoryStock.Warehouse
        );
    }

    private static StockResponse MapToResponse(
        InventoryStock inventoryStock,
        Product product,
        Warehouse warehouse)
    {
        var stockStatus =
            inventoryStock.Quantity switch
            {
                0 => "OutOfStock",

                _ when inventoryStock.Quantity
                    <= product.MinimumStock
                    => "LowStock",

                _ => "Available"
            };

        return new StockResponse(
            Id: inventoryStock.Id,
            ProductId: product.Id,
            ProductSku: product.Sku,
            ProductName: product.Name,
            Unit: product.Unit,
            MinimumStock: product.MinimumStock,
            WarehouseId: warehouse.Id,
            WarehouseCode: warehouse.Code,
            WarehouseName: warehouse.Name,
            Quantity: inventoryStock.Quantity,
            StockStatus: stockStatus,
            CreatedAtUtc: inventoryStock.CreatedAtUtc,
            UpdatedAtUtc: inventoryStock.UpdatedAtUtc
        );
    }

    private static StockTransactionResponse
        MapTransactionToResponse(
            StockTransaction transaction)
    {
        var transactionType =
            transaction.Type == StockTransactionType.In
                ? "StockIn"
                : "StockOut";

        return new StockTransactionResponse(
            Id: transaction.Id,
            InventoryStockId:
                transaction.InventoryStockId,
            Type: transactionType,
            ProductId: transaction.ProductId,
            ProductSku: transaction.Product.Sku,
            ProductName: transaction.Product.Name,
            Unit: transaction.Product.Unit,
            WarehouseId: transaction.WarehouseId,
            WarehouseCode:
                transaction.Warehouse.Code,
            WarehouseName:
                transaction.Warehouse.Name,
            Quantity: transaction.Quantity,
            BalanceAfter: transaction.BalanceAfter,
            CreatedAtUtc: transaction.CreatedAtUtc
        );
    }
}