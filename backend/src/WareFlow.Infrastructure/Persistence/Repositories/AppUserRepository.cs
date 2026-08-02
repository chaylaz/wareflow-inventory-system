using Microsoft.EntityFrameworkCore;
using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Infrastructure.Persistence.Repositories;

public sealed class AppUserRepository(
    WareFlowDbContext dbContext
) : IAppUserRepository
{
    public Task<bool> AnyAsync(
        CancellationToken cancellationToken = default)
    {
        return dbContext.Users.AnyAsync(
            cancellationToken
        );
    }

    public Task<AppUser?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Users.FirstOrDefaultAsync(
            user => user.Id == id,
            cancellationToken
        );
    }

    public Task<AppUser?> GetByEmailForUpdateAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail =
            email.Trim().ToLowerInvariant();

        return dbContext.Users.FirstOrDefaultAsync(
            user => user.Email == normalizedEmail,
            cancellationToken
        );
    }

    public async Task AddAsync(
        AppUser user,
        CancellationToken cancellationToken = default)
    {
        await dbContext.Users.AddAsync(
            user,
            cancellationToken
        );
    }

    public Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(
            cancellationToken
        );
    }
}