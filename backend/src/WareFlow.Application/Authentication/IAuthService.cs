namespace WareFlow.Application.Authentication;

public interface IAuthService
{
    Task<AuthenticatedUserResponse>
        SetupInitialAdminAsync(
            SetupInitialAdminCommand command,
            CancellationToken cancellationToken = default
        );

    Task<AuthenticatedUserResponse> LoginAsync(
        LoginCommand command,
        CancellationToken cancellationToken = default
    );

    Task<AuthenticatedUserResponse>
        UpdateProfileAsync(
            Guid userId,
            UpdateProfileCommand command,
            CancellationToken cancellationToken = default
        );

    Task ChangePasswordAsync(
        Guid userId,
        ChangePasswordCommand command,
        CancellationToken cancellationToken = default
    );
}