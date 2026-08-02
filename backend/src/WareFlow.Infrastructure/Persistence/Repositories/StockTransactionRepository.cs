using Microsoft.EntityFrameworkCore;
using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Repositories;

public sealed class StockTransactionRepository(
    WareFlowDbContext dbContext
) : IStockTransactionRepository
{
    public async Task<IReadOnlyList<StockTransaction>>
        GetAllAsync(
            CancellationToken cancellationToken = default)
    {
        return await dbContext.StockTransactions
            .AsNoTracking()
            .Include(transaction => transaction.Product)
            .Include(transaction => transaction.Warehouse)
            .OrderByDescending(
                transaction => transaction.CreatedAtUtc
            )
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        StockTransaction transaction,
        CancellationToken cancellationToken = default)
    {
        await dbContext.StockTransactions.AddAsync(
            transaction,
            cancellationToken
        );
    }
}