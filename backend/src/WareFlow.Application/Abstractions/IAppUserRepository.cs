using WareFlow.Domain.Entities;

namespace WareFlow.Application.Abstractions;

public interface IAppUserRepository
{
    Task<bool> AnyAsync(
        CancellationToken cancellationToken = default
    );

    Task<AppUser?> GetByEmailForUpdateAsync(
        string email,
        CancellationToken cancellationToken = default
    );

    Task AddAsync(
        AppUser user,
        CancellationToken cancellationToken = default
    );

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default
    );
}