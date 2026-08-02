namespace WareFlow.Application.Stocks;

public interface IInventoryStockService
{
    Task<IReadOnlyList<StockResponse>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task<StockResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<IReadOnlyList<StockTransactionResponse>>
        GetHistoryAsync(
            CancellationToken cancellationToken = default
        );

    Task<StockResponse> StockInAsync(
        StockInCommand command,
        CancellationToken cancellationToken = default
    );

    Task<StockResponse> StockOutAsync(
        StockOutCommand command,
        CancellationToken cancellationToken = default
    );
}