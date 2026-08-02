using WareFlow.Application.Abstractions;
using WareFlow.Domain.Entities;

namespace WareFlow.Application.Authentication;

public sealed class AuthService(
    IAppUserRepository appUserRepository,
    IPasswordHasher passwordHasher
) : IAuthService
{
    public async Task<AuthenticatedUserResponse>
        SetupInitialAdminAsync(
            SetupInitialAdminCommand command,
            CancellationToken cancellationToken = default)
    {
        var userAlreadyExists =
            await appUserRepository.AnyAsync(
                cancellationToken
            );

        if (userAlreadyExists)
        {
            throw new InitialSetupAlreadyCompletedException();
        }

        var passwordHash =
            passwordHasher.Hash(
                command.Password
            );

        var administrator = new AppUser(
            fullName: command.FullName,
            email: command.Email,
            passwordHash: passwordHash,
            role: "Administrator"
        );

        await appUserRepository.AddAsync(
            administrator,
            cancellationToken
        );

        await appUserRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(
            administrator
        );
    }

    public async Task<AuthenticatedUserResponse>
        LoginAsync(
            LoginCommand command,
            CancellationToken cancellationToken = default)
    {
        if (
            string.IsNullOrWhiteSpace(
                command.Email
            ) ||
            string.IsNullOrWhiteSpace(
                command.Password
            )
        )
        {
            throw new InvalidCredentialsException();
        }

        var user =
            await appUserRepository
                .GetByEmailForUpdateAsync(
                    command.Email,
                    cancellationToken
                );

        if (
            user is null ||
            !user.IsActive ||
            !passwordHasher.Verify(
                command.Password,
                user.PasswordHash
            )
        )
        {
            throw new InvalidCredentialsException();
        }

        user.RecordSuccessfulLogin();

        await appUserRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(user);
    }

    public async Task<AuthenticatedUserResponse>
        UpdateProfileAsync(
            Guid userId,
            UpdateProfileCommand command,
            CancellationToken cancellationToken = default)
    {
        var user =
            await GetActiveUserForUpdateAsync(
                userId,
                cancellationToken
            );

        user.UpdateFullName(
            command.FullName
        );

        await appUserRepository.SaveChangesAsync(
            cancellationToken
        );

        return MapToResponse(user);
    }

    public async Task ChangePasswordAsync(
        Guid userId,
        ChangePasswordCommand command,
        CancellationToken cancellationToken = default)
    {
        var user =
            await GetActiveUserForUpdateAsync(
                userId,
                cancellationToken
            );

        var currentPasswordIsValid =
            passwordHasher.Verify(
                command.CurrentPassword,
                user.PasswordHash
            );

        if (!currentPasswordIsValid)
        {
            throw new CurrentPasswordIncorrectException();
        }

        var newPasswordMatchesCurrentPassword =
            passwordHasher.Verify(
                command.NewPassword,
                user.PasswordHash
            );

        if (newPasswordMatchesCurrentPassword)
        {
            throw new ArgumentException(
                "New password must be different from the current password.",
                nameof(command.NewPassword)
            );
        }

        var newPasswordHash =
            passwordHasher.Hash(
                command.NewPassword
            );

        user.ChangePasswordHash(
            newPasswordHash
        );

        await appUserRepository.SaveChangesAsync(
            cancellationToken
        );
    }

    private async Task<AppUser>
        GetActiveUserForUpdateAsync(
            Guid userId,
            CancellationToken cancellationToken)
    {
        var user =
            await appUserRepository
                .GetByIdForUpdateAsync(
                    userId,
                    cancellationToken
                );

        if (
            user is null ||
            !user.IsActive
        )
        {
            throw new AuthenticatedUserNotFoundException(
                userId
            );
        }

        return user;
    }

    private static AuthenticatedUserResponse
        MapToResponse(AppUser user)
    {
        return new AuthenticatedUserResponse(
            Id: user.Id,
            FullName: user.FullName,
            Email: user.Email,
            Role: user.Role
        );
    }
}