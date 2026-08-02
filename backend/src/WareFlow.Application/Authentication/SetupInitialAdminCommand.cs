namespace WareFlow.Application.Authentication;

public sealed record SetupInitialAdminCommand(
    string FullName,
    string Email,
    string Password
);