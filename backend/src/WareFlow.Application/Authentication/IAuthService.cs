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
}