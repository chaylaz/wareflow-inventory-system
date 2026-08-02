using WareFlow.Domain.Entities;

namespace WareFlow.Application.Abstractions;

public interface IStockTransactionRepository
{
    Task<IReadOnlyList<StockTransaction>> GetAllAsync(
        CancellationToken cancellationToken = default
    );

    Task AddAsync(
        StockTransaction transaction,
        CancellationToken cancellationToken = default
    );
}